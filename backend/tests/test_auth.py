"""
Example usage and integration tests for authentication endpoints.

Run this script to test the auth routes:
    python -m pytest tests/test_auth.py -v

Or test manually using curl or Postman.
"""

import pytest
import asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.database import get_db
from app.db.base import Base
from app.models import User
from app.core.security import get_password_hash

# ============================================================================
# TEST DATABASE SETUP
# ============================================================================

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def test_db():
    """Create a test database.
    
    This fixture:
    1. Creates tables in test database
    2. Provides AsyncSession for tests
    3. Cleans up after test
    """
    # Create test engine
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        future=True,
        connect_args={"timeout": 10},
    )
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session factory
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    # Override get_db dependency
    async def override_get_db():
        async with async_session() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield async_session
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()
    app.dependency_overrides.clear()


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
async def test_user(test_db):
    """Create a test user in the database."""
    async with test_db() as session:
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password=get_password_hash("TestPassword123"),
            is_active=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


@pytest.fixture
async def client(test_db):
    """Create AsyncClient for testing."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


# ============================================================================
# REGISTRATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_register_success(client):
    """Test successful user registration."""
    response = await client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePassword123",
            "name": "New User",
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"
    assert data["is_active"] is True
    assert "id" in data
    assert "created_at" in data
    # Password should NOT be in response
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    """Test that registering with duplicate email fails."""
    response = await client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",  # Already registered
            "password": "AnotherPassword123",
            "name": "Another User",
        }
    )
    
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_short_password(client):
    """Test that short passwords are rejected."""
    response = await client.post(
        "/api/auth/register",
        json={
            "email": "user@example.com",
            "password": "short",  # Too short
            "name": "User",
        }
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email(client):
    """Test that invalid emails are rejected."""
    response = await client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": "ValidPassword123",
            "name": "User",
        }
    )
    
    assert response.status_code == 422


# ============================================================================
# LOGIN TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    """Test successful login returns JWT token."""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPassword123",
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data
    assert data["expires_in"] > 0
    
    # Token should be JWT format (3 parts separated by dots)
    token_parts = data["access_token"].split(".")
    assert len(token_parts) == 3


@pytest.mark.asyncio
async def test_login_wrong_password(client, test_user):
    """Test login with wrong password fails."""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword",
        }
    )
    
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    """Test login with email that doesn't exist."""
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "AnyPassword123",
        }
    )
    
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_inactive_user(client, test_db):
    """Test that inactive users cannot login."""
    # Create inactive user
    async with test_db() as session:
        user = User(
            email="inactive@example.com",
            name="Inactive",
            hashed_password=get_password_hash("Password123"),
            is_active=False,
        )
        session.add(user)
        await session.commit()
    
    # Try to login
    response = await client.post(
        "/api/auth/login",
        json={
            "email": "inactive@example.com",
            "password": "Password123",
        }
    )
    
    assert response.status_code == 403
    assert "deactivated" in response.json()["detail"]


# ============================================================================
# PROTECTED ENDPOINT TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_get_current_user_success(client, test_user):
    """Test getting current user info with valid token."""
    # First login
    login_response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPassword123",
        }
    )
    token = login_response.json()["access_token"]
    
    # Then get user info
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_get_current_user_no_token(client):
    """Test that /me without token returns 403."""
    response = await client.get("/api/auth/me")
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_current_user_invalid_token(client):
    """Test that invalid token is rejected."""
    response = await client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"}
    )
    
    assert response.status_code == 401
    assert "Invalid" in response.json()["detail"]


@pytest.mark.asyncio
async def test_verify_token_success(client, test_user):
    """Test token verification endpoint."""
    # Login
    login_response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPassword123",
        }
    )
    token = login_response.json()["access_token"]
    
    # Verify token
    response = await client.post(
        "/api/auth/verify",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["user_id"] == test_user.id
    assert data["email"] == "test@example.com"


# ============================================================================
# LOGOUT & ACCOUNT DELETION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_logout(client, test_user):
    """Test logout endpoint."""
    # Login
    login_response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPassword123",
        }
    )
    token = login_response.json()["access_token"]
    
    # Logout
    response = await client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_delete_account(client, test_db, test_user):
    """Test soft-delete account."""
    # Login
    login_response = await client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPassword123",
        }
    )
    token = login_response.json()["access_token"]
    
    # Delete account
    response = await client.delete(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 204
    
    # Verify user is deactivated
    async with test_db() as session:
        from sqlalchemy import select
        result = await session.execute(
            select(User).where(User.id == test_user.id)
        )
        user = result.scalars().first()
        assert user.is_active is False

