"""
Pydantic schemas for authentication.
"""

from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


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
    
    class Config:
        from_attributes = True
