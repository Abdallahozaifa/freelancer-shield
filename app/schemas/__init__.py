"""
Pydantic schemas for request/response validation.
"""

from app.schemas.auth import Token, UserLogin, UserRegister, UserResponse
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse, ClientList
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectDetail,
    ProjectList,
)
from app.schemas.scope_item import (
    ScopeItemCreate,
    ScopeItemUpdate,
    ScopeItemResponse,
    ScopeItemReorder,
    ScopeProgress,
)

__all__ = [
    "Token",
    "UserLogin",
    "UserRegister",
    "UserResponse",
    "ClientCreate",
    "ClientUpdate",
    "ClientResponse",
    "ClientList",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectDetail",
    "ProjectList",
    "ScopeItemCreate",
    "ScopeItemUpdate",
    "ScopeItemResponse",
    "ScopeItemReorder",
    "ScopeProgress",
]