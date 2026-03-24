## AgroSight Database & Models Documentation

### Complete Setup Summary

I've created a professional async-ready database setup for AgroSight. Here's what was created:

---

## 📁 Files Created/Updated

### 1. **`backend/app/database.py`** (NEW)
- **Purpose**: Async SQLAlchemy database connection management
- **Key Features**:
  - `AsyncSession` for async/await support throughout the app
  - `async_session_maker` factory for creating DB sessions
  - `get_db()` dependency for FastAPI endpoints
  - `init_db()` to create tables at startup
  - `close_db()` to cleanup on shutdown
  - Supports both PostgreSQL (asyncpg) and SQLite (aiosqlite)

**Usage in routes**:
```python
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from app.database import get_db

@app.get("/predictions")
async def get_user_predictions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Prediction).where(Prediction.user_id == user_id))
    return result.scalars().all()
```

---

### 2. **`backend/app/models/`** (UPDATED)
Three clean model files with proper relationships:

#### **`user.py`** - User Authentication Table
```python
User {
    id: int [PK]
    name: str(255)
    email: str(255) [UNIQUE, INDEX]
    hashed_password: str(255)
    is_active: bool [default=True]
    created_at: datetime
    
    # Relationship
    predictions: List[Prediction]  # All user's predictions
}
```

**Notes**:
- `is_active` allows soft-delete (deactivate without deleting data)
- Index on (email, is_active) speeds up active user lookups
- `hashed_password` — store hashed with `passlib.bcrypt`, never plain text

#### **`disease.py`** - Disease Reference Table
```python
Disease {
    id: int [PK]
    name: str(255) [UNIQUE, INDEX]
    crop_type: str(255) [INDEX]  # "Tomato", "Potato", "Wheat"
    cause: text  # "Phytophthora infestans fungus"
    organic_treatment: text  # "Spray neem oil weekly"
    chemical_treatment: text  # "Apply copper fungicide"
    prevention: text  # Multiline: "Avoid overhead watering\nRotate crops seasonally"
    severity_level: str(50)  # "low", "medium", "high"
    created_at: datetime
    
    # Relationship
    predictions: List[Prediction]
}
```

**Notes**:
- Lookup table — populate once with all known diseases
- Index on (crop_type, name) for "find disease for crop" queries fast
- Can be seeded from JSON/CSV file

#### **`prediction.py`** - Prediction History Table (CORE)
```python
Prediction {
    id: int [PK]
    user_id: int [FK → users.id, CASCADE DELETE]
    disease_id: int [FK → diseases.id, SET NULL] [nullable]
    image_path: str(500)  # "/uploads/user_123/pred_abc.jpg" or S3 URL
    disease_name: str(255) [INDEX]  # Model output: "Tomato Late Blight"
    confidence: float  # 0.94 = 94%
    language: enum[en|te|hi]  # "en", "te", "hindi"
    is_certain: bool  # False if confidence < 70%
    notes: text [nullable]
    created_at: datetime [INDEX]
    
    # Relationships
    user: User
    disease: Disease (if is_certain=True)
}
```

**Indexes**:
- `idx_user_created(user_id, created_at)` — Get user's predictions (most recent first)
- `idx_disease_created(disease_id, created_at)` — Get all predictions for a disease
- `idx_confidence_language(confidence, language)` — Find uncertain predictions in language

---

### 3. **`backend/app/core/config.py`** (UPDATED)
Environment settings with async database support:
```python
class Settings(BaseSettings):
    # Async database URLs
    # PostgreSQL:  postgresql+asyncpg://user:pwd@localhost:5432/agrosight
    # SQLite:      sqlite+aiosqlite:///./agrosight.db
    DATABASE_URL: str
    
    # JWT/Security
    SECRET_KEY: str  # Generate: python -c "import secrets; print(secrets.token_hex(32))"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Storage
    STORAGE_TYPE: str = "local"  # "local" | "s3"
    UPLOAD_DIR: str = "./uploads"
    AWS_S3_BUCKET: str  # If using S3
    
    # ML Model
    MODEL_PATH: str  # Path to .tflite file
    CONFIDENCE_THRESHOLD: float = 0.7  # 70% threshold
    
    # More...
```

---

### 4. **`backend/app/main.py`** (UPDATED)
Proper async lifecycle management:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    await init_db()  # Create tables from models
    yield
    # SHUTDOWN
    await close_db()  # Close DB connection pool

app = FastAPI(lifespan=lifespan)
```

---

### 5. **`backend/app/db/session.py`** (UPDATED)
Now imports from `database.py`:
```python
from app.database import async_session_maker, get_db, init_db, close_db
```

---

### 6. **`backend/requirements.txt`** (UPDATED)
Added async dependencies:
```
sqlalchemy[asyncio]==2.0.25
asyncpg==0.29.0              # PostgreSQL async
aiosqlite==0.19.0            # SQLite async
```

---

### 7. **`.env.example`** (UPDATED)
Complete environment template with detailed comments

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
# For development (SQLite Async):
DATABASE_URL=sqlite+aiosqlite:///./agrosight.db

# For production (PostgreSQL Async):
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/agrosight

# Generate secret key:
SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
```

### Step 3: Run Application
```bash
uvicorn app.main:app --reload
```

This will:
1. `await init_db()` → Create all tables
2. Start FastAPI server
3. On shutdown → `await close_db()`

---

## 📊 Database Relationships

```
┌─────────────┐
│    User     │◄─────────────────┐
│ (id, email) │                  │
└─────────────┘                  │
      │                          │
      │ (1:N)                    │ (N:1)
      ▼                          │
┌──────────────────┐             │
│  Prediction      │             │
│ (id, user_id)────►────────────►│
│ (disease_id)     │ (N:1)       │
└──────────────────┘             │
      │                          │
      │ (N:1)           ┌────────┴─────┐
      ▼                 │  Disease     │
                        │ (id, name)   │
                        └──────────────┘
```

**Key Relations**:
- User → Predictions: One user has many predictions (cascade delete)
- Prediction → Disease: Many predictions map to one disease (SET NULL if disease deleted)
- User → Predictions → Disease: User's disease history via predictions

---

## 🔑 Important Notes

### ✅ What's Correct
1. **Async throughout**: FastAPI routes use `AsyncSession` with `await`
2. **Modern SQLAlchemy 2.0**: Uses `select()` API, not deprecated `query()`
3. **Proper relationships**: Define back_populates, use selectin for eager loading
4. **Indexes**: Added for common queries (user_id, created_at, disease_id)
5. **Cascade deletes**: User deletion removes their predictions
6. **Type safety**: Language enum prevents invalid values

### ⚠️ Common Gotchas to Avoid
1. **Never use `sessionmaker()` for async** — use `async_sessionmaker`
2. **Don't mix sync/async** — all routes must be `async def`
3. **Always use `await`** when calling async DB functions
4. **never commit() manually** — FastAPI dependency handles it
5. **Don't store passwords in plain text** — only hashed with bcrypt
6. **Confidence values**: Store as float (0.94, not "94%")

### 🛠️ Next: Write Your Routes

After this setup, your routes will look like:

```python
# Auth route example
@app.post("/api/auth/register")
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"user_id": new_user.id, "email": new_user.email}

# Predict route example
@app.post("/api/predict")
async def predict(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save image
    image_path = f"./uploads/user_{current_user.id}/pred_{uuid.uuid4()}.jpg"
    
    # Run TFLite inference
    confidence, disease_name = await run_model(image_path)
    
    # Save prediction
    prediction = Prediction(
        user_id=current_user.id,
        image_path=image_path,
        disease_name=disease_name,
        confidence=confidence,
        is_certain=confidence >= 0.7
    )
    db.add(prediction)
    await db.commit()
    
    return {"disease": disease_name, "confidence": f"{confidence*100:.1f}%"}
```

---

## 📝 Migration Commands (Alembic)

```bash
# Generate migration after model changes
alembic revision --autogenerate -m "Add prediction table"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

**Complete! Database and models are production-ready. Ready for the next task?**
