from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.chat import ChatHistory
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryResponse
from app.services.chat_service import ChatService

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Ask a question to AI assistant."""
    # TODO: Route to appropriate API based on query type
    # Use Gemini for detailed explanations
    # Use Cerebras for fast responses
    
    if request.use_detailed:
        response_text = await ChatService.ask_gemini(request.query)
    else:
        response_text = await ChatService.ask_cerebras(request.query)
    
    # Save to chat history
    chat_entry = ChatHistory(
        user_id=current_user.id,
        query=request.query,
        response=response_text
    )
    db.add(chat_entry)
    await db.commit()
    
    return {"query": request.query, "response": response_text}

@router.get("/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """Get user's chat history."""
    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    history = result.scalars().all()
    return history
