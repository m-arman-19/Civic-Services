import datetime
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class UserRoleEnum(str, enum.Enum):
    CITIZEN = "citizen"
    WARD_DESK = "ward_desk"
    DEPT_OFFICER = "dept_officer"
    COORDINATOR = "coordinator"
    ADMIN = "admin"
    GOVERNANCE_HEAD = "governance_head"

class AccountStatusEnum(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DEACTIVATED = "deactivated"

class User(BaseModel):
    __tablename__ = "users"
    
    phone = Column(String(32), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRoleEnum), default=UserRoleEnum.CITIZEN, nullable=False, index=True)
    
    # Account Lifecycle & Security
    account_status = Column(SQLEnum(AccountStatusEnum), default=AccountStatusEnum.ACTIVE, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    last_password_changed_at = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    sessions_revoked_at = Column(DateTime, nullable=True)

    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(255), nullable=True)
    preferred_language = Column(String(10), default="bn", nullable=False)
    accessibility_mode = Column(JSON, default=lambda: {"large_text": False, "high_contrast": False, "read_aloud": False})
    
    # Scopes & Profiles
    scopes = relationship("UserScope", back_populates="user", cascade="all, delete-orphan")
    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    identifier_history = relationship("AccountIdentifierHistory", back_populates="user", cascade="all, delete-orphan")

class UserScope(BaseModel):
    __tablename__ = "user_scopes"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    jurisdiction_zone = Column(String(100), nullable=True)
    
    user = relationship("User", back_populates="scopes")

class CitizenProfile(BaseModel):
    __tablename__ = "citizen_profiles"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    nid_number_hash = Column(String(64), nullable=True)
    address_line = Column(String(255), nullable=True)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True)
    
    user = relationship("User", back_populates="citizen_profile")

class StaffProfile(BaseModel):
    __tablename__ = "staff_profiles"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    designation = Column(String(150), nullable=False)
    official_phone = Column(String(50), nullable=False)
    official_email = Column(String(255), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    ward_id = Column(String(36), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True)
    zone_code = Column(String(50), nullable=True)
    
    user = relationship("User", back_populates="staff_profile")

class AccountIdentifierHistory(BaseModel):
    __tablename__ = "account_identifier_histories"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    identifier_type = Column(String(32), nullable=False)  # "email", "phone", "username"
    old_identifier = Column(String(255), nullable=True)
    new_identifier = Column(String(255), nullable=False)
    reason = Column(Text, nullable=True)
    changed_by_user_id = Column(String(36), nullable=False)
    verification_status = Column(String(32), default="verified", nullable=False)
    
    user = relationship("User", back_populates="identifier_history")

class PrivilegedRoleRequest(BaseModel):
    __tablename__ = "privileged_role_requests"
    
    target_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_role = Column(String(64), nullable=False)  # e.g. "governance_head"
    requesting_admin_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    approved_by_governance_head_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(32), default="pending", nullable=False, index=True)  # "pending", "approved", "rejected"
    justification = Column(Text, nullable=False)
    decision_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)
    
    target_user = relationship("User", foreign_keys=[target_user_id])
    requesting_admin = relationship("User", foreign_keys=[requesting_admin_id])
    approved_by_governance_head = relationship("User", foreign_keys=[approved_by_governance_head_id])
