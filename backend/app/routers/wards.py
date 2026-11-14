from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.geography import Ward
from app.models.case import Case, CaseTask, CaseStatusEnum, PriorityEnum, TaskStatusEnum
from app.models.user import User
from app.dependencies import get_current_user_optional
from app.services.sla_service import SLAService

router = APIRouter(prefix="/wards", tags=["Wards & Geography"])

@router.get("")
async def list_wards(db: AsyncSession = Depends(get_db)):
    stmt = select(Ward).order_by(Ward.ward_number)
    res = await db.execute(stmt)
    wards = res.scalars().all()
    return [
        {
            "id": w.id,
            "ward_number": w.ward_number,
            "ward_name_bn": w.ward_name_bn,
            "ward_name_en": w.ward_name_en,
            "zone_code": w.zone_code,
            "councillor_name": w.councillor_name,
            "ward_office_address": w.ward_office_address,
            "contact_phone": w.contact_phone,
            "center_latitude": w.center_latitude,
            "center_longitude": w.center_longitude,
            "boundary_geojson": w.boundary_geojson
        }
        for w in wards
    ]

@router.get("/{ward_id}/stats")
async def get_ward_stats(
    ward_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stmt_w = select(Ward).where(Ward.id == ward_id)
    res_w = await db.execute(stmt_w)
    ward = res_w.scalar_one_or_none()
    if not ward:
        # Fallback by ward number or 404
        stmt_w_num = select(Ward).where(Ward.ward_number == (int(ward_id) if ward_id.isdigit() else 0))
        res_w_num = await db.execute(stmt_w_num)
        ward = res_w_num.scalar_one_or_none()
        if not ward:
            raise HTTPException(status_code=404, detail="ওয়ার্ড পাওয়া যায়নি।")

    stmt_c = select(Case).where(Case.ward_id == ward.id).options(
        selectinload(Case.tasks),
        selectinload(Case.objections)
    )
    res_c = await db.execute(stmt_c)
    cases = res_c.scalars().all()

    total_cases = len(cases)
    pending_verification = sum(1 for c in cases if c.status == CaseStatusEnum.SUBMITTED)
    incomplete_uncertain = sum(1 for c in cases if c.requires_staff_verification or c.responsibility_confidence < 0.80)
    emergency_cases = sum(1 for c in cases if c.priority == PriorityEnum.EMERGENCY)
    high_priority_cases = sum(1 for c in cases if c.priority == PriorityEnum.HIGH)
    in_progress_cases = sum(1 for c in cases if c.status in [CaseStatusEnum.IN_PROGRESS, CaseStatusEnum.UNDER_INSPECTION])
    resolved_cases = sum(1 for c in cases if c.status in [CaseStatusEnum.RESOLVED_PROOF_UPLOADED, CaseStatusEnum.CLOSED])
    reopened_cases = sum(1 for c in cases if c.status == CaseStatusEnum.RE_OPENED)
    duplicate_candidates = sum(1 for c in cases if c.status == CaseStatusEnum.MERGED or c.is_master_case)

    awaiting_acceptance_tasks = 0
    rejected_tasks = 0
    waiting_prerequisite_tasks = 0
    pending_objections = 0
    sla_at_risk = 0

    category_counts = {}
    for c in cases:
        category_counts[c.primary_category] = category_counts.get(c.primary_category, 0) + 1
        for t in c.tasks:
            if t.acceptance_status == "pending_acceptance":
                awaiting_acceptance_tasks += 1
            elif t.acceptance_status == "rejected":
                rejected_tasks += 1
            if t.status == TaskStatusEnum.WAITING_PREREQUISITE:
                waiting_prerequisite_tasks += 1
        for o in c.objections:
            if o.review_status == "pending_review":
                pending_objections += 1
        sla_info = await SLAService.evaluate_case_sla(db, c)
        if sla_info.get("is_breached") or sla_info.get("current_step") in ["reminder", "escalation_1", "escalation_2", "emergency_alert"]:
            sla_at_risk += 1

    return {
        "ward_id": ward.id,
        "ward_number": ward.ward_number,
        "ward_name_bn": ward.ward_name_bn,
        "total_cases": total_cases,
        "pending_verification": pending_verification,
        "incomplete_uncertain": incomplete_uncertain,
        "emergency_cases": emergency_cases,
        "high_priority_cases": high_priority_cases,
        "in_progress_cases": in_progress_cases,
        "resolved_cases": resolved_cases,
        "reopened_cases": reopened_cases,
        "duplicate_candidates": duplicate_candidates,
        "awaiting_acceptance_tasks": awaiting_acceptance_tasks,
        "rejected_tasks": rejected_tasks,
        "waiting_prerequisite_tasks": waiting_prerequisite_tasks,
        "pending_objections": pending_objections,
        "sla_at_risk": sla_at_risk,
        "category_breakdown": category_counts
    }
