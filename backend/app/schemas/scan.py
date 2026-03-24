"""
Pydantic schemas for the /api/scan endpoints.
Handles image upload, disease prediction, and history.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# Re-export from user.py to keep prediction schemas in one place
from app.schemas.user import (
    PredictionCreate,
    PredictionResponse,
    UncertainPredictionResponse,
    PredictionHistoryItem,
    PredictionHistoryResponse,
    ErrorResponse,
)

__all__ = [
    "PredictionCreate",
    "PredictionResponse",
    "UncertainPredictionResponse",
    "PredictionHistoryItem",
    "PredictionHistoryResponse",
    "ErrorResponse",
]

