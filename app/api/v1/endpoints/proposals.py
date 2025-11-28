"""API endpoints for Proposals."""
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.client_request import ClientRequest
from app.models.enums import RequestStatus, ProposalStatus
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.proposal import (
    ProposalCreate,
    ProposalFromRequest,
    ProposalResponse,
    ProposalStats,
    ProposalUpdate,
)

router = APIRouter()


async def get_project_or_404(
    project_id: uuid.UUID,
    db: AsyncSession,
    current_user: User,
) -> Project:
    """Get project by ID or raise 404."""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


async def get_proposal_or_404(
    proposal_id: uuid.UUID,
    project_id: uuid.UUID,
    db: AsyncSession,
) -> Proposal:
    """Get proposal by ID or raise 404."""
    result = await db.execute(
        select(Proposal).where(
            Proposal.id == proposal_id,
            Proposal.project_id == project_id,
        )
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proposal not found",
        )
    return proposal


def proposal_to_response(proposal: Proposal, source_request_title: Optional[str] = None) -> ProposalResponse:
    """Convert Proposal model to ProposalResponse schema."""
    return ProposalResponse(
        id=proposal.id,
        project_id=proposal.project_id,
        source_request_id=proposal.source_request_id,
        title=proposal.title,
        description=proposal.description,
        status=proposal.status,
        amount=proposal.amount,
        estimated_hours=proposal.estimated_hours,
        sent_at=proposal.sent_at,
        responded_at=proposal.responded_at,
        created_at=proposal.created_at,
        updated_at=proposal.updated_at,
        source_request_title=source_request_title,
    )


@router.get("/{project_id}/proposals", response_model=List[ProposalResponse])
async def list_proposals(
    project_id: uuid.UUID,
    status_filter: Optional[ProposalStatus] = Query(default=None, alias="status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ProposalResponse]:
    """List all proposals for a project."""
    await get_project_or_404(project_id, db, current_user)
    
    query = select(Proposal).where(Proposal.project_id == project_id)
    
    if status_filter:
        query = query.where(Proposal.status == status_filter)
    
    query = query.order_by(Proposal.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    proposals = result.scalars().all()
    
    # Fetch source request titles for linked proposals
    responses = []
    for proposal in proposals:
        source_title = None
        if proposal.source_request_id:
            req_result = await db.execute(
                select(ClientRequest.title).where(ClientRequest.id == proposal.source_request_id)
            )
            source_title = req_result.scalar_one_or_none()
        responses.append(proposal_to_response(proposal, source_title))
    
    return responses


@router.post("/{project_id}/proposals", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
async def create_proposal(
    project_id: uuid.UUID,
    proposal_in: ProposalCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProposalResponse:
    """Create a new proposal manually."""
    await get_project_or_404(project_id, db, current_user)
    
    proposal = Proposal(
        project_id=project_id,
        source_request_id=None,
        title=proposal_in.title,
        description=proposal_in.description,
        status=ProposalStatus.DRAFT,
        amount=proposal_in.amount,
        estimated_hours=proposal_in.estimated_hours,
    )
    
    db.add(proposal)
    await db.commit()
    await db.refresh(proposal)
    
    return proposal_to_response(proposal)


@router.post(
    "/{project_id}/requests/{request_id}/create-proposal",
    response_model=ProposalResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_proposal_from_request(
    project_id: uuid.UUID,
    request_id: uuid.UUID,
    proposal_in: ProposalFromRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProposalResponse:
    """Create a proposal from an existing client request."""
    await get_project_or_404(project_id, db, current_user)
    
    # Verify request_id matches the one in body
    if proposal_in.source_request_id != request_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request ID in URL does not match source_request_id in body",
        )
    
    # Fetch the source request
    result = await db.execute(
        select(ClientRequest).where(
            ClientRequest.id == request_id,
            ClientRequest.project_id == project_id,
        )
    )
    source_request = result.scalar_one_or_none()
    if not source_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client request not found",
        )
    
    # Auto-generate title and description
    title = f"Proposal: {source_request.title}"
    description = f"This proposal addresses the following request:\n\n{source_request.content}"
    
    # Add analysis info if available
    if source_request.analysis_reasoning:
        description += f"\n\nAnalysis:\n{source_request.analysis_reasoning}"
    
    proposal = Proposal(
        project_id=project_id,
        source_request_id=request_id,
        title=title,
        description=description,
        status=ProposalStatus.DRAFT,
        amount=proposal_in.amount,
        estimated_hours=proposal_in.estimated_hours,
    )
    
    db.add(proposal)
    
    # Update the client request status to PROPOSAL_SENT
    source_request.status = RequestStatus.PROPOSAL_SENT
    
    await db.commit()
    await db.refresh(proposal)
    
    return proposal_to_response(proposal, source_request.title)


@router.get("/{project_id}/proposals/stats", response_model=ProposalStats)
async def get_proposal_stats(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProposalStats:
    """Get proposal statistics for a project."""
    await get_project_or_404(project_id, db, current_user)
    
    # Get counts by status
    result = await db.execute(
        select(
            Proposal.status,
            func.count(Proposal.id).label("count"),
        )
        .where(Proposal.project_id == project_id)
        .group_by(Proposal.status)
    )
    status_counts = {row.status: row.count for row in result}
    
    # Get total accepted amount
    result = await db.execute(
        select(func.coalesce(func.sum(Proposal.amount), Decimal("0")))
        .where(
            Proposal.project_id == project_id,
            Proposal.status == ProposalStatus.ACCEPTED,
        )
    )
    total_accepted = result.scalar_one()
    
    return ProposalStats(
        total_proposals=sum(status_counts.values()),
        draft_count=status_counts.get(ProposalStatus.DRAFT, 0),
        sent_count=status_counts.get(ProposalStatus.SENT, 0),
        accepted_count=status_counts.get(ProposalStatus.ACCEPTED, 0),
        declined_count=status_counts.get(ProposalStatus.DECLINED, 0),
        expired_count=status_counts.get(ProposalStatus.EXPIRED, 0),
        total_amount_accepted=total_accepted,
    )


@router.get("/{project_id}/proposals/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    project_id: uuid.UUID,
    proposal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProposalResponse:
    """Get a specific proposal."""
    await get_project_or_404(project_id, db, current_user)
    proposal = await get_proposal_or_404(proposal_id, project_id, db)
    
    source_title = None
    if proposal.source_request_id:
        result = await db.execute(
            select(ClientRequest.title).where(ClientRequest.id == proposal.source_request_id)
        )
        source_title = result.scalar_one_or_none()
    
    return proposal_to_response(proposal, source_title)


@router.patch("/{project_id}/proposals/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(
    project_id: uuid.UUID,
    proposal_id: uuid.UUID,
    proposal_in: ProposalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProposalResponse:
    """Update a proposal."""
    await get_project_or_404(project_id, db, current_user)
    proposal = await get_proposal_or_404(proposal_id, project_id, db)
    
    update_data = proposal_in.model_dump(exclude_unset=True)
    
    # Track if status is being changed to ACCEPTED or DECLINED
    new_status = update_data.get("status")
    if new_status in (ProposalStatus.ACCEPTED, ProposalStatus.DECLINED):
        if proposal.responded_at is None:
            proposal.responded_at = datetime.now(timezone.utc)
    
    for field, value in update_data.items():
        setattr(proposal, field, value)
    
    await db.commit()
    await db.refresh(proposal)
    
    source_title = None
    if proposal.source_request_id:
        result = await db.execute(
            select(ClientRequest.title).where(ClientRequest.id == proposal.source_request_id)
        )
        source_title = result.scalar_one_or_none()
    
    return proposal_to_response(proposal, source_title)


@router.post("/{project_id}/proposals/{proposal_id}/send", response_model=ProposalResponse)
async def send_proposal(
    project_id: uuid.UUID,
    proposal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProposalResponse:
    """Mark a proposal as sent."""
    await get_project_or_404(project_id, db, current_user)
    proposal = await get_proposal_or_404(proposal_id, project_id, db)
    
    # Check if already sent
    if proposal.status != ProposalStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Proposal is already {proposal.status.value}, cannot send",
        )
    
    proposal.status = ProposalStatus.SENT
    proposal.sent_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(proposal)
    
    source_title = None
    if proposal.source_request_id:
        result = await db.execute(
            select(ClientRequest.title).where(ClientRequest.id == proposal.source_request_id)
        )
        source_title = result.scalar_one_or_none()
    
    return proposal_to_response(proposal, source_title)


@router.delete("/{project_id}/proposals/{proposal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_proposal(
    project_id: uuid.UUID,
    proposal_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a proposal. Only draft proposals can be deleted."""
    await get_project_or_404(project_id, db, current_user)
    proposal = await get_proposal_or_404(proposal_id, project_id, db)
    
    # Only allow deletion of draft proposals
    if proposal.status != ProposalStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete a proposal that has been sent",
        )
    
    await db.delete(proposal)
    await db.commit()
