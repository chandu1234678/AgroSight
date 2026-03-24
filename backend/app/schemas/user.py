"""Pydantic schemas for user authentication and responses."""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=1, max_length=255, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, max_length=255, description="Password (min 8 chars)")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@farm.com",
                "password": "SecurePass123!"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@farm.com",
                "password": "SecurePass123!"
            }
        }


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: int
    name: str
    email: str
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "John Doe",
                "email": "john@farm.com",
                "is_active": True,
                "created_at": "2026-03-24T10:30:00"
            }
        }


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    user: UserResponse = Field(..., description="Authenticated user information")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@farm.com",
                    "is_active": True,
                    "created_at": "2026-03-24T10:30:00"
                }
            }
        }


class Token(BaseModel):
    """Legacy token schema (for compatibility)."""
    access_token: str
    token_type: str
