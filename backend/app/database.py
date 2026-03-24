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
    Initialize database tables and apply any pending column additions.
    Uses create_all for new tables, then runs idempotent ALTER TABLE
    statements for columns added after initial creation.
    """
    from app.db.base import Base
    from app.models import User, Prediction, Disease  # noqa: F401
    from app.models.scan import Scan  # noqa: F401
    from app.models.chat import ChatHistory  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # ── Idempotent column migrations ──────────────────────────────────────
    # SQLite does not support IF NOT EXISTS on ALTER TABLE, so we check
    # existing columns first and only add what's missing.
    async with engine.begin() as conn:
        # Get current columns in scans table
        result = await conn.execute(
            __import__('sqlalchemy').text("PRAGMA table_info(scans)")
        )
        existing = {row[1] for row in result.fetchall()}

        migrations = [
            ("gradcam_url",       "ALTER TABLE scans ADD COLUMN gradcam_url TEXT"),
            ("affected_area_pct", "ALTER TABLE scans ADD COLUMN affected_area_pct REAL"),
            ("spread_risk_pct",   "ALTER TABLE scans ADD COLUMN spread_risk_pct REAL"),
        ]
        for col, sql in migrations:
            if col not in existing:
                await conn.execute(__import__('sqlalchemy').text(sql))
                print(f"✓ Migration applied: added scans.{col}")


async def close_db():
    """Close database connection pool."""
    await engine.dispose()
