"""Add gradcam_url, affected_area_pct, spread_risk_pct to scans

Revision ID: a1b2c3d4e5f6
Revises: 50a63a889dae
Create Date: 2026-03-25 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '50a63a889dae'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('scans', sa.Column('gradcam_url', sa.Text(), nullable=True))
    op.add_column('scans', sa.Column('affected_area_pct', sa.Float(), nullable=True))
    op.add_column('scans', sa.Column('spread_risk_pct', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('scans', 'spread_risk_pct')
    op.drop_column('scans', 'affected_area_pct')
    op.drop_column('scans', 'gradcam_url')
