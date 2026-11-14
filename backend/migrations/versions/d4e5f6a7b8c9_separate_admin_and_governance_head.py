"""separate_admin_and_governance_head

Revision ID: d4e5f6a7b8c9
Revises: c1d2e3f4a5b6
Create Date: 2026-10-26 01:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd4e5f6a7b8c9'
down_revision = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None

def upgrade():
    # Create policy_change_requests table
    op.create_table(
        'policy_change_requests',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('change_category', sa.String(length=50), nullable=False, index=True),
        sa.Column('current_configuration', sa.JSON(), nullable=True),
        sa.Column('proposed_configuration', sa.JSON(), nullable=False),
        sa.Column('current_version', sa.String(length=50), nullable=True, server_default='1.0'),
        sa.Column('proposed_version', sa.String(length=50), nullable=False, server_default='1.1'),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('requesting_user_id', sa.String(length=36), nullable=False),
        sa.Column('admin_decision', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('admin_decided_at', sa.DateTime(), nullable=True),
        sa.Column('admin_user_id', sa.String(length=36), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('governance_head_decision', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('governance_head_decided_at', sa.DateTime(), nullable=True),
        sa.Column('governance_head_user_id', sa.String(length=36), nullable=True),
        sa.Column('governance_head_notes', sa.Text(), nullable=True),
        sa.Column('validation_results', sa.JSON(), nullable=True),
        sa.Column('approval_state', sa.String(length=30), nullable=False, server_default='pending_dual_review', index=True),
        sa.Column('implementation_state', sa.String(length=30), nullable=False, server_default='pending', index=True),
        sa.Column('effective_time', sa.DateTime(), nullable=True),
        sa.Column('rollback_details', sa.JSON(), nullable=True)
    )

def downgrade():
    op.drop_table('policy_change_requests')
