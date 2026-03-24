## AgroSight Authentication API Complete Guide

### ✅ What's Implemented

You now have a **complete JWT authentication system** with:

#### **Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/auth/register` | Register new user (returns JWT token) |
| `POST` | `/api/auth/login` | Login with email/password (returns JWT token) |
| `GET` | `/api/auth/me` | Get current authenticated user info |

---

### 📋 API Endpoints Details

#### **1. Register New User**

**Request:**
```bash
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@farm.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@farm.com",
    "is_active": true,
    "created_at": "2026-03-24T10:30:00"
  }
}
```

**Error (400):**
```json
{
  "detail": "Email already registered"
}
```

---

#### **2. Login User**

**Request:**
```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "john@farm.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@farm.com",
    "is_active": true,
    "created_at": "2026-03-24T10:30:00"
  }
}
```

**Error (401):**
```json
{
  "detail": "Invalid email or password"
}
```

---

#### **3. Get Current User**

**Request:**
```bash
GET http://localhost:8000/api/auth/me
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@farm.com",
  "is_active": true,
  "created_at": "2026-03-24T10:30:00"
}
```

**Error (401):**
```json
{
  "detail": "Invalid or expired token"
}
```

---

### 🧪 Testing with cURL (Command Line)

#### **Test 1: Register a New User**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@farm.com",
    "password": "CropMonitor2026!"
  }'
```

**Expected:** Returns JWT token and user info

---

#### **Test 2: Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@farm.com",
    "password": "CropMonitor2026!"
  }'
```

**Expected:** Returns JWT token

---

#### **Test 3: Get Current User (Protected)**
```bash
# Replace TOKEN with the access_token from login response
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected:** Returns authenticated user's profile

---

### 🧪 Testing with Postman

#### **Setup:**

1. **Create Collection**: "AgroSight Auth"
2. **Create Environment Variable**: `{{token}}`

#### **Test 1: Register**
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/register`
- **Body** (JSON):
```json
{
  "name": "Bob Johnson",
  "email": "bob@farm.com",
  "password": "FarmSecure123!"
}
```
- **Tests** (Script):
```javascript
if (pm.response.code === 201) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.access_token);
  console.log("✅ Registered! Token saved.");
}
```

#### **Test 2: Login**
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/login`
- **Body** (JSON):
```json
{
  "email": "bob@farm.com",
  "password": "FarmSecure123!"
}
```
- **Tests** (Script):
```javascript
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.access_token);
  console.log("✅ Logged in! Token: " + jsonData.access_token);
}
```

#### **Test 3: Get Current User**
- **Method**: GET
- **URL**: `{{base_url}}/api/auth/me`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Tests** (Script):
```javascript
pm.test("Should return 200 and user info", function () {
  pm.response.to.have.status(200);
  pm.response.to.be.json;
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("email");
});
```

---

### 🔒 Security Features Implemented

✅ **Password Hashing**: Bcrypt (10 rounds, industry standard)
✅ **JWT Tokens**: HS256 algorithm with 30-minute expiration (configurable)
✅ **HTTP Bearer Scheme**: Standard OAuth2 token format
✅ **Input Validation**: Pydantic schemas with email validation
✅ **Async/Await**: All operations non-blocking (high performance)
✅ **Soft Deletes**: Users can be deactivated without losing data

---

### 🛠️ How to Use in Other Routes

**Example: Get current user in /predict endpoint**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.models import User
from app.database import get_db

router = APIRouter()

@router.post("/predict")
async def predict(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Only authenticated users can predict."""
    print(f"Request from user: {current_user.name} (ID: {current_user.id})")
    # Your prediction logic here
    return {"user_id": current_user.id}
```

---

### 🔐 Token Format

**JWT Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**JWT Payload:**
```json
{
  "sub": 1,           # User ID
  "exp": 1711270200  # Expiration timestamp
}
```

---

### ⚙️ Configuration (.env)

```env
# JWT Settings
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Generate Secret Key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

### 📝 Error Codes

| Code | Scenario | Solution |
|------|----------|----------|
| 201 | Register successful | Check token in response |
| 200 | Login/fetch user successful | Proceed with token |
| 400 | Email already exists | Use different email |
| 401 | Invalid credentials or token | Check email/password or re-login |
| 403 | User inactive | Contact admin |
| 422 | Invalid input | Check email format, password length |

---

### 🚀 What's Next

After auth is working:
1. **Build /predict endpoint** — Upload image, run TFLite model
2. **Build /history endpoint** — Get user's predictions
3. **Build disease_info.py** — Recommendation engine
4. **Add Alembic migrations** — Database versioning

---

### 📚 File Structure

```
backend/app/
├── core/
│   └── security.py          ← Password hashing, JWT tokens, get_current_user
├── schemas/
│   └── user.py              ← Pydantic schemas (UserCreate, UserLogin, etc.)
├── api/routes/
│   └── auth.py              ← /register, /login, /me endpoints
└── models/
    └── user.py              ← User SQLAlchemy model
```

---

**Auth system complete and tested! Ready for prediction endpoint next?**
