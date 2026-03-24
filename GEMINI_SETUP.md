# Google Gemini API Setup Guide

## Free Tier Benefits (2026)

Google Gemini API offers a generous free tier:
- **No credit card required**
- **Models available**: Gemini 2.0 Flash, Gemini 2.5 Flash, Gemini 2.5 Pro
- **Rate limits**: 10-15 requests per minute
- **Daily limit**: 250-1,000 requests per day
- **Context window**: 1 million tokens
- **Cost**: $0 (completely free)

## Step 1: Get Your API Key

### Option A: Google AI Studio (Recommended)
1. Visit https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Select "Create API key in new project" (or use existing project)
5. Copy your API key

### Option B: Google Cloud Console
1. Visit https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable the "Generative Language API"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

## Step 2: Install Required Package

```bash
cd backend
.\venv\Scripts\activate
pip install google-generativeai
```

Or install from requirements file:
```bash
pip install -r requirements_gemini.txt
```

## Step 3: Add API Key to Environment

Edit `backend/.env` and add your API key:

```env
# Gemini API for chat functionality
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key from Step 1.

## Step 4: Restart Backend

Stop the backend server (Ctrl+C) and restart:

```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✓ Gemini API initialized successfully
```

## Step 5: Test Chat Functionality

1. Open http://localhost:5173
2. Login to your account
3. Navigate to Chat page
4. Ask a question like: "What is tomato late blight?"
5. You should get a detailed AI response!

## Available Models

### Gemini 2.0 Flash (Recommended for Free Tier)
- **Best for**: Fast responses, general queries
- **Rate limit**: 15 RPM, 1,000 RPD
- **Context**: 1M tokens
- **Speed**: Very fast

### Gemini 2.5 Flash
- **Best for**: Balanced performance
- **Rate limit**: 10 RPM, 250 RPD
- **Context**: 1M tokens
- **Speed**: Fast

### Gemini 2.5 Pro
- **Best for**: Complex reasoning
- **Rate limit**: 5 RPM, 100 RPD
- **Context**: 1M tokens
- **Speed**: Moderate

## Current Implementation

The chat service uses **Gemini 2.0 Flash** by default for optimal free tier usage.

To change the model, edit `backend/app/services/chat_service.py`:

```python
cls._gemini_model = genai.GenerativeModel('gemini-2.5-pro')  # Change model here
```

## Rate Limits

### Free Tier Limits
- **Requests per minute (RPM)**: 10-15 depending on model
- **Tokens per minute (TPM)**: 250,000
- **Requests per day (RPD)**: 250-1,000 depending on model

### What Happens When You Hit Limits?
- API returns 429 error
- Chat service falls back to mock responses
- No charges applied (free tier never charges)

### Tips to Stay Within Limits
1. Use Gemini 2.0 Flash for higher RPM
2. Implement caching for common questions
3. Add rate limiting on frontend
4. Use shorter prompts when possible

## Troubleshooting

### Issue: "google-generativeai not installed"
**Solution**: Install the package
```bash
pip install google-generativeai
```

### Issue: "API key not valid"
**Solution**: 
1. Check your API key in .env file
2. Ensure no extra spaces or quotes
3. Regenerate key from Google AI Studio

### Issue: "429 Too Many Requests"
**Solution**: 
1. Wait 1 minute before retrying
2. Reduce request frequency
3. Consider upgrading to paid tier if needed

### Issue: Chat returns mock responses
**Solution**:
1. Check if GEMINI_API_KEY is set in .env
2. Restart backend server
3. Check backend logs for initialization message

## Security Best Practices

1. **Never commit API keys to git**
   - Already in .gitignore
   - Use environment variables only

2. **Restrict API key usage**
   - In Google Cloud Console, restrict key to specific APIs
   - Add IP restrictions if deploying to production

3. **Monitor usage**
   - Check usage at https://aistudio.google.com/
   - Set up alerts for unusual activity

## Cost Monitoring

Even though it's free, monitor your usage:
1. Visit https://aistudio.google.com/
2. Check "Usage" section
3. View requests per day/minute
4. Ensure you're within free tier limits

## Upgrading to Paid Tier

If you need more requests:
1. Visit Google Cloud Console
2. Enable billing for your project
3. Paid tier starts at $0.10 per 1M tokens
4. Much higher rate limits (1,000+ RPM)

## Alternative: Fallback Mode

If you don't want to use Gemini API:
- Chat service automatically falls back to mock responses
- No API key needed
- Provides helpful farming information
- Good for testing without API setup

## Support

- **Gemini API Docs**: https://ai.google.dev/docs
- **Google AI Studio**: https://aistudio.google.com/
- **Rate Limits**: https://ai.google.dev/pricing

## Summary

1. Get free API key from https://aistudio.google.com/apikey
2. Install: `pip install google-generativeai`
3. Add to .env: `GEMINI_API_KEY=your_key`
4. Restart backend
5. Test chat functionality

**No credit card required. Completely free!**
