"""
Database connection and session management for AgroSight.
Uses async SQLAlchemy for performance with PostgreSQL.
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator
from app.core.config import settings

# Create async engine with PostgreSQL async driver (asyncpg)
# For production: postgresql+asyncpg://user:password@localhost:5432/agrosight
# For development: sqlite+aiosqlite:///./agrosight.db

# SQLite doesn't support pool settings, so configure based on database type
if "sqlite" in settings.DATABASE_URL:
    # SQLite configuration (development)
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
        poolclass=NullPool,
    )
else:
    # PostgreSQL configuration (production)
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
        pool_size=20,
        max_overflow=40,
        pool_recycle=3600,  # Recycle connections every hour
    )

# Async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI endpoints to get database session.
    Usage:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Initialize database tables (create all tables from models).
    Call this once at startup.
    """
    # Import models here to register them with Base.metadata
    # This ensures all model definitions are loaded before creating tables
    from app.db.base import Base
    from app.models import User, Prediction, Disease  # noqa: F401
    
    async with engine.begin() as conn:
        # This creates all tables defined in models
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connection pool."""
    await engine.dispose()
