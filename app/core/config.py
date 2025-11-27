"""
Application configuration using Pydantic Settings.
All settings are loaded from environment variables with sensible defaults.
"""

from functools import lru_cache
from typing import Literal

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
    
    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/freelancer_shield"
    database_echo: bool = False  # Set True to log SQL queries
    
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
