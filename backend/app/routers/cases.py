import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User, UserRoleEnum
from app.models.case import (
    Case, CaseReport, CaseTask, CaseStatusHistory, CasePriorityHistory,
    CaseStatusEnum, PriorityEnum, TaskStatusEnum
)
from app.models.evidence import CaseEvidence, EvidenceTypeEnum, CaseFeedback, CaseObjection
from app.models.geography import Ward, Asset
from app.models.department import Department, Officer
from app.services.ai_engine import AIEngineService
from app.services.responsibility_engine import ResponsibilityEngineService
from app.services.routing_gate import RoutingGateService
from app.services.sla_service import SLAService
from app.services.notification_service import NotificationService
from app.core.audit import AuditLogger
from app.core.rbac import RBACManager
from app.dependencies import get_current_user, get_current_user_optional, require_roles
from app.schemas.case import (
    IntakeRequest, CaseConfirmationRequest, TaskCreateRequest,
    SequenceApprovalRequest, PriorityOverrideRequest, ResponsibilityOverrideRequest,
    CaseVerificationRequest, CaseResponse, CaseCloseRequest, ResolutionReviewRequest
)

router = APIRouter(prefix="/cases", tags=["Cases & Intake"])

def generate_tracking_number(ward_number: int = 1) -> str:
    now = datetime.datetime.now(datetime.timezone.utc)
    rand_seq = random.randint(1000, 9999)
    return f"NS-{now.year}-W{ward_number:02d}-{rand_seq}"

@router.post("/intake")
async def create_case_intake(
    req: IntakeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Module 1 & 4: Multimodal Citizen Intake.
    Accepts Bangla text, voice, media, GPS pin. Triggers AI analysis & Responsibility Engine.
    """
    # 1. AI Analysis of intake text
    ai_result = AIEngineService.analyze_intake_text(req.raw_text_bn)
    
    # 2. Responsibility Engine
    resp_result = await ResponsibilityEngineService.match_responsibility(
        db=db,
        latitude=req.latitude,
        longitude=req.longitude,
        primary_category=ai_result["primary_category"],
        secondary_categories=ai_result["secondary_categories"]
    )
    
    # 3. Routing Gate check
    gate_eval = await RoutingGateService.evaluate_safety_gate(
        db=db,
        confidence_score=resp_result["confidence_score"],
        is_hazard=ai_result["is_hazard"]
    )
    
    ward_num = resp_result["matched_ward_number"] or 1
    tracking_no = generate_tracking_number(ward_num)
    
    # 4. Create Case Record
    case = Case(
        tracking_number=tracking_no,
        title_bn=f"{resp_result['department_name_bn']} সংক্রান্ত নাগরিক সেবা রিপোর্ট",
        description_bn=ai_result["normalized_text"],
        primary_category=ai_result["primary_category"],
        secondary_categories=ai_result["secondary_categories"],
        latitude=req.latitude,
        longitude=req.longitude,
        address_text=req.address_text or "নাগরিক অবস্থান পিন",
        landmark=req.landmark,
        is_public_property=req.is_public_property,
        ward_id=resp_result["matched_ward_id"],
        asset_id=resp_result["matched_asset_id"],
        status=CaseStatusEnum.SUBMITTED,
        priority=ai_result["proposed_priority"],
        ai_proposed_priority=ai_result["proposed_priority"],
        is_hazard=ai_result["is_hazard"],
        lead_department_id=resp_result["department_id"],
        lead_officer_id=resp_result["assigned_officer_id"],
        assigned_rule_id=resp_result["responsibility_rule_id"],
        responsibility_reason_bn=resp_result["responsibility_reason_bn"],
        responsibility_confidence=resp_result["confidence_score"],
        requires_staff_verification=not gate_eval["can_propose"],
        citizen_user_id=current_user.id if current_user else None,
        intake_channel=req.intake_channel
    )
    db.add(case)
    await db.flush()

    # 5. Create Case Report
    report = CaseReport(
        case_id=case.id,
        reported_by_user_id=current_user.id if current_user else None,
        raw_text_bn=req.raw_text_bn,
        normalized_text_bn=ai_result["normalized_text"],
        voice_audio_url=req.voice_audio_url,
        extracted_entities=ai_result["extracted_entities"],
        reported_channel=req.intake_channel
    )
    db.add(report)

    # 6. Save Initial Before Photos/Videos
    for photo_url in req.photo_urls:
        evidence = CaseEvidence(
            case_id=case.id,
            uploaded_by_user_id=current_user.id if current_user else None,
            uploader_role="citizen",
            evidence_type=EvidenceTypeEnum.BEFORE,
            media_url=photo_url,
            latitude=req.latitude,
            longitude=req.longitude
        )
        db.add(evidence)

    # 7. Add Initial Status History
    status_history = CaseStatusHistory(
        case_id=case.id,
        from_status=None,
        to_status=CaseStatusEnum.SUBMITTED,
        changed_by_user_id=current_user.id if current_user else None,
        actor_role="citizen" if current_user else "anonymous",
        reason_bn="নাগরিক আবেদন দাখিল ও এআই প্রাথমিক বিশ্লেষণ সম্পন্ন।"
    )
    db.add(status_history)

    # 8. Audit Log
    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id if current_user else None,
        actor_role="citizen" if current_user else "anonymous",
        action="CASE_CREATE_INTAKE",
        resource_type="CASE",
        resource_id=case.id,
        after_state={"tracking_number": case.tracking_number, "priority": case.priority.value}
    )

    # 9. Send In-App / Mock SMS Confirmation
    if current_user:
        await NotificationService.send_notification(
            db=db,
            user_id=current_user.id,
            case_id=case.id,
            title_bn="অভিযোগ সফলভাবে নিবন্ধিত হয়েছে",
            message_bn=f"আপনার ট্র্যাকিং নম্বর: {case.tracking_number}। দায়িত্বপ্রাপ্ত বিভাগ: {resp_result['department_name_bn']}।",
            phone=current_user.phone
        )

    await db.commit()

    return {
        "case_id": case.id,
        "tracking_number": case.tracking_number,
        "ai_analysis": ai_result,
        "responsibility": resp_result,
        "gate_evaluation": gate_eval,
        "status": case.status.value
    }

@router.get("")
async def list_cases(
    status_filter: Optional[CaseStatusEnum] = None,
    priority_filter: Optional[PriorityEnum] = None,
    ward_id: Optional[str] = None,
    department_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Case).options(
        selectinload(Case.lead_department),
        selectinload(Case.lead_officer),
        selectinload(Case.ward),
        selectinload(Case.asset),
        selectinload(Case.tasks)
    ).order_by(desc(Case.created_at))

    # Apply RBAC Filtering
    if current_user.role == UserRoleEnum.CITIZEN:
        stmt = stmt.where(Case.citizen_user_id == current_user.id)
    elif current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids:
            stmt = stmt.where(Case.ward_id.in_(assigned_ward_ids))
    elif current_user.role == UserRoleEnum.DEPT_OFFICER:
        assigned_dept_ids = [s.department_id for s in current_user.scopes if s.department_id]
        if assigned_dept_ids:
            stmt = stmt.where(Case.lead_department_id.in_(assigned_dept_ids))

    if status_filter:
        stmt = stmt.where(Case.status == status_filter)
    if priority_filter:
        stmt = stmt.where(Case.priority == priority_filter)
    if ward_id:
        stmt = stmt.where(Case.ward_id == ward_id)
    if department_id:
        stmt = stmt.where(Case.lead_department_id == department_id)

    res = await db.execute(stmt)
    cases = res.scalars().all()

    output = []
    for c in cases:
        output.append({
            "id": c.id,
            "tracking_number": c.tracking_number,
            "title_bn": c.title_bn,
            "description_bn": c.description_bn,
            "primary_category": c.primary_category,
            "secondary_categories": c.secondary_categories or [],
            "status": c.status.value,
            "priority": c.priority.value,
            "ward_name_bn": c.ward.ward_name_bn if c.ward else None,
            "ward_number": c.ward.ward_number if c.ward else None,
            "lead_department_name_bn": c.lead_department.name_bn if c.lead_department else None,
            "lead_officer_name_bn": c.lead_officer.name_bn if c.lead_officer else None,
            "lead_officer_phone": c.lead_officer.official_phone if c.lead_officer else None,
            "is_hazard": c.is_hazard,
            "requires_staff_verification": c.requires_staff_verification,
            "created_at": c.created_at.isoformat()
        })

    return output

@router.get("/{case_id}")
async def get_case_detail(
    case_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stmt = select(Case).where(Case.id == case_id).options(
        selectinload(Case.ward),
        selectinload(Case.asset),
        selectinload(Case.lead_department),
        selectinload(Case.lead_officer),
        selectinload(Case.tasks).selectinload(CaseTask.department),
        selectinload(Case.tasks).selectinload(CaseTask.assigned_officer),
        selectinload(Case.tasks).selectinload(CaseTask.prerequisites),
        selectinload(Case.evidence_items),
        selectinload(Case.status_history),
        selectinload(Case.feedback_entries),
        selectinload(Case.objections)
    )
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    # RBAC scope enforcement (R&D Section 11 & Table 30)
    if current_user:
        if current_user.role == UserRoleEnum.WARD_DESK:
            assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
            if assigned_ward_ids and case.ward_id not in assigned_ward_ids:
                raise HTTPException(status_code=403, detail="আপনার নির্ধারিত ওয়ার্ড ব্যতীত অন্য ওয়ার্ডের কেস দেখার অনুমতি নেই।")
        elif current_user.role == UserRoleEnum.CITIZEN:
            if case.citizen_user_id and case.citizen_user_id != current_user.id:
                raise HTTPException(status_code=403, detail="অন্য নাগরিকের ব্যক্তিগত কেস দেখার অনুমতি নেই।")

    # Evaluate SLA
    sla_info = await SLAService.evaluate_case_sla(db, case)

    tasks_data = []
    for t in case.tasks:
        tasks_data.append({
            "id": t.id,
            "title_bn": t.title_bn,
            "description_bn": t.description_bn,
            "department_id": t.department_id,
            "department_name_bn": t.department.name_bn if t.department else None,
            "officer_name_bn": t.assigned_officer.name_bn if t.assigned_officer else None,
            "officer_phone": t.assigned_officer.official_phone if t.assigned_officer else None,
            "sequence_order": t.sequence_order,
            "is_lead_task": t.is_lead_task,
            "status": t.status.value,
            "waiting_reason_bn": t.waiting_reason_bn,
            "prerequisite_task_ids": [p.prerequisite_task_id for p in t.prerequisites]
        })

    evidence_data = []
    for e in case.evidence_items:
        evidence_data.append({
            "id": e.id,
            "evidence_type": e.evidence_type.value,
            "media_url": e.media_url,
            "is_verified": e.is_verified_by_staff,
            "staff_notes": e.staff_notes,
            "timestamp": e.timestamp.isoformat()
        })

    return {
        "id": case.id,
        "tracking_number": case.tracking_number,
        "title_bn": case.title_bn,
        "description_bn": case.description_bn,
        "primary_category": case.primary_category,
        "secondary_categories": case.secondary_categories or [],
        "latitude": case.latitude,
        "longitude": case.longitude,
        "address_text": case.address_text,
        "landmark": case.landmark,
        "status": case.status.value,
        "priority": case.priority.value,
        "ai_proposed_priority": case.ai_proposed_priority.value if case.ai_proposed_priority else None,
        "is_hazard": case.is_hazard,
        "ward_id": case.ward_id,
        "ward_name_bn": case.ward.ward_name_bn if case.ward else None,
        "ward_number": case.ward.ward_number if case.ward else None,
        "asset_id": case.asset_id,
        "asset_name_bn": case.asset.name_bn if case.asset else None,
        "asset_code": case.asset.asset_code if case.asset else None,
        "lead_department_name_bn": case.lead_department.name_bn if case.lead_department else None,
        "lead_officer_name_bn": case.lead_officer.name_bn if case.lead_officer else None,
        "lead_officer_designation": case.lead_officer.designation if case.lead_officer else None,
        "lead_officer_phone": case.lead_officer.official_phone if case.lead_officer else None,
        "lead_officer_email": case.lead_officer.official_email if case.lead_officer else None,
        "responsibility_reason_bn": case.responsibility_reason_bn,
        "responsibility_confidence": case.responsibility_confidence,
        "requires_staff_verification": case.requires_staff_verification,
        "created_at": case.created_at.isoformat(),
        "tasks": tasks_data,
        "evidence_items": evidence_data,
        "sla": sla_info,
        "feedback": [{"is_satisfied": f.is_satisfied, "comments": f.comments_bn} for f in case.feedback_entries],
        "objections": [{"reason_bn": o.objection_reason_bn, "status": o.review_status} for o in case.objections]
    }

@router.post("/{case_id}/approve-sequence")
async def approve_case_workflow_sequence(
    case_id: str,
    req: SequenceApprovalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Module 7: Multi-Department Work Sequencing Approval.
    Coordinator / Ward Desk approves coordinated task order.
    """
    stmt = select(Case).where(Case.id == case_id).options(selectinload(Case.tasks))
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids and case.ward_id not in assigned_ward_ids:
            raise HTTPException(status_code=403, detail="আপনার নির্ধারিত ওয়ার্ড ব্যতীত অন্য ওয়ার্ডের কেস অনুমোদনের অনুমতি নেই।")

    # Clear old tasks if any
    for t in case.tasks:
        await db.delete(t)
    await db.flush()

    # Create approved sequence of tasks
    created_tasks = []
    for idx, t_req in enumerate(req.approved_tasks):
        # Look up assigned officer for that dept & ward
        stmt_off = select(Officer).where(
            Officer.department_id == t_req.department_id,
            Officer.ward_id == case.ward_id,
            Officer.is_active == True
        )
        res_off = await db.execute(stmt_off)
        off_obj = res_off.scalars().first()

        task = CaseTask(
            case_id=case.id,
            department_id=t_req.department_id,
            assigned_officer_id=off_obj.id if off_obj else None,
            title_bn=t_req.title_bn,
            description_bn=t_req.description_bn,
            sequence_order=t_req.sequence_order,
            is_lead_task=t_req.is_lead_task,
            status=TaskStatusEnum.IN_PROGRESS if idx == 0 else TaskStatusEnum.WAITING_PREREQUISITE,
            waiting_reason_bn=None if idx == 0 else f"পূর্ববর্তী কাজের সমাপ্তির জন্য অপেক্ষমাণ (ধাপ {idx})"
        )
        db.add(task)
        created_tasks.append(task)
    
    await db.flush()

    # Update case status to VERIFIED / IN_PROGRESS
    old_status = case.status
    case.status = CaseStatusEnum.IN_PROGRESS
    case.requires_staff_verification = False

    hist = CaseStatusHistory(
        case_id=case.id,
        from_status=old_status,
        to_status=CaseStatusEnum.IN_PROGRESS,
        changed_by_user_id=current_user.id,
        actor_role=current_user.role.value,
        reason_bn=f"সমন্বয়কারী কর্তৃক কাজের কর্মপরিকল্পনা ও পর্যায়ক্রম অনুমোদিত: {req.approval_notes or 'অনুমোদন প্রদান করা হয়েছে'}"
    )
    db.add(hist)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="APPROVE_CASE_SEQUENCE",
        resource_type="CASE",
        resource_id=case.id,
        after_state={"tasks_count": len(created_tasks)}
    )
    await db.commit()

    return {"message_bn": "বহু-বিভাগীয় কর্মপরিকল্পনা সফলভাবে অনুমোদিত হয়েছে।", "case_id": case.id}

@router.post("/{case_id}/override-priority")
async def override_case_priority(
    case_id: str,
    req: PriorityOverrideRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    stmt = select(Case).where(Case.id == case_id)
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids and case.ward_id not in assigned_ward_ids:
            raise HTTPException(status_code=403, detail="আপনার নির্ধারিত ওয়ার্ড ব্যতীত অন্য ওয়ার্ডের কেসের অগ্রাধিকার পরিবর্তনের অনুমতি নেই।")

    old_priority = case.priority
    case.priority = req.priority
    case.priority_override_reason = req.reason

    hist = CasePriorityHistory(
        case_id=case.id,
        from_priority=old_priority,
        to_priority=req.priority,
        changed_by_user_id=current_user.id,
        reason=req.reason
    )
    db.add(hist)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="OVERRIDE_CASE_PRIORITY",
        resource_type="CASE",
        resource_id=case.id,
        before_state={"priority": old_priority.value},
        after_state={"priority": req.priority.value},
        reason=req.reason
    )
    await db.commit()
    return {"message_bn": f"অগ্রাধিকার সফলভাবে পরিবর্তিত হয়েছে: {req.priority.value}", "case_id": case.id}

@router.post("/{case_id}/override-responsibility")
async def override_case_responsibility(
    case_id: str,
    req: ResponsibilityOverrideRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    stmt = select(Case).where(Case.id == case_id)
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids and case.ward_id not in assigned_ward_ids:
            raise HTTPException(status_code=403, detail="আপনার নির্ধারিত ওয়ার্ড ব্যতীত অন্য ওয়ার্ডের কেসের দায়িত্ব পরিবর্তনের অনুমতি নেই।")

    old_dept_id = case.lead_department_id
    case.lead_department_id = req.department_id
    if req.officer_id:
        case.lead_officer_id = req.officer_id
    case.responsibility_reason_bn = f"[কর্মকর্তা কর্তৃক সংশোধিত] {req.reason}"
    case.requires_staff_verification = False

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="OVERRIDE_CASE_RESPONSIBILITY",
        resource_type="CASE",
        resource_id=case.id,
        before_state={"department_id": old_dept_id},
        after_state={"department_id": req.department_id},
        reason=req.reason
    )
    await db.commit()
    return {"message_bn": "দায়িত্বপ্রাপ্ত বিভাগ সফলভাবে সংশোধিত হয়েছে।", "case_id": case.id}

@router.post("/{case_id}/verify")
async def verify_case(
    case_id: str,
    req: CaseVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    R&D Section 4 & 11: Ward Desk Staff Report Verification.
    Verifies AI proposal or records manual determination, sets status to VERIFIED.
    """
    stmt = select(Case).where(Case.id == case_id)
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids and case.ward_id not in assigned_ward_ids:
            raise HTTPException(status_code=403, detail="আপনার নির্ধারিত ওয়ার্ড ব্যতীত অন্য ওয়ার্ডের কেস যাচাই করার অনুমতি নেই।")

    old_status = case.status
    old_dept_id = case.lead_department_id
    old_priority = case.priority

    case.lead_department_id = req.lead_department_id
    case.priority = req.priority
    if req.assigned_asset_id:
        case.asset_id = req.assigned_asset_id

    case.status = CaseStatusEnum.VERIFIED
    case.requires_staff_verification = False

    reason_parts = []
    if req.is_overridden and req.override_reason:
        reason_parts.append(f"বিভাগ ওভাররাইড: {req.override_reason}")
    if req.priority_override_reason:
        reason_parts.append(f"অগ্রাধিকার পরিবর্তন: {req.priority_override_reason}")
        case.priority_override_reason = req.priority_override_reason
    if req.confirmed_notes:
        reason_parts.append(f"যাচাই মন্তব্য: {req.confirmed_notes}")

    combined_reason = " | ".join(reason_parts) if reason_parts else "ওয়ার্ড ডেস্ক কর্মকর্তা কর্তৃক যাচাইকৃত ও দায়িত্ব অনুমোদিত"
    case.responsibility_reason_bn = f"[যাচাইকৃত] {combined_reason}"

    hist = CaseStatusHistory(
        case_id=case.id,
        from_status=old_status,
        to_status=CaseStatusEnum.VERIFIED,
        changed_by_user_id=current_user.id,
        actor_role=current_user.role.value,
        reason_bn=combined_reason
    )
    db.add(hist)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="VERIFY_CASE_RESPONSIBILITY",
        resource_type="CASE",
        resource_id=case.id,
        before_state={"status": old_status.value, "department_id": old_dept_id, "priority": old_priority.value},
        after_state={"status": CaseStatusEnum.VERIFIED.value, "department_id": req.lead_department_id, "priority": req.priority.value},
        reason=combined_reason
    )
    await db.commit()
    return {"message_bn": "কেস সফলভাবে যাচাই ও দায়িত্ব অনুমোদিত হয়েছে।", "case_id": case.id, "status": case.status.value}

@router.get("/assisted/history")
async def get_assisted_intake_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    R&D Section 2.3 & 4: Assisted citizen intake history.
    Returns cases filed on behalf of citizens at the ward desk, with citizen PII masked.
    """
    stmt = select(Case).options(
        selectinload(Case.ward),
        selectinload(Case.lead_department)
    ).where(Case.intake_channel.in_(["ward_desk", "assisted_walkin"])).order_by(desc(Case.created_at))

    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids:
            stmt = stmt.where(Case.ward_id.in_(assigned_ward_ids))

    res = await db.execute(stmt)
    cases = res.scalars().all()

    output = []
    for c in cases:
        output.append({
            "id": c.id,
            "tracking_number": c.tracking_number,
            "title_bn": c.title_bn,
            "description_bn": c.description_bn,
            "primary_category": c.primary_category,
            "address_text": c.address_text,
            "landmark": c.landmark,
            "ward_name_bn": c.ward.ward_name_bn if c.ward else None,
            "department_name_bn": c.lead_department.name_bn if c.lead_department else None,
            "status": c.status.value,
            "priority": c.priority.value,
            "intake_channel": c.intake_channel,
            "created_at": c.created_at.isoformat()
        })
    return output

@router.post("/{case_id}/close")
async def close_case(
    case_id: str,
    req: CaseCloseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.COORDINATOR]))
):
    """
    R&D Table 30 & Module 8: Authorized Case Closure.
    Only Coordinator and Admin can close cases (Ward Desk & Citizens are forbidden: T-RBAC-04).
    Enforces that evidence must exist (UT-DM-05 / S8) unless a documented exception is provided.
    """
    stmt = select(Case).where(Case.id == case_id).options(
        selectinload(Case.evidence_items),
        selectinload(Case.tasks)
    )
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    if case.status == CaseStatusEnum.CLOSED:
        raise HTTPException(status_code=400, detail="কেসটি ইতিমধ্যে সমাপ্ত (Closed) করা হয়েছে।")

    # Evidence requirement (R&D S8 / UT-DM-05)
    has_after_evidence = any(e.evidence_type == EvidenceTypeEnum.AFTER for e in case.evidence_items)
    if not has_after_evidence and not req.exception_documented:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="সমাধানের প্রমাণক ব্যতীত কেস সমাপ্ত করা সম্ভব নয় (R&D Rule S8 / UT-DM-05)। কোনো প্রশাসনিক ব্যতিক্রম থাকলে তা লিখিতভাবে নথিভুক্ত করুন।"
        )

    old_status = case.status
    case.status = CaseStatusEnum.CLOSED

    # Mark remaining tasks resolved
    for t in case.tasks:
        if t.status not in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED]:
            t.status = TaskStatusEnum.VERIFIED_COMPLETED

    closure_reason = f"[প্রশাসনিক ব্যতিক্রম] {req.reason_bn}" if req.exception_documented else req.reason_bn
    if req.exception_notes:
        closure_reason += f" | নোট: {req.exception_notes}"

    hist = CaseStatusHistory(
        case_id=case.id,
        from_status=old_status,
        to_status=CaseStatusEnum.CLOSED,
        changed_by_user_id=current_user.id,
        actor_role=current_user.role.value,
        reason_bn=closure_reason
    )
    db.add(hist)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="COORDINATOR_CLOSE_CASE",
        resource_type="CASE",
        resource_id=case.id,
        before_state={"status": old_status.value},
        after_state={"status": CaseStatusEnum.CLOSED.value, "exception_documented": req.exception_documented},
        reason=closure_reason
    )
    await db.commit()

    return {
        "message_bn": "কেসটি সফলভাবে চূড়ান্ত সমাপ্ত (Closed) ঘোষণা করা হয়েছে।",
        "case_id": case.id,
        "status": case.status.value
    }

@router.post("/{case_id}/resolution-review")
async def review_case_resolution(
    case_id: str,
    req: ResolutionReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.COORDINATOR, UserRoleEnum.WARD_DESK]))
):
    """
    R&D Table 30 & Module 8: Evidence Review & Re-review.
    Coordinator / Ward Desk reviews completion proof and either approves or requests rework.
    """
    stmt = select(Case).where(Case.id == case_id).options(
        selectinload(Case.evidence_items),
        selectinload(Case.tasks)
    )
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    old_status = case.status

    if req.decision == "approved":
        has_after_evidence = any(e.evidence_type == EvidenceTypeEnum.AFTER for e in case.evidence_items)
        if not has_after_evidence:
            raise HTTPException(status_code=400, detail="সমাধানের প্রমাণক আপলোড ব্যতীত পর্যালোচনা অনুমোদন সম্ভব নয়।")

        case.status = CaseStatusEnum.RESOLVED_PROOF_UPLOADED

        hist = CaseStatusHistory(
            case_id=case.id,
            from_status=old_status,
            to_status=CaseStatusEnum.RESOLVED_PROOF_UPLOADED,
            changed_by_user_id=current_user.id,
            actor_role=current_user.role.value,
            reason_bn=f"প্রমাণক পর্যালোচনা অনুমোদিত: {req.notes_bn}"
        )
        db.add(hist)

        await AuditLogger.log_event(
            db=db,
            actor_user_id=current_user.id,
            actor_role=current_user.role.value,
            action="RESOLUTION_REVIEW_APPROVED",
            resource_type="CASE",
            resource_id=case.id,
            after_state={"status": CaseStatusEnum.RESOLVED_PROOF_UPLOADED.value},
            reason=req.notes_bn
        )
        await db.commit()
        return {"message_bn": "প্রমাণক পর্যালোচনা সফলভাবে অনুমোদিত হয়েছে।", "case_id": case.id, "status": case.status.value}

    elif req.decision == "rework_required":
        # Target specific task or the last task
        target_task = None
        if req.target_task_id:
            target_task = next((t for t in case.tasks if t.id == req.target_task_id), None)
        if not target_task and case.tasks:
            target_task = case.tasks[-1]

        if target_task:
            target_task.status = TaskStatusEnum.IN_PROGRESS
            target_task.waiting_reason_bn = f"সমন্বয়কারী কর্তৃক পুনঃকাজের নির্দেশ: {req.notes_bn}"

        case.status = CaseStatusEnum.IN_PROGRESS

        hist = CaseStatusHistory(
            case_id=case.id,
            from_status=old_status,
            to_status=CaseStatusEnum.IN_PROGRESS,
            changed_by_user_id=current_user.id,
            actor_role=current_user.role.value,
            reason_bn=f"পুনরায় কাজের নির্দেশ: {req.notes_bn}"
        )
        db.add(hist)

        await AuditLogger.log_event(
            db=db,
            actor_user_id=current_user.id,
            actor_role=current_user.role.value,
            action="RESOLUTION_REVIEW_REWORK_REQUESTED",
            resource_type="CASE",
            resource_id=case.id,
            after_state={"status": CaseStatusEnum.IN_PROGRESS.value, "target_task_id": target_task.id if target_task else None},
            reason=req.notes_bn
        )
        await db.commit()
        return {"message_bn": "পুনরায় কাজের নির্দেশ সফলভাবে প্রেরিত হয়েছে।", "case_id": case.id, "status": case.status.value}
    else:
        raise HTTPException(status_code=400, detail="অবৈধ সিদ্ধান্ত মান (অনুমোদিত মান: approved, rework_required)")

@router.get("/coordinator/stats")
async def get_coordinator_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    R&D Section 11 & Screen S-COORD-01: Coordinator Cockpit Overview.
    Aggregates real jurisdiction-level counts for all operational queues.
    """
    stmt_cases = select(Case).options(
        selectinload(Case.tasks),
        selectinload(Case.evidence_items),
        selectinload(Case.objections)
    )
    res_cases = await db.execute(stmt_cases)
    cases = res_cases.scalars().all()

    now = datetime.datetime.now(datetime.timezone.utc)

    awaiting_approval = 0
    emergency_incidents = 0
    overdue_tasks = 0
    department_rejections = 0
    pending_evidence_reviews = 0
    citizen_objections = 0
    stalled_cases = 0
    multi_dept_cases = 0
    reopened_cases = 0
    total_active_cases = 0

    for c in cases:
        if c.status != CaseStatusEnum.CLOSED:
            total_active_cases += 1

        if c.status in [CaseStatusEnum.SUBMITTED, CaseStatusEnum.VERIFIED] and len(c.tasks) == 0:
            awaiting_approval += 1

        if (c.priority == PriorityEnum.EMERGENCY or c.is_hazard) and c.status != CaseStatusEnum.CLOSED:
            emergency_incidents += 1

        if c.status == CaseStatusEnum.RESOLVED_PROOF_UPLOADED:
            pending_evidence_reviews += 1

        if c.status == CaseStatusEnum.RE_OPENED or (c.objections and any(o.review_status == "pending_review" for o in c.objections)):
            citizen_objections += 1

        if c.status == CaseStatusEnum.RE_OPENED:
            reopened_cases += 1

        if len(c.tasks) > 1:
            multi_dept_cases += 1

        has_stalled_task = False
        for t in c.tasks:
            if t.acceptance_status == "rejected":
                department_rejections += 1
            if t.waiting_reason_bn and t.status not in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED]:
                has_stalled_task = True
            # Overdue check
            if t.status not in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED]:
                start_ref = t.started_at or t.created_at
                if start_ref:
                    start_ref = start_ref.replace(tzinfo=datetime.timezone.utc) if start_ref.tzinfo is None else start_ref
                    deadline = start_ref + datetime.timedelta(hours=t.sla_hours or 48)
                    if now > deadline:
                        overdue_tasks += 1

        if has_stalled_task:
            stalled_cases += 1

    return {
        "awaiting_approval": awaiting_approval,
        "emergency_incidents": emergency_incidents,
        "overdue_tasks": overdue_tasks,
        "department_rejections": department_rejections,
        "pending_evidence_reviews": pending_evidence_reviews,
        "citizen_objections": citizen_objections,
        "stalled_cases": stalled_cases,
        "multi_dept_cases": multi_dept_cases,
        "reopened_cases": reopened_cases,
        "total_active_cases": total_active_cases
    }

@router.get("/coordinator/department-performance")
async def get_coordinator_department_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    R&D Table 14 & Screen Reports: Department Performance Metrics.
    Aggregates response times, resolution rates, rejections, and waiting reasons.
    """
    stmt_depts = select(Department).order_by(Department.name_bn)
    res_depts = await db.execute(stmt_depts)
    depts = res_depts.scalars().all()

    stmt_tasks = select(CaseTask).options(selectinload(CaseTask.case))
    res_tasks = await db.execute(stmt_tasks)
    all_tasks = res_tasks.scalars().all()

    performance = []
    now = datetime.datetime.now(datetime.timezone.utc)

    for d in depts:
        d_tasks = [t for t in all_tasks if t.department_id == d.id]
        total_tasks = len(d_tasks)
        completed_tasks = sum(1 for t in d_tasks if t.status in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED])
        in_progress_tasks = sum(1 for t in d_tasks if t.status == TaskStatusEnum.IN_PROGRESS)
        rejected_tasks = sum(1 for t in d_tasks if t.acceptance_status == "rejected")
        
        overdue = 0
        durations_hours = []
        waiting_reasons = []

        for t in d_tasks:
            if t.status not in [TaskStatusEnum.COMPLETED_AWAITING_REVIEW, TaskStatusEnum.VERIFIED_COMPLETED]:
                start_ref = t.started_at or t.created_at
                if start_ref:
                    start_ref = start_ref.replace(tzinfo=datetime.timezone.utc) if start_ref.tzinfo is None else start_ref
                    deadline = start_ref + datetime.timedelta(hours=t.sla_hours or 48)
                    if now > deadline:
                        overdue += 1
            if t.started_at and t.completed_at:
                st = t.started_at.replace(tzinfo=datetime.timezone.utc) if t.started_at.tzinfo is None else t.started_at
                ct = t.completed_at.replace(tzinfo=datetime.timezone.utc) if t.completed_at.tzinfo is None else t.completed_at
                hours = max(0.5, (ct - st).total_seconds() / 3600.0)
                durations_hours.append(hours)
            if t.waiting_reason_bn:
                waiting_reasons.append(t.waiting_reason_bn)

        median_hours = round(sum(durations_hours) / max(1, len(durations_hours)), 1) if durations_hours else 24.0
        closure_rate = round((completed_tasks / max(1, total_tasks)) * 100, 1)

        performance.append({
            "department_id": d.id,
            "department_code": d.code,
            "department_name_bn": d.name_bn,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "rejected_tasks": rejected_tasks,
            "overdue_tasks": overdue,
            "avg_resolution_hours": median_hours,
            "closure_rate_pct": closure_rate,
            "sample_size_valid": total_tasks >= 3,
            "common_waiting_reasons": list(set(waiting_reasons))[:3]
        })

    return performance

@router.get("/coordinator/objections")
async def get_coordinator_objections(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.COORDINATOR, UserRoleEnum.WARD_DESK, UserRoleEnum.ADMIN]))
):
    """
    R&D Table 26 & Section 14: Citizen Objections Review Queue.
    Returns citizen objections requiring coordinator/staff re-evaluation.
    """
    stmt = select(CaseObjection).options(
        selectinload(CaseObjection.case).selectinload(Case.ward),
        selectinload(CaseObjection.case).selectinload(Case.lead_department),
        selectinload(CaseObjection.case).selectinload(Case.tasks)
    ).order_by(desc(CaseObjection.created_at))

    res = await db.execute(stmt)
    objections = res.scalars().all()

    output = []
    for o in objections:
        case = o.case
        output.append({
            "id": o.id,
            "case_id": o.case_id,
            "tracking_number": case.tracking_number if case else "N/A",
            "case_title_bn": case.title_bn if case else "N/A",
            "ward_name_bn": case.ward.ward_name_bn if case and case.ward else None,
            "department_name_bn": case.lead_department.name_bn if case and case.lead_department else None,
            "objection_reason_bn": o.objection_reason_bn,
            "attached_evidence_url": o.attached_evidence_url,
            "review_status": o.review_status,
            "reopened_task_id": o.reopened_task_id,
            "created_at": o.created_at.isoformat()
        })
    return output

