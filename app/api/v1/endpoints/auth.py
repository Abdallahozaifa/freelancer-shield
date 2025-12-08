"""
Authentication endpoints: register, login, get current user.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.core.config import settings
from app.db.session import get_db
from app.models import User
from app.schemas.auth import (
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
    GoogleAuthRequest,
    GoogleAccessTokenRequest,
    GoogleAuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerifyResetTokenRequest,
    VerifyResetTokenResponse,
)
from app.services.google_auth import google_auth_service
from app.services.email_service import email_service

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


@router.post("/google/token", response_model=GoogleAuthResponse)
async def google_auth_with_access_token(
    request: GoogleAccessTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Authenticate user with Google OAuth access token (implicit flow).
    This endpoint is used for mobile-friendly OAuth flow.

    - If user exists with this Google ID, log them in
    - If user exists with this email (but no Google ID), link accounts and log in
    - If user doesn't exist, create new account and log in
    """
    # Verify Google access token and get user info
    google_user = await google_auth_service.verify_access_token(request.access_token)

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
            # Link Google account to existing user
            user.google_id = google_user.google_id
            if google_user.picture:
                user.picture = google_user.picture
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
                hashed_password=None,
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


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ForgotPasswordResponse:
    """
    Request a password reset email.

    Always returns success to prevent email enumeration attacks.
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == request.email)
    )
    user = result.scalar_one_or_none()

    if user and user.hashed_password:
        # Only generate token for users with password auth (not Google-only)
        reset_token = create_password_reset_token(user.email)
        reset_link = f"{settings.frontend_url}/reset-password?token={reset_token}"

        # Send password reset email
        email_sent = await email_service.send_password_reset_email(
            to_email=user.email,
            reset_link=reset_link,
            expires_minutes=settings.password_reset_token_expire_minutes,
        )

        # Log for debugging (remove in production if not needed)
        if not email_sent:
            # If email is disabled or failed, log the link for development
            print(f"Password reset link for {user.email}: {reset_link}")

    # Always return success to prevent email enumeration
    return ForgotPasswordResponse()


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ResetPasswordResponse:
    """
    Reset password using a valid reset token.
    """
    # Verify token and get email
    email = verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Find user by email
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    # Update password
    user.hashed_password = hash_password(request.new_password)
    await db.commit()

    return ResetPasswordResponse()


@router.post("/verify-reset-token", response_model=VerifyResetTokenResponse)
async def verify_reset_token(
    request: VerifyResetTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VerifyResetTokenResponse:
    """
    Verify if a password reset token is valid.
    Used by frontend to check token before showing reset form.
    """
    email = verify_password_reset_token(request.token)
    if not email:
        return VerifyResetTokenResponse(valid=False)

    # Check if user exists
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        return VerifyResetTokenResponse(valid=False)

    # Mask email for privacy (show first 2 chars and domain)
    parts = email.split('@')
    masked_email = f"{parts[0][:2]}***@{parts[1]}" if len(parts) == 2 else email

    return VerifyResetTokenResponse(valid=True, email=masked_email)
