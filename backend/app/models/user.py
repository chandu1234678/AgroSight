"""
User model for authentication and tracking prediction history.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


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
    name = Column(String(255), nullable=True)  # "John Doe" - nullable for optional signup
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

    __table_args__ = (
        Index("idx_email_active", "email", "is_active"),  # Speed up active user lookups
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"
