"""
Prediction model for storing disease detection history.
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Index, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class Language(str, enum.Enum):
    """Supported languages for API responses."""
    ENGLISH = "en"
    TELUGU = "te"
    HINDI = "hi"


class Prediction(Base):
    """
    Prediction history table for storing every disease detection result.
    This is the core table linking users to their predictions.
    
    Fields:
        id: Primary key, auto-increment
        user_id: Foreign key to users table
        disease_id: Foreign key to diseases table (NULL if < 70% confidence)
        image_path: Path to uploaded leaf image (local disk or S3 URL)
        disease_name: Extracted disease name from TFLite model output
        confidence: Model confidence score (0.0 to 1.0, stored as float)
        language: Response language preference (en, te, hi)
        is_certain: True if confidence >= 70%, False otherwise
        notes: Optional user notes about the prediction
        created_at: Prediction timestamp
    
    Relationships:
        user: The user who made this prediction
        disease: Disease record (if prediction was certain)
    
    Indexes:
        idx_user_created: Speed up "get user's recent predictions"
        idx_disease_created: Speed up "get predictions for a disease"
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id", ondelete="SET NULL"), nullable=True)
    
    # Image storage
    image_path = Column(String(500), nullable=False)  # Local: "/uploads/user_123/img_abc.jpg" or S3 URL
    
    # Disease detection results
    disease_name = Column(String(255), nullable=False, index=True)  # "Tomato Late Blight"
    confidence = Column(Float, nullable=False)  # 0.94 (represents 94%)
    
    # Response settings
    language = Column(Enum(Language), default=Language.ENGLISH)  # "en", "te", "hi"
    is_certain = Column(Boolean, default=True)  # False if confidence < 70%
    
    # Optional notes
    notes = Column(Text, nullable=True)  # User can add notes
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="predictions", lazy="selectin")
    disease = relationship("Disease", back_populates="predictions", lazy="selectin")

    # Composite indexes for common queries
    __table_args__ = (
        Index("idx_user_created", "user_id", "created_at"),  # Get user's predictions (recent first)
        Index("idx_disease_created", "disease_id", "created_at"),  # Get all predictions for a disease
        Index("idx_confidence_language", "confidence", "language"),  # Get uncertain predictions in specific language
    )

    def __repr__(self):
        return f"<Prediction(id={self.id}, user_id={self.user_id}, disease={self.disease_name}, confidence={self.confidence:.2f})>"
