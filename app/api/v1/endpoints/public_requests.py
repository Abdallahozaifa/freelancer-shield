"""
Public Client Request API - No Authentication Required

Allows clients to submit requests via a public URL without logging in.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.api.deps import get_db
from app.models.client_request import ClientRequest
from app.models.enums import RequestSource, RequestStatus
from app.models.project import Project
from app.schemas.client_request import (
    PublicProjectInfo,
    PublicRequestCreate,
    PublicRequestResponse,
)

router = APIRouter()


@router.get(
    "/{token}",
    response_model=PublicProjectInfo,
    summary="Get project info for public request form",
    description="Get basic project info to display on the public request form",
)
async def get_public_project_info(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> PublicProjectInfo:
    """Get project info for display on public request form."""
    # Find project by public token
    result = await db.execute(
        select(Project)
        .options(joinedload(Project.client), joinedload(Project.user))
        .where(
            Project.public_request_token == token,
            Project.public_request_enabled == True,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or public requests are disabled",
        )

    return PublicProjectInfo(
        project_name=project.name,
        client_name=project.client.name if project.client else "Unknown",
        freelancer_name=project.user.full_name if project.user else "Unknown",
    )


@router.post(
    "/{token}",
    response_model=PublicRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a public client request",
    description="Submit a request without authentication via public URL",
)
async def submit_public_request(
    token: str,
    request_data: PublicRequestCreate,
    db: AsyncSession = Depends(get_db),
) -> PublicRequestResponse:
    """
    Submit a client request via public URL.

    This allows clients to submit requests without logging in.
    The request is added to the project with source=CLIENT_PORTAL.
    """
    # Find project by public token
    result = await db.execute(
        select(Project).where(
            Project.public_request_token == token,
            Project.public_request_enabled == True,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or public requests are disabled",
        )

    # Build content with optional client info
    content_parts = [request_data.description]
    if request_data.client_name:
        content_parts.append(f"\n\n---\nSubmitted by: {request_data.client_name}")
    if request_data.client_email:
        content_parts.append(f"Email: {request_data.client_email}")

    content = "\n".join(content_parts)

    # Create the client request
    client_request = ClientRequest(
        project_id=project.id,
        title=request_data.title,
        content=content,
        source=RequestSource.CLIENT_PORTAL,
        status=RequestStatus.NEW,
        classification=None,  # Unclassified - freelancer will review
    )

    db.add(client_request)
    await db.commit()
    await db.refresh(client_request)

    return PublicRequestResponse(
        success=True,
        message="Your request has been submitted successfully. The freelancer will review it shortly.",
        request_id=client_request.id,
    )
