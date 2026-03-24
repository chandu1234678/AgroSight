import httpx
import os
from app.core.config import settings

# Try to import Gemini API
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. Install with: pip install google-generativeai")


class ChatService:
    """Service for external AI chat APIs."""
    
    _gemini_model = None
    
    @classmethod
    def _init_gemini(cls):
        """Initialize Gemini API if not already initialized."""
        if not GEMINI_AVAILABLE:
            return False
        
        if cls._gemini_model is None and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                # Use gemini-2.5-flash (stable model with best free tier limits)
                cls._gemini_model = genai.GenerativeModel('gemini-2.5-flash')
                print("✓ Gemini API initialized successfully (gemini-2.5-flash)")
                return True
            except Exception as e:
                print(f"✗ Failed to initialize Gemini API: {e}")
                return False
        return cls._gemini_model is not None
    
    @staticmethod
    async def ask_gemini(query: str) -> str:
        """Get response from Google Gemini API — runs in thread pool to avoid blocking."""
        import asyncio

        def _call():
            if ChatService._init_gemini():
                try:
                    system_prompt = (
                        "You are an expert agricultural AI assistant specializing in plant diseases, "
                        "crop management, and farming practices. Provide accurate, practical advice for farmers. "
                        "Keep responses concise but informative. Focus on actionable solutions."
                    )
                    full_prompt = f"{system_prompt}\n\nUser question: {query}"
                    response = ChatService._gemini_model.generate_content(full_prompt)
                    return response.text
                except Exception as e:
                    print(f"Gemini API error: {e}")
                    return ChatService._get_mock_response(query)
            return ChatService._get_mock_response(query)

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _call)
    
    @staticmethod
    async def ask_cerebras(query: str) -> str:
        """Get fast response from Cerebras API."""
        # TODO: Implement Cerebras API integration
        # For now, use Gemini for all requests
        return await ChatService.ask_gemini(query)
    
    @staticmethod
    def _get_mock_response(query: str) -> str:
        """Fallback mock responses when API is not available."""
        query_lower = query.lower()
        
        if "blight" in query_lower or "disease" in query_lower:
            return """Late blight is a serious fungal disease caused by Phytophthora infestans. It affects tomatoes and potatoes, especially in cool, wet conditions.

Key symptoms:
- Dark brown spots on leaves
- White fungal growth on leaf undersides
- Rapid spread during humid weather

Treatment:
- Remove infected plants immediately
- Apply copper-based fungicides
- Improve air circulation
- Avoid overhead watering

Prevention is key - use resistant varieties and maintain good field hygiene."""
        
        elif "treatment" in query_lower or "cure" in query_lower:
            return """For most plant diseases, early detection and treatment are crucial:

Organic treatments:
- Neem oil spray (3-5%)
- Copper sulfate solution
- Bacillus subtilis bioagent
- Remove infected parts

Chemical treatments:
- Mancozeb fungicide
- Chlorothalonil spray
- Copper oxychloride

Always follow label instructions and maintain proper application intervals."""
        
        elif "prevent" in query_lower:
            return """Disease prevention is more effective than treatment:

1. Crop rotation - Don't plant same crop in same location for 3 years
2. Proper spacing - Ensure good air circulation
3. Water management - Water at base, avoid wetting leaves
4. Sanitation - Remove infected plant debris
5. Resistant varieties - Use certified disease-resistant seeds
6. Regular monitoring - Scout fields weekly during growing season

Remember: Healthy soil = Healthy plants!"""
        
        else:
            return f"""I'm here to help with plant disease questions! I can provide information about:

- Disease identification and symptoms
- Treatment options (organic and chemical)
- Prevention strategies
- Crop management practices
- Specific diseases like blight, rust, mildew, etc.

Your question: "{query}"

Could you be more specific about what you'd like to know? For example:
- What disease are you dealing with?
- What symptoms are you seeing?
- What crop is affected?"""
