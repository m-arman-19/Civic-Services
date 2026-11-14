"""account_identity_management

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-10-26 02:10:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e5f6a7b8c9d0'
down_revision = 'd4e5f6a7b8c9'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Add account lifecycle and security columns to users
    try:
        op.add_column('users', sa.Column('account_status', sa.String(length=30), nullable=False, server_default='active'))
        op.add_column('users', sa.Column('must_change_password', sa.Boolean(), nullable=False, server_default='0'))
        op.add_column('users', sa.Column('last_password_changed_at', sa.DateTime(), nullable=True))
        op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), nullable=False, server_default='0'))
        op.add_column('users', sa.Column('locked_until', sa.DateTime(), nullable=True))
        op.add_column('users', sa.Column('sessions_revoked_at', sa.DateTime(), nullable=True))
    except Exception:
        pass

    # 2. Create account_identifier_histories table
    op.create_table(
        'account_identifier_histories',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('identifier_type', sa.String(length=32), nullable=False),
        sa.Column('old_identifier', sa.String(length=255), nullable=True),
        sa.Column('new_identifier', sa.String(length=255), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('changed_by_user_id', sa.String(length=36), nullable=False),
        sa.Column('verification_status', sa.String(length=32), nullable=False, server_default='verified')
    )

    # 3. Create privileged_role_requests table
    op.create_table(
        'privileged_role_requests',
        sa.Column('id', sa.String(length=36), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('target_user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('requested_role', sa.String(length=64), nullable=False),
        sa.Column('requesting_admin_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('approved_by_governance_head_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='pending', index=True),
        sa.Column('justification', sa.Text(), nullable=False),
        sa.Column('decision_notes', sa.Text(), nullable=True),
        sa.Column('decided_at', sa.DateTime(), nullable=True)
    )

def downgrade():
    op.drop_table('privileged_role_requests')
    op.drop_table('account_identifier_histories')
    op.drop_column('users', 'sessions_revoked_at')
    op.drop_column('users', 'locked_until')
    op.drop_column('users', 'failed_login_attempts')
    op.drop_column('users', 'last_password_changed_at')
    op.drop_column('users', 'must_change_password')
    op.drop_column('users', 'account_status')
