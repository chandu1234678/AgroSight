import httpx
from app.core.config import settings

class ChatService:
    """Service for external AI chat APIs."""
    
    @staticmethod
    async def ask_gemini(query: str) -> str:
        """Get detailed response from Google Gemini API."""
        # TODO: Implement Gemini API integration
        # import google.generativeai as genai
        # genai.configure(api_key=settings.GEMINI_API_KEY)
        # model = genai.GenerativeModel('gemini-pro')
        # response = model.generate_content(query)
        # return response.text
        
        return f"Gemini response for: {query} (TODO: Implement API integration)"
    
    @staticmethod
    async def ask_cerebras(query: str) -> str:
        """Get fast response from Cerebras API."""
        # TODO: Implement Cerebras API integration
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(
        #         "https://api.cerebras.ai/v1/chat/completions",
        #         headers={"Authorization": f"Bearer {settings.CEREBRAS_API_KEY}"},
        #         json={"messages": [{"role": "user", "content": query}]}
        #     )
        #     return response.json()["choices"][0]["message"]["content"]
        
        return f"Cerebras response for: {query} (TODO: Implement API integration)"
