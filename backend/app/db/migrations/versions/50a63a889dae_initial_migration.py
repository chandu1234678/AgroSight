"""Create initial schema: users, diseases, predictions tables

Revision ID: 50a63a889dae
Revises: 
Create Date: 2026-03-24 14:13:22.289248

"""
from alembic import op
import sqlalchemy as sa


revision = '50a63a889dae'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial tables matching SQLAlchemy models."""
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_is_active'), 'users', ['is_active'], unique=False)
    
    # Create diseases table
    op.create_table('diseases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('crop_type', sa.String(length=255), nullable=False),
        sa.Column('cause', sa.Text(), nullable=False),
        sa.Column('organic_treatment', sa.Text(), nullable=False),
        sa.Column('chemical_treatment', sa.Text(), nullable=False),
        sa.Column('prevention', sa.Text(), nullable=False),
        sa.Column('severity_level', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_diseases_id'), 'diseases', ['id'], unique=False)
    op.create_index(op.f('ix_diseases_name'), 'diseases', ['name'], unique=True)
    op.create_index(op.f('ix_diseases_crop_type'), 'diseases', ['crop_type'], unique=False)
    
    # Create predictions table
    op.create_table('predictions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('disease_id', sa.Integer(), nullable=True),
        sa.Column('image_path', sa.String(length=500), nullable=False),
        sa.Column('disease_name', sa.String(length=255), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('language', sa.String(length=10), nullable=False, server_default='en'),
        sa.Column('is_certain', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['disease_id'], ['diseases.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_predictions_id'), 'predictions', ['id'], unique=False)
    op.create_index(op.f('ix_predictions_user_id'), 'predictions', ['user_id'], unique=False)
    op.create_index(op.f('ix_predictions_disease_name'), 'predictions', ['disease_name'], unique=False)
    op.create_index(op.f('ix_predictions_created_at'), 'predictions', ['created_at'], unique=False)
    
    # Create composite indexes for common queries
    op.create_index('ix_user_created', 'predictions', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_disease_created', 'predictions', ['disease_id', 'created_at'], unique=False)


def downgrade() -> None:
    """Drop all tables in reverse order."""
    
    # Drop composite indexes
    op.drop_index('ix_disease_created', table_name='predictions')
    op.drop_index('ix_user_created', table_name='predictions')
    
    # Drop predictions table and its indexes
    op.drop_index(op.f('ix_predictions_created_at'), table_name='predictions')
    op.drop_index(op.f('ix_predictions_disease_name'), table_name='predictions')
    op.drop_index(op.f('ix_predictions_user_id'), table_name='predictions')
    op.drop_index(op.f('ix_predictions_id'), table_name='predictions')
    op.drop_table('predictions')
    
    # Drop diseases table and its indexes
    op.drop_index(op.f('ix_diseases_crop_type'), table_name='diseases')
    op.drop_index(op.f('ix_diseases_name'), table_name='diseases')
    op.drop_index(op.f('ix_diseases_id'), table_name='diseases')
    op.drop_table('diseases')
    
    # Drop users table and its indexes
    op.drop_index(op.f('ix_users_is_active'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

    )
    op.create_index(op.f('ix_scans_id'), 'scans', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_scans_id'), table_name='scans')
    op.drop_table('scans')
    op.drop_index(op.f('ix_chat_history_id'), table_name='chat_history')
    op.drop_table('chat_history')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###
