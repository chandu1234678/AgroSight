from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=True)          # low, moderate, high
    recommendation = Column(Text, nullable=True)

    # GradCAM / visual analysis fields
    gradcam_url = Column(Text, nullable=True)          # base64 data URI of heatmap overlay
    affected_area_pct = Column(Float, nullable=True)   # % of leaf area with high activation
    spread_risk_pct = Column(Float, nullable=True)     # % of advancing infection front

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])
