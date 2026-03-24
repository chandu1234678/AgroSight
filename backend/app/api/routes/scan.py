from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import asyncio
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
    mime = file.content_type or "image/jpeg"

    # ── Run model inference + Gemini explanation in PARALLEL ──────────────
    from app.services.disease_info import DiseaseInfoService
    from app.services.chat_service import ChatService

    # Start model inference immediately (runs in thread pool to avoid blocking)
    loop = asyncio.get_event_loop()
    prediction_task = loop.run_in_executor(
        None, AIModelService.predict_sync, io.BytesIO(file_bytes)
    )

    # Await prediction first (needed to build Gemini prompt)
    prediction = await prediction_task
    raw_confidence = min(prediction["confidence"], 0.99)
    disease_info = DiseaseInfoService.get_disease_info(prediction["disease"])

    gradcam_b64       = prediction.get("gradcam_b64")
    ig_b64            = prediction.get("ig_b64")
    top5_predictions  = prediction.get("top5_predictions", [])
    affected_area_pct = prediction.get("affected_area_pct", 0.0)
    spread_risk_pct   = prediction.get("spread_risk_pct", 0.0)

    if raw_confidence > 0.85:
        severity = "high"
    elif raw_confidence > 0.70:
        severity = "moderate"
    else:
        severity = "low"

    disease_display = prediction["disease"].replace("_", " ").title()
    explanation_prompt = (
        f"In 2-3 sentences, explain what {disease_display} is, what causes it, "
        f"and why it's dangerous to crops. Be concise and practical for a farmer."
    )

    # ── Run Gemini + base64 encoding in parallel ──────────────────────────
    async def encode_image():
        return base64.b64encode(file_bytes).decode("utf-8")

    gemini_task = asyncio.create_task(ChatService.ask_gemini(explanation_prompt))
    b64_task    = asyncio.create_task(encode_image())

    ai_explanation, b64 = await asyncio.gather(
        gemini_task, b64_task, return_exceptions=True
    )

    if isinstance(ai_explanation, Exception):
        ai_explanation = disease_info.get("cause", "Disease information not available.")

    image_url = f"data:{mime};base64,{b64}"

    # ── Persist to DB ─────────────────────────────────────────────────────
    scan_id = None
    saved = False
    created_at = datetime.utcnow()

    if current_user:
        scan = Scan(
            user_id=current_user.id,
            image_url=image_url,
            disease=prediction["disease"],
            confidence=round(raw_confidence, 4),
            severity=severity,
            recommendation=ai_explanation,
            gradcam_url=f"data:image/jpeg;base64,{gradcam_b64}" if gradcam_b64 else None,
            affected_area_pct=affected_area_pct,
            spread_risk_pct=spread_risk_pct,
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
        "gradcam_url": f"data:image/jpeg;base64,{gradcam_b64}" if gradcam_b64 else None,
        "ig_url": f"data:image/jpeg;base64,{ig_b64}" if ig_b64 else None,
        "top5_predictions": top5_predictions,
        "affected_area_pct": affected_area_pct,
        "spread_risk_pct": spread_risk_pct,
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
        "gradcam_url": scan.gradcam_url,
        "affected_area_pct": scan.affected_area_pct,
        "spread_risk_pct": scan.spread_risk_pct,
        "created_at": scan.created_at.isoformat() if scan.created_at else None,
    }


@router.delete("/{scan_id}", status_code=204)
async def delete_scan(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Scan).where(Scan.id == scan_id, Scan.user_id == current_user.id)
    )
    scan = result.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    await db.delete(scan)
    await db.commit()
