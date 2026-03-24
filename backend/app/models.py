"""
SQLAlchemy ORM models for AgroSight.
Three main tables: users, predictions, diseases
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Enum,
    Boolean,
    Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

# Import shared Base to ensure Alembic can detect all models
from app.db.base import Base


class Language(str, enum.Enum):
    """Supported languages for API responses."""
    ENGLISH = "en"
    TELUGU = "te"
    HINDI = "hi"


class User(Base):
    """
    User table for authentication and tracking prediction history.
    
    Fields:
        id: Primary key, auto-increment
        name: User's full name
        email: Unique email for login
        hashed_password: Password hash (never store plain password)
        is_active: Soft delete flag (False = deactivated but data preserved)
        created_at: Account creation timestamp
    
    Relationships:
        predictions: All disease predictions made by this user
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)  # "John Doe"
    email = Column(String(255), unique=True, index=True, nullable=False)  # "john@farm.com"
    hashed_password = Column(String(255), nullable=False)  # Never store plain password!
    is_active = Column(Boolean, default=True, index=True)  # Soft delete
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    predictions = relationship(
        "Prediction",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",  # Eager load predictions when fetching user
    )
    chat_history = relationship(
        "ChatHistory",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    scans = relationship(
        "Scan",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


class Disease(Base):
    """
    Disease reference table for disease information.
    This table stores all known crop diseases and their treatments.
    Can be populated from disease_info.py or a CSV import.
    
    Fields:
        id: Primary key
        name: Disease name (e.g., "Tomato Late Blight")
        crop_type: Crop affected (e.g., "Tomato", "Potato", "Wheat")
        cause: Root cause/pathogen (e.g., "Phytophthora infestans fungus")
        organic_treatment: Organic/natural remedy (e.g., "Spray neem oil solution")
        chemical_treatment: Synthetic fungicide/pesticide recommendation
        prevention: Preventive measures (comma-separated or JSON)
        severity_level: How dangerous (low, medium, high)
        created_at: When record was added
    
    Relationships:
        predictions: All predictions matching this disease
    """
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)  # "Tomato Late Blight"
    crop_type = Column(String(255), index=True, nullable=False)  # "Tomato", "Potato", "Wheat"
    cause = Column(Text, nullable=False)  # "Phytophthora infestans fungus"
    organic_treatment = Column(Text, nullable=False)  # "Spray neem oil solution weekly"
    chemical_treatment = Column(Text, nullable=False)  # "Apply copper-based fungicide"
    prevention = Column(Text, nullable=False)  # "Avoid overhead watering\nRotate crops seasonally"
    severity_level = Column(String(50), default="medium")  # "low", "medium", "high"
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    predictions = relationship(
        "Prediction",
        back_populates="disease",
        lazy="selectin",
    )

    def __repr__(self):
        return f"<Disease(id={self.id}, name={self.name}, crop={self.crop_type})>"


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
        idx_disease: Speed up "get predictions for a disease"
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id", ondelete="SET NULL"), nullable=True)
    
    # Image storage
    image_path = Column(String(500), nullable=False)  # Local: "/uploads/user_123/img_abc.jpg" or S3 URL
    
    # Disease detection results
    disease_name = Column(String(255), nullable=False, index=True)  # "Tomato Late Blight"
    confidence = Column(Float, nullable=False)  # 0.94 (94%)
    
    # Response settings
    language = Column(String(10), default=Language.ENGLISH)  # "en", "te", "hi"
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
        Index("idx_user_created", "user_id", "created_at"),  # Get user's predictions
        Index("idx_disease_created", "disease_id", "created_at"),  # Get disease history
    )

    def __repr__(self):
        return f"<Prediction(id={self.id}, user_id={self.user_id}, disease={self.disease_name}, confidence={self.confidence})>"
