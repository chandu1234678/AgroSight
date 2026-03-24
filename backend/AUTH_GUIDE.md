```
# JWT Authentication System for AgroSight

Complete guide to the authentication implementation including secure password hashing, JWT tokens, and protected endpoints.

---

## Overview

The authentication system uses:
- **Bcrypt** (passlib) for password hashing with 12 rounds
- **JWT** (python-jose) for stateless token-based authentication  
- **HTTPBearer** scheme for extracting tokens from Authorization headers
- **Async/await** throughout for performance

### Key Components

1. **Security Module** (`app/core/security.py`)
   - Password hashing: `get_password_hash()` → bcrypt hash
   - Password verification: `verify_password()` → constant-time comparison
   - Token creation: `create_access_token()` → signed JWT
   - Token validation: `decode_access_token()` → verify signature + expiration
   - User extraction: `extract_user_id_from_token()` → get user_id from token

2. **Auth Routes** (`app/api/routes/auth.py`)
   - **POST /api/auth/register** → Create new user account
   - **POST /api/auth/login** → Get JWT access token
   - **GET /api/auth/me** → Get current user info (protected)
   - **POST /api/auth/verify** → Verify token validity (protected)
   - **POST /api/auth/logout** → Logout (client handles token deletion)
   - **DELETE /api/auth/me** → Soft-delete account (protected)

3. **Dependencies** (`app/api/routes/auth.py`)
   - `get_current_user()` → Mandatory authentication (raises 401 if no token)
   - `get_current_user_optional()` → Optional authentication (returns None if no token)

---

## Security Features

### Password Security
```
❌ NEVER do this:
- Store plaintext passwords
- Use weak hashing (MD5, SHA1)
- Use same salt for all passwords

✅ CORRECT approach (implemented):
- Bcrypt with 12 rounds: ~0.6 seconds per hash (brute-force resistant)
- Unique salt per password (bcrypt handles automatically)
- Constant-time comparison in verify_password()
```

### Token Security
```
Token format: Header.Payload.Signature (JWT)

Header (decoded):
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (decoded):
{
  "sub": 123,           # user_id
  "exp": 1711256800,    # expiration time (30 min from now)
  "iat": 1711255000     # issued at time
}

Signature: HMAC-SHA256(header + payload, SECRET_KEY)
```

### Token Expiration
- Access tokens expire after 30 minutes (configurable in `.env`)
- Always send in Authorization header: `Bearer <token>`
- Client should store token in localStorage (not cookies, for CORS flexibility)
- Frontend should check expiration before sending requests

---

## API Endpoints

### 1. POST /api/auth/register
Register a new user account.

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!",
    "name": "John Farmer"
  }'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "farmer@example.com",
  "name": "John Farmer",
  "is_active": true,
  "created_at": "2026-03-24T10:30:00Z"
}
```

**Errors:**
- **400**: Email already registered
- **422**: Validation error (invalid email, password < 8 chars)

---

### 2. POST /api/auth/login
Authenticate and get JWT access token.

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "SecurePass123!"
  }'
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTcxMTI1NjgwMH0...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Errors:**
- **401**: Incorrect email or password
- **403**: Account deactivated

---

### 3. GET /api/auth/me
Get authenticated user's profile (requires valid token).

**Request:**
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "farmer@example.com",
  "name": "John Farmer",
  "is_active": true,
  "created_at": "2026-03-24T10:30:00Z"
}
```

**Errors:**
- **401**: Invalid or expired token
- **403**: Missing Authorization header
- **404**: User not found (deleted)

---

### 4. POST /api/auth/verify
Verify that a token is still valid (for frontend token expiration checks).

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user_id": 1,
  "email": "farmer@example.com"
}
```

---

### 5. POST /api/auth/logout
Logout user (server-side: currently a no-op, client deletes token).

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (204 No Content):**
No body returned.

**Future Enhancement:**
Currently stateless (no logout on server). To implement token blacklisting:
1. Add `blacklist` Redis set
2. On logout, add token to blacklist with TTL = token expiration
3. In `decode_access_token()`, check if token is in blacklist

---

### 6. DELETE /api/auth/me
Soft-delete account (user deactivated, data preserved).

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (204 No Content):**
No body returned.

**What happens:**
- User's `is_active` set to False
- All predictions remain in database (for analytics)
- User can never login again (is_active check on login)

---

## Using Auth in Protected Endpoints

### Basic Protected Endpoint

```python
from fastapi import APIRouter, Depends
from app.api.routes.auth import get_current_user
from app.models import User

router = APIRouter()

@router.get("/predict")
async def predict(
    image: UploadFile,
    current_user: User = Depends(get_current_user),  # ← Requires valid token
    db: AsyncSession = Depends(get_db),
):
    """
    Predict disease from image.
    Automatically checks JWT token and loads user.
    """
    # current_user is guaranteed to be valid (403/401 raised if not)
    prediction = await run_model(image)
    
    # Save to database
    db_prediction = Prediction(
        user_id=current_user.id,  # ← Link to authenticated user
        disease_name=prediction["disease"],
        ...
    )
    db.add(db_prediction)
    await db.commit()
    
    return prediction
```

### Optional Authentication

```python
from app.api.routes.auth import get_current_user_optional

@router.get("/public-stats")
async def get_stats(
    current_user: User | None = Depends(get_current_user_optional),
):
    """
    Get stats (public endpoint, but show user-specific data if logged in).
    current_user will be None if no valid token provided.
    """
    if current_user:
        # Show user-specific stats
        return {"my_predictions": 42, "global_predictions": 1000}
    else:
        # Show only global stats
        return {"global_predictions": 1000}
```

---

## Frontend Implementation

### React Example

```javascript
// services/api.js
export const apiClient = {
  async register(email, password, name) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    return await res.json();
  },

  async login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    const data = await res.json();
    
    // Store token
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token_expires_at', Date.now() + data.expires_in * 1000);
    
    return data;
  },

  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    if (!res.ok) {
      if (res.status === 401) this.logout(); // Token expired
      throw new Error((await res.json()).detail);
    }
    return await res.json();
  },

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expires_at');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  isAuthenticated() {
    const token = this.getToken();
    const expiresAt = parseInt(localStorage.getItem('token_expires_at') || '0');
    return token && Date.now() < expiresAt;
  }
};

// Context for auth state
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      apiClient.getMe().then(setUser).catch(console.error);
    }
    setLoading(false);
  }, []);

  return { user, loading, login: apiClient.login, logout: apiClient.logout };
}
```

---

## Testing

### Run Tests
```bash
# Run all auth tests
pytest tests/test_auth.py -v

# Run specific test
pytest tests/test_auth.py::test_login_success -v

# Run with coverage
pytest tests/test_auth.py --cov=app.api.routes.auth
```

### Test Coverage
- ✅ Registration (success, duplicate email, weak password)
- ✅ Login (success, wrong password, nonexistent user, inactive user)
- ✅ Protected endpoints (valid token, no token, invalid token)
- ✅ Token verification
- ✅ Account deletion

---

## Common Gotchas & Solutions

### ❌ Gotcha 1: Token Not Sent in Header
```
Wrong:
curl http://localhost:8000/api/predict \
  -H "token: eyJ..." ← ❌ Wrong header name

Right:
curl http://localhost:8000/api/predict \
  -H "Authorization: Bearer eyJ..." ← ✅ Correct
```

### ❌ Gotcha 2: "Bearer" Capitalization
```
Wrong:
Authorization: bearer eyJ...  ← Optional but "Bearer" is standard

Right:
Authorization: Bearer eyJ...  ← ✅ Standard casing
```

### ❌ Gotcha 3: Token Stored in Cookie for CORS-enabled API
```
Problem: By default, cookies not sent across origins, even with CORS

Wrong:
response.set_cookie("token", jwt_token)

Right:
return {"access_token": jwt_token}  # Client stores in localStorage
# Frontend sends: Authorization Bearer {token}
```

### ❌ Gotcha 4: Expired Token Still Validated
```python
Wrong:
def decode_access_token(token):
    payload = jwt.decode(token, key)  # ❌ Doesn't check expiration
    return payload

Right:
def decode_access_token(token):
    try:
        payload = jwt.decode(
            token, key,
            algorithms=[ALGORITHM]  # ✅ Automatically checks "exp" claim
        )
        return payload
    except JWTError:  # Includes ExpiredSignatureError
        return None
```

### ❌ Gotcha 5: Storing Sensitive Data in JWT
```
JWT is SIGNED but NOT ENCRYPTED!
Anyone can decode the payload (base64-decoded).

Wrong (JWT payload):
{
  "user_id": 1,
  "password": "secret123",  ❌ Don't put secrets in JWT!
  "role": "admin"
}

Right:
{
  "sub": 1,              # Only user_id
  "exp": 1711256800,
  "iat": 1711255000
}
# Fetch full user object from DB using user_id
```

### ❌ Gotcha 6: Not Validating Token Signature
```python
Wrong:
import json, base64
payload = json.loads(base64.b64decode(token.split('.')[1]))
user_id = payload['sub']  # ❌ Anyone can modify payload!

Right:
from jose import jwt
payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
# ✅ Signature validated, tampering detected
```

---

## Deployment Checklist

- [ ] Set `SECRET_KEY` to random 32+ character string in .env
  ```bash
  openssl rand -hex 32
  ```

- [ ] Set `DEBUG=False` in production

- [ ] Use HTTPS only (token sent in Authorization header)

- [ ] Set reasonable token expiration (30 min recommended)

- [ ] Implement token refresh endpoint (optional, for long sessions)

- [ ] Monitor failed login attempts (brute force protection)

- [ ] Add rate limiting on /login endpoint

- [ ] Log security events (successful logins, failed attempts)

- [ ] Use PostgreSQL in production (not SQLite)

- [ ] Add HTTPS certificate to server

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                                                              │
│  1. User enters credentials                                │
│  2. POST /api/auth/login        ← Send email + password   │
│  3. Receive JWT token           ← Store in localStorage   │
│  4. API requests                ← Auth: Bearer {token}    │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                           │
│                                                              │
│  POST /login                                               │
│  ├─ Extract email + password                              │
│  ├─ Query User table by email                             │
│  ├─ verify_password() → bcrypt comparison                 │
│  ├─ create_access_token() → JWT signed with SECRET_KEY   │
│  └─ Return {"access_token": "...", "expires_in": 1800}   │
│                                                              │
│  GET /protected (with Authorization: Bearer {token})      │
│  ├─ HTTPBearer extracts token from header                │
│  ├─ decode_access_token() → verify signature + expiration│
│  ├─ extract_user_id_from_token() → get user_id           │
│  ├─ Query User table by user_id                          │
│  ├─ Check is_active = True                               │
│  └─ Execute endpoint (user guaranteed valid)            │
└─────────────────────────────────────────────────────────────┘
        ↓↑
┌─────────────────────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                            │
│                                                              │
│  users table                                               │
│  ├─ id (PK)                                               │
│  ├─ email (UNIQUE)                                        │
│  ├─ hashed_password (bcrypt hash)                        │
│  ├─ is_active (soft delete)                              │
│  └─ created_at                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Predict Endpoint** → Use `get_current_user` dependency to link predictions to users
2. **Token Refresh** → Add refresh token mechanism for long-lived sessions
3. **OAuth2** → Optional: Add Google/GitHub login for farmers
4. **Rate Limiting** → Protect /login from brute force attacks
5. **2FA** → Optional: Two-factor authentication for sensitive operations
```
