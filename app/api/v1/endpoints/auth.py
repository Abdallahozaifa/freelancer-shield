"""
Authentication endpoints: register, login, get current user.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.auth import (
    Token, 
    UserLogin, 
    UserRegister, 
    UserResponse,
    GoogleAuthRequest,
    GoogleAuthResponse,
)
from app.services.google_auth import google_auth_service

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Register a new user."""
    
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        business_name=user_data.business_name,
    )
    
    db.add(user)
    await db.flush()
    await db.refresh(user)
    
    return user


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Login and get an access token."""
    
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    # Check if user exists
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user has password (not Google-only user)
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses Google sign-in. Please sign in with Google.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=GoogleAuthResponse)
async def google_auth(
    request: GoogleAuthRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Authenticate user with Google OAuth.
    
    - If user exists with this Google ID, log them in
    - If user exists with this email (but no Google ID), link accounts and log in
    - If user doesn't exist, create new account and log in
    """
    # Verify Google token and get user info
    google_user = await google_auth_service.verify_google_token(request.credential)
    
    is_new_user = False
    
    # Check if user exists with this Google ID
    result = await db.execute(
        select(User).where(User.google_id == google_user.google_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        # Check if user exists with this email
        result = await db.execute(
            select(User).where(User.email == google_user.email)
        )
        user = result.scalar_one_or_none()
        
        if user:
            # Link Google account to existing user (keep existing auth_provider if they have password)
            user.google_id = google_user.google_id
            if google_user.picture:
                user.picture = google_user.picture
            # Only set auth_provider to "google" if user doesn't have a password
            if not user.hashed_password:
                user.auth_provider = "google"
            await db.commit()
            await db.refresh(user)
        else:
            # Create new user
            user = User(
                email=google_user.email,
                full_name=google_user.full_name,
                google_id=google_user.google_id,
                picture=google_user.picture,
                auth_provider="google",
                hashed_password=None,  # No password for Google users
                is_active=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            is_new_user = True
    else:
        # Update picture if available and different
        if google_user.picture and user.picture != google_user.picture:
            user.picture = google_user.picture
            await db.commit()
            await db.refresh(user)
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Convert user to UserResponse
    user_response = UserResponse.model_validate(user)
    
    return GoogleAuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
        is_new_user=is_new_user,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: CurrentUser) -> User:
    """Get the current authenticated user's info."""
    return current_user
