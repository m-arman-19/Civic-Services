import datetime
import enum
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, ForeignKey, JSON, DateTime
from app.models.base import BaseModel

class SystemConfig(BaseModel):
    __tablename__ = "system_config"
    
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value_json = Column(JSON, nullable=False)
    description = Column(String(255), nullable=True)
    updated_by_user_id = Column(String(36), nullable=True)

class ApprovalStatusEnum(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class ApprovalRequest(BaseModel):
    __tablename__ = "approval_requests"
    
    request_type = Column(String(50), nullable=False) # e.g. "LOWER_CONFIDENCE_GATE", "CHANGE_ROUTING_RULE"
    proposed_payload = Column(JSON, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    
    initiator_user_id = Column(String(36), nullable=False)
    second_approver_user_id = Column(String(36), nullable=True)
    decision_notes = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)

class PolicyChangeCategoryEnum(str, enum.Enum):
    RESPONSIBILITY_RULE = "RESPONSIBILITY_RULE"
    TASK_SEQUENCING_RULE = "TASK_SEQUENCING_RULE"
    AI_CONFIDENCE_GATE = "AI_CONFIDENCE_GATE"
    SLA_POLICY = "SLA_POLICY"
    PUBLIC_DASHBOARD = "PUBLIC_DASHBOARD"

class PolicyApprovalStateEnum(str, enum.Enum):
    DRAFT = "draft"
    PENDING_TECHNICAL_REVIEW = "pending_technical_review"
    PENDING_GOVERNANCE_APPROVAL = "pending_governance_approval"
    PENDING_DUAL_REVIEW = "pending_dual_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class PolicyImplementationStateEnum(str, enum.Enum):
    PENDING = "pending"
    APPLIED = "applied"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

class PolicyChangeRequest(BaseModel):
    __tablename__ = "policy_change_requests"

    change_category = Column(String(50), nullable=False, index=True) # RESPONSIBILITY_RULE, TASK_SEQUENCING_RULE, AI_CONFIDENCE_GATE, SLA_POLICY, PUBLIC_DASHBOARD
    current_configuration = Column(JSON, nullable=True)
    proposed_configuration = Column(JSON, nullable=False)
    current_version = Column(String(50), nullable=True, default="1.0")
    proposed_version = Column(String(50), nullable=False, default="1.1")
    reason = Column(Text, nullable=False)
    requesting_user_id = Column(String(36), nullable=False)

    # Technical Review (System Administrator)
    admin_decision = Column(String(20), nullable=False, default="pending") # pending, approved, rejected
    admin_decided_at = Column(DateTime, nullable=True)
    admin_user_id = Column(String(36), nullable=True)
    admin_notes = Column(Text, nullable=True)

    # Policy Decision (City Governance Head)
    governance_head_decision = Column(String(20), nullable=False, default="pending") # pending, approved, rejected
    governance_head_decided_at = Column(DateTime, nullable=True)
    governance_head_user_id = Column(String(36), nullable=True)
    governance_head_notes = Column(Text, nullable=True)

    # Validation & Execution
    validation_results = Column(JSON, nullable=True)
    approval_state = Column(String(30), nullable=False, default="pending_dual_review", index=True) # draft, pending_technical_review, pending_governance_approval, approved, rejected
    implementation_state = Column(String(30), nullable=False, default="pending", index=True) # pending, applied, failed, rolled_back
    effective_time = Column(DateTime, nullable=True)
    rollback_details = Column(JSON, nullable=True)

