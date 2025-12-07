"""
Pydantic schemas for authentication.
"""

from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional


class UserRegister(BaseModel):
    """Schema for user registration."""
    
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    full_name: str = Field(min_length=1, max_length=255)
    business_name: str | None = Field(default=None, max_length=255)


class UserLogin(BaseModel):
    """Schema for user login."""
    
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for access token response."""
    
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for user response (without password)."""
    
    id: UUID
    email: str
    full_name: str
    business_name: str | None
    is_active: bool
    picture: Optional[str] = None
    auth_provider: Optional[str] = None
    
    class Config:
        from_attributes = True


# Google OAuth schemas
class GoogleAuthRequest(BaseModel):
    """Request body for Google OAuth token verification."""
    
    credential: str  # The ID token from Google Sign-In


class GoogleUserInfo(BaseModel):
    """User info extracted from Google token."""
    
    google_id: str
    email: EmailStr
    full_name: str
    picture: Optional[str] = None
    email_verified: bool = False


class GoogleAuthResponse(BaseModel):
    """Response after successful Google authentication."""
    
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    is_new_user: bool
