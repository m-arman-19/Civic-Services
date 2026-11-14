from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User, UserRoleEnum
from app.models.case import Case, CaseStatusEnum
from app.models.duplicate_hotspot import DuplicateCandidate, DuplicateLink
from app.services.duplicate_detector import DuplicateDetectorService
from app.dependencies import get_current_user, require_roles
from app.core.audit import AuditLogger
from pydantic import BaseModel

router = APIRouter(prefix="/duplicates", tags=["Duplicates"])

class MergeRequest(BaseModel):
    master_case_id: str
    duplicate_case_id: str
    notes: Optional[str] = None

class UnmergeRequest(BaseModel):
    duplicate_case_id: str
    reason: str

@router.get("/candidates/{case_id}")
async def get_duplicate_candidates(case_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Case).where(Case.id == case_id)
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    candidates = await DuplicateDetectorService.find_duplicate_candidates(db, case)
    return candidates

@router.post("/merge")
async def merge_duplicate_case(
    req: MergeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Module 6 / Section 16: Staff confirmed duplicate merge.
    Links the duplicate into the master case while keeping complainant tracking intact and reversible.
    """
    stmt_master = select(Case).where(Case.id == req.master_case_id)
    res_m = await db.execute(stmt_master)
    master = res_m.scalar_one_or_none()

    stmt_dup = select(Case).where(Case.id == req.duplicate_case_id)
    res_d = await db.execute(stmt_dup)
    duplicate = res_d.scalar_one_or_none()

    if not master or not duplicate:
        raise HTTPException(status_code=404, detail="মাস্টার অথবা ডুপ্লিকেট কেস পাওয়া যায়নি।")

    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids and (master.ward_id not in assigned_ward_ids or duplicate.ward_id not in assigned_ward_ids):
            raise HTTPException(status_code=403, detail="আপনার নির্ধারিত ওয়ার্ড ব্যতীত অন্য ওয়ার্ডের কেস একীভূত করার অনুমতি নেই।")

    duplicate.status = CaseStatusEnum.MERGED
    duplicate.merged_into_case_id = master.id
    master.is_master_case = True

    link = DuplicateLink(
        master_case_id=master.id,
        linked_case_id=duplicate.id,
        linked_by_user_id=current_user.id,
        is_active=True
    )
    db.add(link)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="MERGE_DUPLICATE_CASE",
        resource_type="CASE",
        resource_id=duplicate.id,
        after_state={"merged_into_case_id": master.id}
    )
    await db.commit()

    return {"message_bn": f"কেস {duplicate.tracking_number} সফলভাবে {master.tracking_number} এর সাথে একীভূত করা হয়েছে।"}

@router.post("/unmerge")
async def unmerge_duplicate_case(
    req: UnmergeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    """
    Module 6 / Section 16: Reversible unmerge.
    Restores the unmerged case to SUBMITTED / VERIFIED status.
    """
    stmt = select(Case).where(Case.id == req.duplicate_case_id)
    res = await db.execute(stmt)
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="কেস পাওয়া যায়নি।")

    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids and case.ward_id not in assigned_ward_ids:
            raise HTTPException(status_code=403, detail="আপনার নির্ধারিত ওয়ার্ড ব্যতীত অন্য ওয়ার্ডের কেস থেকে মার্জ প্রত্যাহারের অনুমতি নেই।")

    case.status = CaseStatusEnum.SUBMITTED
    case.merged_into_case_id = None

    # Deactivate duplicate link
    stmt_link = select(DuplicateLink).where(DuplicateLink.linked_case_id == case.id)
    res_link = await db.execute(stmt_link)
    link = res_link.scalar_one_or_none()
    if link:
        link.is_active = False
        link.unlinked_by_user_id = current_user.id
        link.unlinked_reason = req.reason

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="UNMERGE_DUPLICATE_CASE",
        resource_type="CASE",
        resource_id=case.id,
        reason=req.reason
    )
    await db.commit()

    return {"message_bn": "একীভূতকরণ সফলভাবে বাতিল করা হয়েছে।"}

@router.get("/clusters")
async def get_duplicate_clusters(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.WARD_DESK, UserRoleEnum.COORDINATOR, UserRoleEnum.ADMIN]))
):
    stmt = select(Case).where(Case.status.in_([CaseStatusEnum.SUBMITTED, CaseStatusEnum.VERIFIED, CaseStatusEnum.MERGED]))
    if current_user.role == UserRoleEnum.WARD_DESK:
        assigned_ward_ids = [s.ward_id for s in current_user.scopes if s.ward_id]
        if assigned_ward_ids:
            stmt = stmt.where(Case.ward_id.in_(assigned_ward_ids))
    res = await db.execute(stmt)
    cases = res.scalars().all()

    clusters = []
    seen_pairs = set()
    for c in cases:
        cands = await DuplicateDetectorService.find_duplicate_candidates(db, c)
        for cand in cands:
            pair_key = tuple(sorted([c.id, cand["candidate_case_id"]]))
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                clusters.append({
                    "primary_case_id": c.id,
                    "primary_tracking_number": c.tracking_number,
                    "primary_title_bn": c.title_bn,
                    "primary_address": c.address_text,
                    "duplicate_case_id": cand["candidate_case_id"],
                    "duplicate_tracking_number": cand["candidate_tracking_number"],
                    "duplicate_title_bn": cand["title_bn"],
                    "similarity_score": round(cand["text_similarity"] * 100),
                    "distance_meters": round(cand["distance_meters"]),
                    "category": c.primary_category,
                    "status": "merged" if c.status == CaseStatusEnum.MERGED or cand.get("is_already_merged") else "pending_review"
                })
    return clusters
