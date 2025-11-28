"""
API v1 endpoints.
"""

# Don't eagerly import modules here to avoid circular imports.
# Each module is imported directly in router.py where needed.

__all__ = [
    "auth",
    "clients",
    "client_requests",
    "dashboard",
    "health",
    "projects",
    "proposals",
    "scope_analyzer",
    "scope_items",
    "users",
]
