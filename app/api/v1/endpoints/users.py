"""User profile management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.schemas.user import UserProfile, UserUpdate, OnboardingComplete

router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    current_user: CurrentUser,
) -> UserProfile:
    """
    Get the current user's full profile.

    Returns all profile fields including created_at timestamp.
    Requires authentication.
    """
    return UserProfile(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        business_name=current_user.business_name,
        is_active=current_user.is_active,
        has_completed_onboarding=current_user.has_completed_onboarding,
        created_at=current_user.created_at,
    )


@router.patch("/profile", response_model=UserProfile)
async def update_profile(
    user_update: UserUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    """
    Update the current user's profile.

    Only updates fields that are provided (not None).
    Requires authentication.
    """
    update_data = user_update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return UserProfile(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        business_name=current_user.business_name,
        is_active=current_user.is_active,
        has_completed_onboarding=current_user.has_completed_onboarding,
        created_at=current_user.created_at,
    )


@router.patch("/complete-onboarding", response_model=OnboardingComplete)
async def complete_onboarding(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_db),
) -> OnboardingComplete:
    """
    Mark the current user's onboarding as completed.

    This endpoint is called when the user finishes the onboarding wizard.
    Requires authentication.
    """
    current_user.has_completed_onboarding = True

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return OnboardingComplete(
        message="Onboarding completed successfully",
        has_completed_onboarding=True,
    )
