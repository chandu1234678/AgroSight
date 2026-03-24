"""
Quick-start guide for AgroSight authentication system.

This file provides a 5-minute setup and testing guide.
"""

# ============================================================================
# STEP 1: Configure Environment Variables
# ============================================================================

# Create backend/.env file with:

DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/agrosight
# or for development:
DATABASE_URL=sqlite+aiosqlite:///./agrosight.db

# Generate a secure SECRET_KEY
# Open terminal and run:
#   openssl rand -hex 32
# Copy the output and paste:
SECRET_KEY=your-random-32-char-hex-string-here

DEBUG=False
APP_NAME=AgroSight API
APP_VERSION=1.0.0

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Token expiration
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Optional: ML model and storage
MODEL_PATH=./ml/saved_models/plant_disease_model.tflite
CONFIDENCE_THRESHOLD=0.7
STORAGE_TYPE=local
UPLOAD_DIR=./uploads


# ============================================================================
# STEP 2: Install Requirements
# ============================================================================

# cd backend
# pip install -r requirements.txt

# All required packages are already listed:
# - fastapi, uvicorn
# - sqlalchemy[asyncio], asyncpg (PostgreSQL async)
# - python-jose[cryptography], passlib[bcrypt] (Auth)
# - alembic (Migrations)


# ============================================================================
# STEP 3: Initialize Database
# ============================================================================

# In PostgreSQL (if using PostgreSQL instead of SQLite):
# createdb agrosight

# Run Alembic migrations:
# cd backend
# alembic upgrade head

# Verify tables exist:
# psql agrosight -c "\dt"
# or SQLite:
# sqlite3 agrosight.db ".tables"


# ============================================================================
# STEP 4: Seed Disease Data (Optional)
# ============================================================================

# Create a Python script: backend/seed_diseases.py

import asyncio
from app.database import async_session_maker
from app.services.disease_info import seed_diseases_table

async def main():
    async with async_session_maker() as session:
        await seed_diseases_table(session)
        print("✓ Diseases seeded successfully!")

asyncio.run(main())

# Run it:
# python seed_diseases.py


# ============================================================================
# STEP 5: Run the Server
# ============================================================================

# cd backend
# uvicorn app.main:app --reload
#
# Output:
#   INFO:     Uvicorn running on http://127.0.0.1:8000
#   INFO:     Application startup complete
#
# API docs:
#   http://localhost:8000/docs       (Swagger UI)
#   http://localhost:8000/redoc      (ReDoc)


# ============================================================================
# STEP 6: Test Authentication (5 Quick Tests)
# ============================================================================

"""
OPTION A: Using curl commands
"""

# 1. REGISTER a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
  }'

# Expected response:
# {
#   "id": 1,
#   "email": "test@example.com",
#   "name": "Test User",
#   "is_active": true,
#   "created_at": "2026-03-24T..."
# }


# 2. LOGIN to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Expected response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer",
#   "expires_in": 1800
# }

# Copy the access_token value

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."


# 3. GET current user (protected endpoint)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "id": 1,
#   "email": "test@example.com",
#   "name": "Test User",
#   ...
# }


# 4. VERIFY token is still valid
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "valid": true,
#   "user_id": 1,
#   "email": "test@example.com"
# }


# 5. LOGOUT
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Expected response: (no content, 204)


"""
OPTION B: Using Python requests
"""

import requests

BASE_URL = "http://localhost:8000/api"

# 1. Register
response = requests.post(
    f"{BASE_URL}/auth/register",
    json={
        "email": "farmer@example.com",
        "password": "SecurePass123",
        "name": "Farmer John"
    }
)
print(response.json())  # ✓ User created

# 2. Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "email": "farmer@example.com",
        "password": "SecurePass123"
    }
)
data = response.json()
token = data["access_token"]
print(f"✓ Logged in, token: {token[:50]}...")

# 3. Get user info
response = requests.get(
    f"{BASE_URL}/auth/me",
    headers={"Authorization": f"Bearer {token}"}
)
print(response.json())  # ✓ User data returned

# 4. Verify token
response = requests.post(
    f"{BASE_URL}/auth/verify",
    headers={"Authorization": f"Bearer {token}"}
)
print(response.json())  # ✓ {"valid": true, ...}


"""
OPTION C: Using Postman
"""

# 1. Create new request: POST http://localhost:8000/api/auth/register
#    Body (raw JSON):
#    {
#      "email": "test@example.com",
#      "password": "TestPass123",
#      "name": "Test"
#    }

# 2. Create new request: POST http://localhost:8000/api/auth/login
#    Body (raw JSON):
#    {
#      "email": "test@example.com",
#      "password": "TestPass123"
#    }
#    Save the access_token from response

# 3. Create new request: GET http://localhost:8000/api/auth/me
#    Headers: Authorization = Bearer {paste_token_here}

# 4. Send request and verify you get user data


# ============================================================================
# STEP 7: Run Tests
# ============================================================================

# Install pytest and async plugins:
# pip install pytest pytest-asyncio httpx

# Run all Auth tests:
# pytest tests/test_auth.py -v

# Run specific test:
# pytest tests/test_auth.py::test_register_success -v

# Run with coverage:
# pytest tests/test_auth.py --cov=app.api.routes.auth --cov-report=html


# ============================================================================
# STEP 8: Protect Your Endpoints
# ============================================================================

# Now you can use authentication in other routes:

from fastapi import APIRouter, Depends
from app.api.routes.auth import get_current_user
from app.models import User

router = APIRouter()

@router.post("/predict")
async def predict(
    file: UploadFile,
    current_user: User = Depends(get_current_user),  # ← Enforces authentication
    db: AsyncSession = Depends(get_db)
):
    """
    This endpoint requires authentication.
    If no token or invalid token: returns 401/403 automatically.
    current_user is guaranteed to be valid here.
    """
    
    # current_user.id, current_user.email are accessible
    # Link predictions to user:
    prediction = Prediction(
        user_id=current_user.id,
        disease_name="Tomato Late Blight",
        confidence=0.94,
        ...
    )
    db.add(prediction)
    await db.commit()
    
    return {"disease": "Tomato Late Blight", "confidence": "94%"}


# ============================================================================
# GOTCHAS TO AVOID
# ============================================================================

# ❌ Mistake 1: Hardcoding SECRET_KEY
# ❌ Correct:   Use .env and load with python-dotenv
SECRET_KEY = "my-secret"  # ❌ DON'T do this!

# ❌ Mistake 2: Storing plaintext passwords
user.password = "mypassword"  # ❌ NEVER!
user.hashed_password = get_password_hash("mypassword")  # ✅ Correct

# ❌ Mistake 3: Authorization header without "Bearer"
headers={"Authorization": "eyJ..."}  # ❌ Missing "Bearer"
headers={"Authorization": "Bearer eyJ..."}  # ✅ Correct

# ❌ Mistake 4: Forgetting async/await
async def get_current_user(token: str):
    user = db.query(User).filter(...)  # ❌ Synchronous!
    
async def get_current_user(token: str):
    result = await db.execute(select(User).where(...))  # ✅ Async

# ❌ Mistake 5: Storing sensitive data in JWT
payload = {"user_id": 1, "password": "secret123"}  # ❌ Encrypted? No!
payload = {"sub": 1}  # ✅ Only user_id, fetch user from DB


# ============================================================================
# FILE STRUCTURE
# ============================================================================

backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   └── auth.py          ← ✓ All endpoints implemented
│   │   └── deps.py              ← ✓ Exports get_current_user
│   ├── core/
│   │   └── security.py          ← ✓ Password hashing + JWT
│   ├── models.py                ← ✓ User model (with hashed_password)
│   ├── schemas/
│   │   └── user.py              ← ✓ All request/response schemas
│   ├── database.py              ← ✓ Async SQLAlchemy setup
│   ├── main.py                  ← ✓ Auth router included
│   └── db/
│       ├── base.py              ← ✓ Shared Base for models
│       └── migrations/
│           ├── env.py           ← ✓ Configured for async
│           └── versions/
│               └── 50a63a...    ← ✓ Initial migration
├── tests/
│   ├── conftest.py              ← ✓ Pytest fixtures
│   └── test_auth.py             ← ✓ 15+ test cases
├── AUTH_GUIDE.md                ← ✓ Complete documentation
├── requirements.txt             ← ✓ All dependencies
└── .env                         ← ✓ Your config (create this)


# ============================================================================
# NEXT STEPS
# ============================================================================

# 1. POST /predict endpoint (image upload → TFLite → disease info)
# 2. GET /history endpoint (user's prediction history with pagination)
# 3. Error handling middleware (graceful error messages)
# 4. Rate limiting on /login (brute force protection)
# 5. Optional: Token refresh mechanism (for long sessions)


# ============================================================================
# TROUBLESHOOTING
# ============================================================================

# Problem: "Could not validate credentials"
# Solution: Check Authorization header is "Bearer {token}", not just token

# Problem: "User not found" but user exists
# Solution: Check database queries are async (await db.execute(...))

# Problem: Token works once then fails
# Solution: Token expires after 30 min. Check ACCESS_TOKEN_EXPIRE_MINUTES in .env

# Problem: Password hash always different
# Solution: That's normal! Bcrypt generates unique salt each time.
#          Use verify_password() to compare, not ==

# Problem: "Invalid signature" on token verification
# Solution: Check SECRET_KEY in .env matches between server runs
#          Different SECRET_KEY = invalid token

# Problem: "database is locked" (SQLite only)
# Solution: Use PostgreSQL for production, or increase SQLite timeout
#          DATABASE_URL=sqlite+aiosqlite:///./db.sqlite?timeout=15

print("""
✅ SETUP COMPLETE!

Quick test:
  1. Start server:  uvicorn app.main:app --reload
  2. Register:      POST http://localhost:8000/api/auth/register
  3. Login:         POST http://localhost:8000/api/auth/login
  4. Get user:      GET http://localhost:8000/api/auth/me (with Bearer token)

View API docs:
  http://localhost:8000/docs

Run tests:
  pytest tests/test_auth.py -v

Read more:
  - AUTH_GUIDE.md (comprehensive guide)
  - DATABASE_SCHEMA.md (database design)
  - tests/test_auth.py (example tests)
""")
