"""
Pydantic schemas for authentication.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from uuid import UUID
from typing import Optional
import re


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


# Password Reset schemas
class ForgotPasswordRequest(BaseModel):
    """Request body for forgot password."""

    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Response for forgot password request."""

    message: str = "If an account with this email exists, a password reset link has been sent."


class ResetPasswordRequest(BaseModel):
    """Request body for password reset."""

    token: str
    new_password: str = Field(min_length=8, max_length=100)

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password has uppercase, lowercase, and number."""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v


class ResetPasswordResponse(BaseModel):
    """Response for password reset."""

    message: str = "Password has been reset successfully."


class VerifyResetTokenRequest(BaseModel):
    """Request to verify reset token validity."""

    token: str


class VerifyResetTokenResponse(BaseModel):
    """Response for token verification."""

    valid: bool
    email: Optional[str] = None
