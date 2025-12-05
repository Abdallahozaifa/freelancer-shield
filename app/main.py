"""
Freelancer Project Shield - Main FastAPI Application

A micro-SaaS tool that detects scope creep and protects freelancer earnings.
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan handler for startup/shutdown events."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Detect scope creep and protect your freelance earnings",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API router
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    
    # Health check endpoint (for Fly.io)
    @app.get("/health")
    async def health_check() -> dict:
        """Health check endpoint for monitoring."""
        return {"status": "healthy", "version": settings.app_version}
    
    return app


app = create_app()


# API info endpoint
@app.get("/api")
async def api_root() -> dict:
    """API root endpoint with info."""
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }


# ============================================
# Serve React Frontend (for production)
# ============================================
# In container: /app/app/main.py -> static at /app/static
static_dir = Path(__file__).parent.parent / "static"

if static_dir.exists():
    # Serve static assets (JS, CSS, images)
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
    
    # Serve favicon
    @app.get("/favicon.ico")
    async def favicon():
        favicon_path = static_dir / "favicon.ico"
        if favicon_path.exists():
            return FileResponse(favicon_path)
        # Try shield.svg as fallback
        shield_path = static_dir / "shield.svg"
        if shield_path.exists():
            return FileResponse(shield_path)
        return FileResponse(static_dir / "index.html")
    
    # Serve other static files (robots.txt, etc.)
    @app.get("/robots.txt")
    async def robots():
        robots_path = static_dir / "robots.txt"
        if robots_path.exists():
            return FileResponse(robots_path)
        return {"detail": "Not found"}
    
    # Catch-all route for React Router (must be LAST)
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Don't intercept API routes, docs, or health check
        if (full_path.startswith("api/") or 
            full_path.startswith("docs") or 
            full_path.startswith("redoc") or
            full_path.startswith("openapi") or
            full_path == "health"):
            return {"detail": "Not found"}
        
        # Check if it's a real file in static dir
        file_path = static_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        # Serve index.html for all other routes (React Router handles them)
        index_path = static_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        return {"detail": "Not found"}
