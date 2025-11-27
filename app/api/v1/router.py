"""
API v1 router that aggregates all endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health
from app.api.v1.endpoints import scope_analyzer
from app.api.v1.endpoints import users
from app.api.v1.endpoints import clients
from app.api.v1.endpoints import projects  # Add this import


api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(scope_analyzer.router, prefix="/scope-analyzer", tags=["scope-analyzer"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
