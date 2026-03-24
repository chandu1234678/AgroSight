from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import PredictionResponse, PredictionCreate
from app.services.ai_model import AIModelService
from app.services.storage_service import StorageService

router = APIRouter()

@router.post("/upload")
async def upload_scan(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and analyze plant image."""
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # TODO: Upload image to storage (Cloudinary/S3)
    # For now, use placeholder URL
    image_url = f"https://placeholder.com/scan_{current_user.id}.jpg"
    
    # TODO: Run AI model inference
    prediction = await AIModelService.predict(file)
    
    # Get disease info from service
    from app.services.disease_info import DiseaseInfoService
    disease_info = DiseaseInfoService.get_disease_info(prediction["disease"])
    
    # Calculate severity based on confidence
    if prediction["confidence"] > 0.85:
        severity = "high"
    elif prediction["confidence"] > 0.70:
        severity = "moderate"
    else:
        severity = "low"
    
    # Save scan to database
    scan = Scan(
        user_id=current_user.id,
        image_url=image_url,
        disease=prediction["disease"],
        confidence=prediction["confidence"],
        severity=severity,
        recommendation=disease_info.get("organic_treatment", "Consult agricultural expert")
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    
    # Return formatted response for frontend
    return {
        "id": scan.id,
        "disease": scan.disease,
        "confidence": scan.confidence,
        "severity_level": severity,
        "solution": {
            "organic": disease_info.get("organic_treatment", "Apply neem oil spray"),
            "chemical": disease_info.get("chemical_treatment", "Apply appropriate fungicide")
        },
        "prevention": disease_info.get("prevention", [
            "Ensure proper plant spacing",
            "Water at base of plant",
            "Remove infected leaves",
            "Apply preventive treatments"
        ]),
        "image_url": image_url,
        "created_at": scan.created_at
    }

@router.get("/history")
async def get_scan_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20
):
    """Get user's scan history."""
    result = await db.execute(
        select(Scan)
        .where(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    scans = result.scalars().all()
    
    # Convert to dict format for frontend
    return [{
        "id": scan.id,
        "disease": scan.disease,
        "confidence": scan.confidence,
        "severity": scan.severity,
        "image_url": scan.image_url,
        "created_at": scan.created_at.isoformat() if scan.created_at else None
    } for scan in scans]

@router.get("/{scan_id}")
async def get_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific scan details."""
    result = await db.execute(
        select(Scan)
        .where(Scan.id == scan_id, Scan.user_id == current_user.id)
    )
    scan = result.scalars().first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Return formatted response
    return {
        "id": scan.id,
        "disease": scan.disease,
        "confidence": scan.confidence,
        "severity": scan.severity,
        "recommendation": scan.recommendation,
        "image_url": scan.image_url,
        "created_at": scan.created_at.isoformat() if scan.created_at else None
    }
