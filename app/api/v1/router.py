"""
API v1 router that aggregates all endpoint routers.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health
from app.api.v1.endpoints import scope_analyzer
from app.api.v1.endpoints import users
from app.api.v1.endpoints import clients
from app.api.v1.endpoints import projects
from app.api.v1.endpoints import scope_items
from app.api.v1.endpoints import client_requests
from app.api.v1.endpoints import proposals
from app.api.v1.endpoints import billing
from app.api.v1.endpoints import portal
from app.api.v1.endpoints import client_portal
from app.api.v1.endpoints import public_requests
from app.api.v1.endpoints.dashboard import router as dashboard_router


api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(scope_analyzer.router, prefix="/scope-analyzer", tags=["scope-analyzer"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(clients.router, prefix="/clients", tags=["clients"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(scope_items.router, prefix="/projects", tags=["scope"])
api_router.include_router(client_requests.router, prefix="/projects", tags=["requests"])
api_router.include_router(proposals.router, prefix="/projects", tags=["proposals"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(portal.router, prefix="/portal", tags=["portal"])
api_router.include_router(client_portal.router, prefix="/client-portal", tags=["client-portal"])
api_router.include_router(public_requests.router, prefix="/request", tags=["public-requests"])
