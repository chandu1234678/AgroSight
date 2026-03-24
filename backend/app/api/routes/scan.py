from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ScanResponse, ScanCreate
from app.services.ai_model import AIModelService
from app.services.storage_service import StorageService

router = APIRouter()

@router.post("/upload", response_model=ScanResponse)
async def upload_scan(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and analyze plant image."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # TODO: Upload image to storage (Cloudinary/S3)
    image_url = await StorageService.upload_image(file)
    
    # TODO: Run AI model inference
    prediction = await AIModelService.predict(file)
    
    # TODO: Calculate severity based on confidence and disease type
    severity = "moderate"  # Placeholder
    
    # TODO: Generate recommendation based on disease
    recommendation = "Apply appropriate fungicide. Consult local agricultural expert."  # Placeholder
    
    # Save scan to database
    scan = Scan(
        user_id=current_user.id,
        image_url=image_url,
        disease=prediction["disease"],
        confidence=prediction["confidence"],
        severity=severity,
        recommendation=recommendation
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    return scan

@router.get("/history", response_model=List[ScanResponse])
async def get_scan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """Get user's scan history."""
    scans = db.query(Scan).filter(
        Scan.user_id == current_user.id
    ).order_by(Scan.created_at.desc()).offset(skip).limit(limit).all()
    
    return scans

@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific scan details."""
    scan = db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scan
