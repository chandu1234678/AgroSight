from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ScanCreate(BaseModel):
    image_url: str
    disease: str
    confidence: float
    severity: Optional[str] = None
    recommendation: Optional[str] = None

class ScanResponse(BaseModel):
    id: int
    user_id: int
    image_url: str
    disease: str
    confidence: float
    severity: Optional[str]
    recommendation: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
