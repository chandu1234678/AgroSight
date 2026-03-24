from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.dashboard import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user dashboard statistics."""
    # Total scans
    total_scans = db.query(func.count(Scan.id)).filter(
        Scan.user_id == current_user.id
    ).scalar()
    
    # Most common disease
    # TODO: Implement proper aggregation logic
    most_common = db.query(
        Scan.disease,
        func.count(Scan.disease).label('count')
    ).filter(
        Scan.user_id == current_user.id
    ).group_by(Scan.disease).order_by(func.count(Scan.disease).desc()).first()
    
    most_common_disease = most_common[0] if most_common else "N/A"
    
    # Recent scans
    recent_scans = db.query(Scan).filter(
        Scan.user_id == current_user.id
    ).order_by(Scan.created_at.desc()).limit(5).all()
    
    return {
        "total_scans": total_scans,
        "most_common_disease": most_common_disease,
        "recent_scans": recent_scans
    }
