"""
API v1 router that aggregates all endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Future modules will be added here:
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
# api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
