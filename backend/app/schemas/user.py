from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# ============================================================================
# AUTHENTICATION SCHEMAS (Register/Login)
# ============================================================================

class UserCreate(BaseModel):
    """Pydantic schema for user registration."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Password (min 8 chars)")
    name: Optional[str] = Field(None, description="User's full name")

class UserResponse(BaseModel):
    """Pydantic schema for returning user information."""
    id: int
    email: str
    name: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """JWT token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    expires_in: int = Field(..., description="Token expiration in seconds")
    user: UserResponse = Field(..., description="User information")

# ============================================================================
# DISEASE INFO SCHEMAS
# ============================================================================

class DiseaseResponse(BaseModel):
    """Disease information from the diseases table or lookup."""
    id: int
    name: str = Field(..., description="Disease name (e.g., 'Tomato Late Blight')")
    crop_type: str = Field(..., description="Affected crop (e.g., 'Tomato')")
    cause: str = Field(..., description="Root cause/pathogen")
    organic_treatment: str = Field(..., description="Natural/organic remedy")
    chemical_treatment: str = Field(..., description="Synthetic fungicide recommendation")
    prevention: str = Field(..., description="Preventive measures")
    severity_level: str = Field(..., description="low, medium, or high")
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# PREDICTION SCHEMAS (for /predict endpoint)
# ============================================================================

class PredictionCreate(BaseModel):
    """Request body for image upload (not used directly - file handled separately)."""
    language: str = Field(default="en", description="Response language: en, te, hi")
    notes: Optional[str] = Field(None, description="Optional user notes")

class TreatmentInfo(BaseModel):
    """Treatment recommendations (organic and chemical)."""
    organic: str = Field(..., description="Organic/natural solution")
    chemical: str = Field(..., description="Chemical/synthetic solution")

class PredictionResponse(BaseModel):
    """
    SUCCESS response from /predict endpoint when confidence >= 70%.
    The main API response that the frontend receives.
    """
    status: str = Field(default="success", description="Always 'success' for high-confidence predictions")
    disease: str = Field(..., description="Detected disease name (e.g., 'Tomato Late Blight')")
    confidence: str = Field(..., description="Model's confidence as percentage (e.g., '94.2%')")
    confidence_score: float = Field(..., description="Raw confidence score (0.0-1.0)")
    
    cause: str = Field(..., description="Root cause of the disease")
    solution: TreatmentInfo = Field(..., description="Organic and chemical treatment options")
    prevention: List[str] = Field(..., description="List of preventive measures")
    
    severity_level: str = Field(..., description="Disease severity: low, medium, high")
    crop_type: str = Field(..., description="Type of crop affected")
    language: str = Field(default="en", description="Response language: en, te, hi")
    
    prediction_id: int = Field(..., description="Database ID for this prediction (for history)")
    created_at: datetime = Field(..., description="Prediction timestamp")
    
    class Config:
        from_attributes = True

class UncertainPredictionResponse(BaseModel):
    """
    UNCERTAINTY response from /predict when confidence < 70%.
    Returns generic message instead of disease name.
    """
    status: str = Field(default="uncertain", description="Always 'uncertain' for low-confidence")
    message: str = Field(
        default="Cannot determine disease clearly. Please retake photo with:",
        description="Friendly error message"
    )
    suggestions: List[str] = Field(
        default=[
            "Better lighting (avoid shadows)",
            "Clear focus on the affected leaf",
            "Multiple angles if possible",
            "Good image quality (not blurry)"
        ],
        description="Tips for better image quality"
    )
    confidence_score: float = Field(..., description="Low confidence score (< 0.7)")
    language: str = Field(default="en", description="Response language: en, te, hi")
    prediction_id: Optional[int] = Field(None, description="Database ID if stored")
    created_at: Optional[datetime] = Field(None, description="Prediction timestamp if stored")
    
    class Config:
        from_attributes = True

class PredictionHistoryItem(BaseModel):
    """Single prediction for history listing."""
    id: int
    disease_name: str
    confidence: float
    is_certain: bool
    disease_id: Optional[int] = None
    image_path: str
    language: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PredictionHistoryResponse(BaseModel):
    """GET /history response - list of past predictions with pagination."""
    total: int = Field(..., description="Total number of predictions")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    predictions: List[PredictionHistoryItem] = Field(..., description="List of predictions")
    
    class Config:
        from_attributes = True

class ErrorResponse(BaseModel):
    """Error response for API failures."""
    status: str = Field(default="error", description="Always 'error'")
    message: str = Field(..., description="Human-readable error message")
    detail: Optional[str] = Field(None, description="Technical details (development only)")
    timestamp: datetime = Field(..., description="When error occurred")


class ForgotPasswordRequest(BaseModel):
    """Request schema for forgot password."""
    email: EmailStr = Field(..., description="User email address")


class ResetPasswordRequest(BaseModel):
    """Request schema for password reset."""
    reset_token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=6, description="New password (min 6 chars)")


