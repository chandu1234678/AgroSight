from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import models here for Alembic - but only after Base is defined
# These imports should happen after Base creation to avoid circular imports
