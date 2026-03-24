"""
Authentication routes: register, login, logout, and token refresh.
Uses JWT tokens for stateless authentication.

Endpoints:
  POST /api/auth/register  — Create new user account
  POST /api/auth/login     — Get JWT access token
  GET  /api/auth/me        — Get current user info
  POST /api/auth/logout    — Logout (client-side token deletion)
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    extract_user_id_from_token,
)
from app.database import get_db
from app.models import User
from app.schemas.user import UserCreate, UserResponse, Token, ErrorResponse

router = APIRouter()
security = HTTPBearer()


# ============================================================================
# DEPENDENCIES
# ============================================================================

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency to get the authenticated user from JWT token.
    
    Usage:
        @app.get("/protected")
        async def protected_route(current_user: User = Depends(get_current_user)):
            return {"user_id": current_user.id}
    
    Raises:
        HTTPException: 401 if token is invalid/expired, 404 if user not found
    """
    token = credentials.credentials
    
    # Extract user ID from token
    user_id = extract_user_id_from_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    return user


async def get_current_user_optional(
    credentials: HTTPAuthCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Optional authentication dependency (doesn't fail if token missing).
    Returns None if no valid token provided.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    user_id = extract_user_id_from_token(token)
    
    if not user_id:
        return None
    
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    tags=["Authentication"],
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Create a new user account.
    
    **Request:**
    ```json
    {
        "email": "farmer@agrosight.com",
        "password": "SecurePass123!",
        "name": "John Farmer"
    }
    ```
    
    **Response:**
    ```json
    {
        "id": 1,
        "email": "farmer@agrosight.com",
        "name": "John Farmer",
        "is_active": true,
        "created_at": "2026-03-24T10:30:00Z"
    }
    ```
    
    **Errors:**
    - 400: Email already registered
    - 422: Invalid email format or password too short
    """
    # Validate email isn't already registered
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Hash password
    try:
        hashed_password = get_password_hash(user_data.password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        name=user_data.name or user_data.email.split("@")[0],  # Use email prefix as default name
        hashed_password=hashed_password,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


@router.post(
    "/login",
    response_model=Token,
    summary="Login and get JWT token",
    tags=["Authentication"],
)
async def login(
    user_data: UserCreate,  # Accept JSON body (email + password)
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    Authenticate user and return JWT access token.
    
    **Request:**
    ```json
    {
        "email": "farmer@agrosight.com",
        "password": "SecurePass123!"
    }
    ```
    
    **Response:**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "token_type": "bearer",
        "expires_in": 1800
    }
    ```
    
    **Errors:**
    - 401: Incorrect email or password
    - 403: Account deactivated
    
    **Usage (Frontend):**
    ```javascript
    // Store token in localStorage
    localStorage.setItem('access_token', response.access_token);
    
    // Send token in Authorization header
    fetch('/api/protected', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    ```
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalars().first()
    
    # Validate credentials
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support.",
        )
    
    # Create JWT token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    tags=["Authentication"],
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the authenticated user's profile information.
    
    **Requirements:** Valid JWT token in Authorization header
    
    **Response:**
    ```json
    {
        "id": 1,
        "email": "farmer@agrosight.com",
        "name": "John Farmer",
        "is_active": true,
        "created_at": "2026-03-24T10:30:00Z"
    }
    ```
    
    **Errors:**
    - 401: Missing or invalid token
    - 404: User not found (deleted or corrupted)
    """
    return current_user


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout user",
    tags=["Authentication"],
)
async def logout(
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Logout user (client-side operation).
    
    Since JWT tokens are stateless, this endpoint doesn't do much server-side.
    Client should:
    1. Delete token from localStorage
    2. Redirect to login page
    
    This endpoint exists for future features like token blacklisting.
    
    **Returns:** 204 No Content
    """
    # TODO: Implement token blacklist for logout
    # For now, client just deletes the token from localStorage
    pass


@router.post(
    "/verify",
    response_model=dict,
    summary="Verify JWT token validity",
    tags=["Authentication"],
)
async def verify_token(
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Verify that a JWT token is still valid.
    
    Useful for frontend to check if user is still authenticated.
    
    **Response:**
    ```json
    {
        "valid": true,
        "user_id": 1,
        "email": "farmer@agrosight.com"
    }
    ```
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "email": current_user.email,
    }


# ============================================================================
# ERROR HANDLERS (Optional: add to main.py if needed)
# ============================================================================

@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user account",
    tags=["Authentication"],
)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete user account (soft delete via is_active flag).
    
    Predictions are preserved for analytics/history.
    
    **Returns:** 204 No Content
    """
    current_user.is_active = False
    await db.commit()

