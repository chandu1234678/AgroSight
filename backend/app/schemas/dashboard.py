from pydantic import BaseModel
from typing import List
from app.schemas.scan import ScanResponse

class DashboardStats(BaseModel):
    total_scans: int
    most_common_disease: str
    recent_scans: List[ScanResponse]
