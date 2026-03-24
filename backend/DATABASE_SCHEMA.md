```
# AgroSight Database Schema Documentation

## Overview
This document describes the PostgreSQL schema for AgroSight, including table designs, relationships, and indexes.

---

## Table Schemas

### 1. USERS Table
Stores user account information and authentication data.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
    
    UNIQUE(email),
    INDEX(email),
    INDEX(is_active)
);
```

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | SERIAL | Auto-increment primary key |
| `name` | VARCHAR(255) | User's full name |
| `email` | VARCHAR(255) | Unique login email (case-insensitive in app logic) |
| `hashed_password` | VARCHAR(255) | Bcrypt/Argon2 hash (never store plaintext!) |
| `is_active` | BOOLEAN | Soft-delete flag: FALSE = deactivated account, data preserved |
| `created_at` | TIMESTAMP | Account creation time (UTC) |

**Relationships:**
- 1 User → Many Predictions (via predictions.user_id)

**Common Queries:**
```python
# Get user by email (login)
user = await db.execute(
    select(User).where(User.email == "farmer@example.com")
)

# Get active users only
users = await db.execute(select(User).where(User.is_active == True))

# Count users registered this month
from datetime import datetime, timedelta
month_ago = datetime.utcnow() - timedelta(days=30)
count = await db.execute(
    select(func.count(User.id)).where(User.created_at >= month_ago)
)
```

---

### 2. DISEASES Table
Reference table storing all known crop diseases and their information.

```sql
CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    crop_type VARCHAR(255) NOT NULL,
    cause TEXT NOT NULL,
    organic_treatment TEXT NOT NULL,
    chemical_treatment TEXT NOT NULL,
    prevention TEXT NOT NULL,
    severity_level VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
    
    UNIQUE(name),
    INDEX(crop_type),
    INDEX(name)
);
```

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | SERIAL | Auto-increment primary key |
| `name` | VARCHAR(255) | Disease name (e.g., "Tomato Late Blight") |
| `crop_type` | VARCHAR(255) | Affected crop (e.g., "Tomato", "Potato") |
| `cause` | TEXT | Root cause/pathogen description |
| `organic_treatment` | TEXT | Natural/organic remedy |
| `chemical_treatment` | TEXT | Chemical/synthetic fungicide recommendation |
| `prevention` | TEXT | Preventive measures (newline-separated list) |
| `severity_level` | VARCHAR(50) | "low", "medium", or "high" |
| `created_at` | TIMESTAMP | When record was added |

**Example Data:**
```json
{
  "id": 1,
  "name": "Tomato Late Blight",
  "crop_type": "Tomato",
  "cause": "Phytophthora infestans fungus — spreads in cool, wet conditions",
  "organic_treatment": "Spray neem oil solution (3%) weekly; Remove infected leaves",
  "chemical_treatment": "Apply copper-based fungicide (e.g., Bordeaux mixture 1%)",
  "prevention": "Avoid overhead watering\nSpace plants 60cm apart\nRotate crops yearly",
  "severity_level": "high"
}
```

**Relationships:**
- 1 Disease → Many Predictions (via predictions.disease_id)

**Common Queries:**
```python
# Get disease by name
disease = await db.execute(
    select(Disease).where(Disease.name == "Tomato Late Blight")
)

# Get all diseases for a crop
diseases = await db.execute(
    select(Disease).where(Disease.crop_type == "Tomato")
)

# Get high-severity diseases
dangerous = await db.execute(
    select(Disease).where(Disease.severity_level == "high")
)
```

---

### 3. PREDICTIONS Table
Core transaction table storing every disease detection result.

```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disease_id INTEGER REFERENCES diseases(id) ON DELETE SET NULL,
    image_path VARCHAR(500) NOT NULL,
    disease_name VARCHAR(255) NOT NULL,
    confidence FLOAT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    is_certain BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
    
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(disease_id) REFERENCES diseases(id) ON DELETE SET NULL,
    INDEX(user_id),
    INDEX(disease_name),
    INDEX(created_at),
    INDEX(user_id, created_at),
    INDEX(disease_id, created_at)
);
```

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | SERIAL | Auto-increment primary key |
| `user_id` | INTEGER FK | References users.id (CASCADE on delete) |
| `disease_id` | INTEGER FK | References diseases.id (NULL if confidence < 70%) |
| `image_path` | VARCHAR(500) | Local path (e.g., `/uploads/user_123/img_abc.jpg`) or S3 URL |
| `disease_name` | VARCHAR(255) | Detected disease name from TFLite model |
| `confidence` | FLOAT | Model confidence (0.0 to 1.0) |
| `language` | VARCHAR(10) | Response language: "en" (English), "te" (Telugu), "hi" (Hindi) |
| `is_certain` | BOOLEAN | TRUE if confidence >= threshold (70%), FALSE otherwise |
| `notes` | TEXT | Optional user notes or additional context |
| `created_at` | TIMESTAMP | Prediction timestamp (UTC) |

**Relationships:**
- Many Predictions → 1 User (via user_id)
- Many Predictions → 1 Disease (via disease_id, nullable)

**Common Queries:**
```python
# Get user's recent predictions
from sqlalchemy import desc
user_predictions = await db.execute(
    select(Prediction)
    .where(Prediction.user_id == user_id)
    .order_by(desc(Prediction.created_at))
    .limit(10)
)

# Get all uncertain predictions (confidence < 70%)
uncertain = await db.execute(
    select(Prediction).where(Prediction.is_certain == False)
)

# Statistics: most common diseases
from sqlalchemy import func
top_diseases = await db.execute(
    select(
        Prediction.disease_name,
        func.count(Prediction.id).label("count")
    )
    .group_by(Prediction.disease_name)
    .order_by(desc(func.count(Prediction.id)))
    .limit(5)
)

# Get predictions for a specific disease across all users
disease_predictions = await db.execute(
    select(Prediction).where(Prediction.disease_id == disease_id)
)
```

---

## Foreign Key Constraints

### ON DELETE Behavior

| Relationship | ON DELETE | Reason |
|--------------|-----------|--------|
| predictions.user_id → users.id | **CASCADE** | Delete user → delete all their predictions |
| predictions.disease_id → diseases.id | **SET NULL** | Delete disease info → predictions.disease_id becomes NULL (but disease_name is preserved) |

**Important:** When a disease is deleted from the diseases table, the prediction still exists (with NULL disease_id), but disease_name stores the disease name for records.

---

## Indexes Strategy

### Single-Column Indexes
```sql
-- User queries by email (login, password reset)
CREATE INDEX ix_users_email ON users(email);

-- Active/inactive user filtering
CREATE INDEX ix_users_is_active ON users(is_active);

-- Disease lookup by name
CREATE INDEX ix_diseases_name ON diseases(name);

-- Crop type filtering
CREATE INDEX ix_diseases_crop_type ON diseases(crop_type);

-- Prediction filtering by user
CREATE INDEX ix_predictions_user_id ON predictions(user_id);

-- Sorting predictions by time
CREATE INDEX ix_predictions_created_at ON predictions(created_at);

-- Disease name filtering/search
CREATE INDEX ix_predictions_disease_name ON predictions(disease_name);
```

### Composite Indexes
```sql
-- Get user's predictions sorted by date (most common query)
CREATE INDEX ix_user_created ON predictions(user_id, created_at);

-- Get all predictions for a disease sorted by date
CREATE INDEX ix_disease_created ON predictions(disease_id, created_at);
```

---

## Data Integrity Rules

1. **Email Uniqueness:** Each email is unique across users. Used as login identifier.
2. **Disease Name Uniqueness:** Each disease name is unique in diseases table.
3. **Cascade Delete:** Deleting a user automatically deletes all their predictions.
4. **Nullable disease_id:** Predictions can exist without disease_id (for uncertain predictions or deleted diseases).
5. **Confidence Range:** confidence should be [0.0, 1.0]. Application enforces this.
6. **Language Code:** Must be one of "en", "te", "hi". Application validates.

---

## Migration Strategy

Use Alembic to version control database changes:

```bash
# Create initial schema
alembic upgrade head

# Add a new column
alembic revision --autogenerate -m "Add user_role column"
alembic upgrade head

# Downgrade one revision
alembic downgrade -1

# Show current schema version
alembic current
```

All migrations are in `backend/app/db/migrations/versions/`.

---

## Performance Optimization Tips

### Query Optimization
1. **Always use indexes:** Use .where() clauses on indexed columns
2. **Lazy loading:** Override relationship lazy loading with explicit joins for batch queries
3. **Aggregate queries:** Use SQLAlchemy func.count(), func.avg() instead of client-side aggregation
4. **Pagination:** Always LIMIT queries for user-facing endpoints
5. **Timezone handling:** All datetimes stored in UTC (timezone=True)

### Connection Pooling
PostgreSQL async engine configuration:
- `pool_size=20`: Min 20 connections
- `max_overflow=40`: Allow up to 60 total connections
- `pool_recycle=3600`: Recycle connections every hour (prevents idle timeout)

### Batch Operations
```python
# Slow: N+1 query problem
for user in users:
    predictions = await db.execute(select(Prediction).where(...))

# Fast: Batch load with join
users_with_predictions = await db.execute(
    select(User)
    .options(selectinload(User.predictions))  # Eager load
)
```

---

## Disaster Recovery

### Backup Strategy
```bash
# Dump database schema + data
pg_dump postgresql://user:pass@localhost/agrosight > backup.sql

# Restore from backup
psql postgresql://user:pass@localhost/agrosight < backup.sql

# Pg_dump with gzip for large databases
pg_dump postgresql://user:pass@localhost/agrosight | gzip > backup.sql.gz
```

### Data Retention
- **Users:** Keep forever (soft-delete with is_active flag)
- **Predictions:** Suggest 2-year retention for privacy/analytics balance
- **Diseases:** Keep as reference data indefinitely

---

## Testing

### Create Test Database
```python
# In tests, use SQLite for speed
TEST_DATABASE_URL = "sqlite:///./test.db"

# Or PostgreSQL for production-like testing
TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost/agrosight_test"
```

### Fixtures
```python
@pytest.fixture
async def db():
    """Test database session."""
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_sessionmaker(engine) as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
```

---

## Related Files

- **Models:** `backend/app/models.py`
- **Database Setup:** `backend/app/database.py`
- **Migrations:** `backend/app/db/migrations/versions/`
- **Config:** `backend/app/core/config.py`
- **Schemas (Pydantic):** `backend/app/schemas/user.py`
```
