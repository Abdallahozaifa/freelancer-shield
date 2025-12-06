"""
Application configuration using Pydantic Settings.
All settings are loaded from environment variables with sensible defaults.
"""

from functools import lru_cache
from typing import Literal, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # Application
    app_name: str = "Freelancer Project Shield"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: Literal["development", "testing", "production"] = "development"
    
    # API
    api_v1_prefix: str = "/api/v1"
    
    # Database - Fly.io sets DATABASE_URL automatically
    database_url: Optional[str] = None
    database_echo: bool = False  # Set True to log SQL queries
    
    # Fallback database config (for local dev)
    postgres_user: Optional[str] = "postgres"
    postgres_password: Optional[str] = "postgres"
    postgres_db: Optional[str] = "freelancer_shield"
    postgres_host: Optional[str] = "localhost"
    
    @property
    def db_url(self) -> str:
        """
        Get database URL.
        
        Priority:
        1. DATABASE_URL environment variable (Fly.io, Railway, Render)
        2. Constructed from POSTGRES_* parts (local dev, docker-compose)
        
        Handles postgres:// → postgresql+asyncpg:// conversion.
        """
        url = self.database_url
        
        if url:
            # Fly.io/Railway use postgres:// but asyncpg needs postgresql+asyncpg://
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://") and "+asyncpg" not in url:
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            # Remove sslmode parameter (asyncpg uses connect_args instead)
            url = url.replace("?sslmode=disable", "").replace("&sslmode=disable", "")
            url = url.replace("?sslmode=require", "").replace("&sslmode=require", "")
            return url
        
        # Construct from parts (local dev, docker-compose)
        user = self.postgres_user or "postgres"
        password = self.postgres_password or "postgres"
        db = self.postgres_db or "freelancer_shield"
        host = self.postgres_host or "localhost"
        
        return f"postgresql+asyncpg://{user}:{password}@{host}:5432/{db}"
    
    # Authentication
    secret_key: str = "CHANGE-THIS-IN-PRODUCTION-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_days: int = 7
    bcrypt_rounds: int = 12
    
    # AI / Scope Analyzer
    openai_api_key: str = ""
    use_ai_analyzer: bool = False  # Set True when OpenAI key is configured
    openai_model: str = "gpt-4"
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    

@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
