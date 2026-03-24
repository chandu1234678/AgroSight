from sqlalchemy.orm import declarative_base

# Import this Base in all model files
Base = declarative_base()

# NOTE: Don't import models here - it causes circular imports!
# Alembic auto-discovers models via env.py configuration
# Each model file imports Base directly: from app.db.base import Base
