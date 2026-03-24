from pydantic import BaseModel
from datetime import datetime

class ChatRequest(BaseModel):
    query: str
    use_detailed: bool = False  # True for Gemini, False for Cerebras

class ChatResponse(BaseModel):
    query: str
    response: str

class ChatHistoryResponse(BaseModel):
    id: int
    query: str
    response: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
