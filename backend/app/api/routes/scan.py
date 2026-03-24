from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import base64
import io
from datetime import datetime
from app.api.deps import get_current_user, get_current_user_optional
from app.database import get_db
from app.models.user import User
from app.models.scan import Scan
from app.services.ai_model import AIModelService

router = APIRouter()


@router.post("/upload")
async def upload_scan(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Upload and analyze plant image. Saves to DB if user is logged in."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_bytes = await file.read()

    # Base64 data URL for immediate display
    b64 = base64.b64encode(file_bytes).decode("utf-8")
    mime = file.content_type or "image/jpeg"
    image_url = f"data:{mime};base64,{b64}"

    # Run AI model
    fake_file = io.BytesIO(file_bytes)
    prediction = await AIModelService.predict(fake_file)

    raw_confidence = min(prediction["confidence"], 0.99)

    from app.services.disease_info import DiseaseInfoService
    disease_info = DiseaseInfoService.get_disease_info(prediction["disease"])

    if raw_confidence > 0.85:
        severity = "high"
    elif raw_confidence > 0.70:
        severity = "moderate"
    else:
        severity = "low"

    # AI explanation via Gemini
    from app.services.chat_service import ChatService
    disease_display = prediction["disease"].replace("_", " ").title()
    explanation_prompt = (
        f"In 2-3 sentences, explain what {disease_display} is, what causes it, "
        f"and why it's dangerous to crops. Be concise and practical for a farmer."
    )
    try:
        ai_explanation = await ChatService.ask_gemini(explanation_prompt)
    except Exception:
        ai_explanation = disease_info.get("cause", "Disease information not available.")

    scan_id = None
    saved = False
    created_at = datetime.utcnow()

    # Save to DB if user is authenticated
    if current_user:
        scan = Scan(
            user_id=current_user.id,
            image_url=image_url,
            disease=prediction["disease"],
            confidence=round(raw_confidence, 4),
            severity=severity,
            recommendation=ai_explanation,
            created_at=created_at,
        )
        db.add(scan)
        await db.commit()
        await db.refresh(scan)
        scan_id = scan.id
        saved = True

    return {
        "id": scan_id,
        "disease": prediction["disease"],
        "confidence": round(raw_confidence, 4),
        "severity_level": severity,
        "ai_explanation": ai_explanation,
        "solution": {
            "organic": disease_info.get("organic_treatment", "Apply neem oil spray and remove infected parts"),
            "chemical": disease_info.get("chemical_treatment", "Consult local agricultural expert for appropriate fungicide"),
        },
        "prevention": disease_info.get("prevention", [
            "Ensure proper plant spacing",
            "Water at base of plant",
            "Remove infected leaves",
            "Apply preventive treatments",
        ]),
        "image_url": image_url,
        "created_at": created_at.isoformat(),
        "saved": saved,
    }


@router.get("/history")
async def get_scan_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
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
    return [
        {
            "id": scan.id,
            "disease": scan.disease,
            "confidence": scan.confidence,
            "severity": scan.severity,
            "image_url": scan.image_url,
            "created_at": scan.created_at.isoformat() if scan.created_at else None,
        }
        for scan in scans
    ]


@router.get("/{scan_id}")
async def get_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get specific scan details."""
    result = await db.execute(
        select(Scan).where(Scan.id == scan_id, Scan.user_id == current_user.id)
    )
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "id": scan.id,
        "disease": scan.disease,
        "confidence": scan.confidence,
        "severity_level": scan.severity,
        "ai_explanation": scan.recommendation,
        "image_url": scan.image_url,
        "created_at": scan.created_at.isoformat() if scan.created_at else None,
    }


@router.delete("/{scan_id}", status_code=204)
async def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a scan."""
    result = await db.execute(
        select(Scan).where(Scan.id == scan_id, Scan.user_id == current_user.id)
    )
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    await db.delete(scan)
    await db.commit()
