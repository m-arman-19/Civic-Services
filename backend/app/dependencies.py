from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRoleEnum, UserScope

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user_id: str = payload.get("sub")
    if not user_id:
        return None
        
    stmt = select(User).where(User.id == user_id).options(
        selectinload(User.scopes),
        selectinload(User.citizen_profile),
        selectinload(User.staff_profile)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    return user

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active or user.account_status in ["suspended", "deactivated"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় বা সাময়িক স্থগিত অবস্থায় রয়েছে।"
        )
    if user.sessions_revoked_at and token:
        import datetime
        payload = decode_token(token)
        if payload and payload.get("iat") is not None:
            rev_dt = user.sessions_revoked_at
            if rev_dt.tzinfo is None:
                rev_dt = rev_dt.replace(tzinfo=datetime.timezone.utc)
            revoked_ts = float(rev_dt.timestamp())
            if float(payload.get("iat")) < revoked_ts:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="নিরাপত্তাজনিত কারণে সেশনটি বাতিল করা হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।"
                )
    return user

def require_roles(allowed_roles: List[UserRoleEnum]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role.value}' is not authorized for this resource"
            )
        return current_user
    return role_checker
