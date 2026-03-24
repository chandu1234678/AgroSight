from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.api.deps import get_current_user, get_current_user_optional
from app.database import get_db
from app.models.user import User
from app.models.chat import ChatHistory
from app.schemas.chat import ChatRequest, ChatHistoryResponse
from app.services.chat_service import ChatService

router = APIRouter()


@router.post("/ask")
async def ask_question(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """Ask AI assistant. Saves to chat history if user is logged in."""
    response_text = await ChatService.ask_gemini(request.query)

    # Persist to DB if authenticated
    if current_user:
        entry = ChatHistory(
            user_id=current_user.id,
            query=request.query,
            response=response_text,
        )
        db.add(entry)
        await db.commit()

    return {"query": request.query, "response": response_text}


@router.get("/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get user's chat history, oldest first for display."""
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.timestamp.asc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.delete("/history", status_code=204)
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clear all chat history for the current user."""
    result = await db.execute(
        select(ChatHistory).where(ChatHistory.user_id == current_user.id)
    )
    for entry in result.scalars().all():
        await db.delete(entry)
    await db.commit()
