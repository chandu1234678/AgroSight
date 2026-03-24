from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.dashboard import DashboardStats

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user dashboard statistics."""
    # Total scans
    total_result = await db.execute(
        select(func.count(Scan.id)).where(Scan.user_id == current_user.id)
    )
    total_scans = total_result.scalar() or 0
    
    # Most common disease
    most_common_result = await db.execute(
        select(Scan.disease, func.count(Scan.disease).label('count'))
        .where(Scan.user_id == current_user.id)
        .group_by(Scan.disease)
        .order_by(func.count(Scan.disease).desc())
        .limit(1)
    )
    most_common = most_common_result.first()
    most_common_disease = most_common[0] if most_common else "N/A"
    
    # Recent scans
    recent_result = await db.execute(
        select(Scan)
        .where(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .limit(5)
    )
    recent_scans = recent_result.scalars().all()
    
    # Format recent scans
    formatted_scans = [{
        "id": scan.id,
        "disease": scan.disease,
        "confidence": scan.confidence,
        "created_at": scan.created_at.isoformat() if scan.created_at else None
    } for scan in recent_scans]
    
    return {
        "total_scans": total_scans,
        "most_common_disease": most_common_disease,
        "recent_scans": formatted_scans
    }
