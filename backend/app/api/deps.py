"""
Dependency injection utilities for API routes.

This module exports common dependencies used across routes.
For authentication, use dependencies from app.api.routes.auth.
"""

# Re-export auth dependencies for convenience
from app.api.routes.auth import (
    get_current_user,
    get_current_user_optional,
)

__all__ = [
    "get_current_user",
    "get_current_user_optional",
]

