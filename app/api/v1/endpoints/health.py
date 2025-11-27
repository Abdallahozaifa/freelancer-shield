"""
Health check endpoints.
"""

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("")
async def health_check() -> dict:
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
    }
