from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User, UserRoleEnum, CitizenProfile, StaffProfile
from app.core.security import verify_password, get_password_hash, create_access_token, generate_mock_otp
from app.core.audit import AuditLogger
from app.schemas.auth import LoginRequest, OTPRequest, OTPVerifyRequest, TokenResponse, UserProfileResponse, ChangePasswordRequest
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login_with_password(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)
    stmt = select(User).where((User.phone == req.phone_or_email) | (User.email == req.phone_or_email))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        # Safe response to prevent account enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড।"
        )

    # Check lockout
    if user.locked_until:
        locked_dt = user.locked_until
        if locked_dt.tzinfo is None:
            locked_dt = locked_dt.replace(tzinfo=datetime.timezone.utc)
        if locked_dt > now:
            mins_left = int((locked_dt - now).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"একাধিক ভুল চেষ্টার কারণে অ্যাকাউন্টটি সাময়িকভাবে লক করা হয়েছে। অনুগ্রহ করে {mins_left} মিনিট পর চেষ্টা করুন।"
            )

    # Check status
    if not user.is_active or user.account_status in ["suspended", "deactivated"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="অ্যাকাউন্টটি বর্তমানে স্থগিত বা নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।"
        )

    if not verify_password(req.password, user.hashed_password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        lockout_triggered = False
        if user.failed_login_attempts >= 5:
            user.locked_until = now + datetime.timedelta(minutes=15)
            lockout_triggered = True

        await AuditLogger.log_event(
            db=db,
            actor_user_id=user.id,
            actor_role=user.role.value,
            action="ACCOUNT_LOCKED" if lockout_triggered else "FAILED_AUTHENTICATION",
            resource_type="USER",
            resource_id=user.id,
            after_state={"failed_attempts": user.failed_login_attempts, "locked": lockout_triggered}
        )
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ভুল ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড।"
        )
        
    # Reset failed attempts on success
    user.failed_login_attempts = 0
    user.locked_until = None
    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    
    await AuditLogger.log_event(
        db=db,
        actor_user_id=user.id,
        actor_role=user.role.value,
        action="USER_LOGIN_PASSWORD",
        resource_type="USER",
        resource_id=user.id,
        after_state={"role": user.role.value}
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language,
        must_change_password=bool(user.must_change_password)
    )

@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import datetime
    if not verify_password(req.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="বর্তমান পাসওয়ার্ডটি সঠিক নয়।"
        )
    if len(req.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="নতুন পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।"
        )

    current_user.hashed_password = get_password_hash(req.new_password)
    current_user.must_change_password = False
    current_user.last_password_changed_at = datetime.datetime.now(datetime.timezone.utc)

    await AuditLogger.log_event(
        db=db,
        actor_user_id=current_user.id,
        actor_role=current_user.role.value,
        action="PASSWORD_CHANGED",
        resource_type="USER",
        resource_id=current_user.id,
        after_state={"status": "password_changed_by_user"}
    )
    await db.commit()
    return {"message_bn": "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।"}

@router.post("/otp-request")
async def request_otp(req: OTPRequest, db: AsyncSession = Depends(get_db)):
    mock_code = "123456"  # Deterministic test code for seamless demo and local testing
    return {
        "message_bn": f"{req.phone_or_email} নম্বরে একটি ওটিপি পাঠানো হয়েছে।",
        "mock_otp_code": mock_code,
        "is_simulated": True
    }

@router.post("/otp-verify", response_model=TokenResponse)
async def verify_otp(req: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    # In mock/development mode, accept 123456 or 6 digits
    if req.otp_code != "123456" and len(req.otp_code) != 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="অকার্যকর ওটিপি কোড।")

    stmt = select(User).where((User.phone == req.phone_or_email) | (User.email == req.phone_or_email))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        # Create new citizen account
        user = User(
            phone=req.phone_or_email if "@" not in req.phone_or_email else None,
            email=req.phone_or_email if "@" in req.phone_or_email else None,
            full_name=req.full_name or "নাগরিক ব্যবহারকারী",
            role=req.role or UserRoleEnum.CITIZEN,
            is_active=True,
            is_verified=True,
            preferred_language="bn"
        )
        db.add(user)
        await db.flush()

        profile = CitizenProfile(user_id=user.id)
        db.add(profile)
        await db.flush()

    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    
    await AuditLogger.log_event(
        db=db,
        actor_user_id=user.id,
        actor_role=user.role.value,
        action="USER_LOGIN_OTP",
        resource_type="USER",
        resource_id=user.id
    )
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        preferred_language=user.preferred_language
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    scopes_data = []
    if current_user.scopes:
        for s in current_user.scopes:
            scopes_data.append({
                "ward_id": s.ward_id,
                "department_id": s.department_id,
                "zone_code": s.jurisdiction_zone
            })
            
    return UserProfileResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        phone=current_user.phone,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        preferred_language=current_user.preferred_language,
        accessibility_mode=current_user.accessibility_mode or {},
        scopes=scopes_data
    )
