"""
Disease reference model for storing crop disease information.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


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
        prevention: Preventive measures (comma-separated or newline-separated)
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

    __table_args__ = (
        Index("idx_crop_name", "crop_type", "name"),  # Speed up "find disease for crop" queries
    )

    def __repr__(self):
        return f"<Disease(id={self.id}, name={self.name}, crop={self.crop_type})>"
