"""Dashboard endpoints for aggregated stats and alerts."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.client import Client
from app.models.client_request import ClientRequest
from app.models.enums import (
    ProjectStatus,
    RequestStatus,
    ScopeClassification,
    ProposalStatus,
)
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.scope_item import ScopeItem
from app.models.user import User
from app.schemas.dashboard import (
    Alert,
    DashboardResponse,
    DashboardSummary,
    ProjectHealth,
    RecentActivity,
)

router = APIRouter()


async def get_dashboard_summary(
    db: AsyncSession,
    user_id: UUID,
) -> DashboardSummary:
    """Get aggregated summary stats for the user."""
    
    # Total and active projects
    projects_query = select(
        func.count(Project.id).label("total"),
        func.sum(
            case((Project.status == ProjectStatus.ACTIVE, 1), else_=0)
        ).label("active"),
    ).where(Project.user_id == user_id)
    
    projects_result = await db.execute(projects_query)
    projects_row = projects_result.one()
    
    # Total clients
    clients_query = select(func.count(Client.id)).where(Client.user_id == user_id)
    clients_result = await db.execute(clients_query)
    total_clients = clients_result.scalar() or 0
    
    # Get user's project IDs for request/proposal queries
    project_ids_query = select(Project.id).where(Project.user_id == user_id)
    project_ids_result = await db.execute(project_ids_query)
    project_ids = [row[0] for row in project_ids_result.fetchall()]
    
    # Request stats
    total_requests = 0
    out_of_scope_requests = 0
    pending_requests = 0
    
    if project_ids:
        requests_query = select(
            func.count(ClientRequest.id).label("total"),
            # FIX: Only count out_of_scope requests that are NOT resolved
            func.sum(
                case(
                    (
                        and_(
                            ClientRequest.classification == ScopeClassification.OUT_OF_SCOPE,
                            ClientRequest.status.not_in([
                                RequestStatus.ADDRESSED,
                                RequestStatus.DECLINED,
                                RequestStatus.PROPOSAL_SENT,
                            ]),
                        ),
                        1
                    ),
                    else_=0
                )
            ).label("out_of_scope"),
            func.sum(
                case((ClientRequest.status == RequestStatus.NEW, 1), else_=0)
            ).label("pending"),
        ).where(ClientRequest.project_id.in_(project_ids))
        
        requests_result = await db.execute(requests_query)
        requests_row = requests_result.one()
        total_requests = requests_row.total or 0
        out_of_scope_requests = int(requests_row.out_of_scope or 0)
        pending_requests = int(requests_row.pending or 0)
    
    # Proposal stats
    total_proposals = 0
    pending_proposals = 0
    accepted_proposals = 0
    total_revenue_protected = Decimal("0.00")
    
    if project_ids:
        proposals_query = select(
            func.count(Proposal.id).label("total"),
            func.sum(
                case(
                    (Proposal.status.in_([ProposalStatus.DRAFT, ProposalStatus.SENT]), 1),
                    else_=0
                )
            ).label("pending"),
            func.sum(
                case((Proposal.status == ProposalStatus.ACCEPTED, 1), else_=0)
            ).label("accepted"),
            func.coalesce(
                func.sum(
                    case(
                        (Proposal.status == ProposalStatus.ACCEPTED, Proposal.amount),
                        else_=Decimal("0.00")
                    )
                ),
                Decimal("0.00")
            ).label("revenue"),
        ).where(Proposal.project_id.in_(project_ids))
        
        proposals_result = await db.execute(proposals_query)
        proposals_row = proposals_result.one()
        total_proposals = proposals_row.total or 0
        pending_proposals = int(proposals_row.pending or 0)
        accepted_proposals = int(proposals_row.accepted or 0)
        total_revenue_protected = proposals_row.revenue or Decimal("0.00")
    
    return DashboardSummary(
        total_projects=projects_row.total or 0,
        active_projects=int(projects_row.active or 0),
        total_clients=total_clients,
        total_requests=total_requests,
        out_of_scope_requests=out_of_scope_requests,
        pending_requests=pending_requests,
        total_proposals=total_proposals,
        pending_proposals=pending_proposals,
        accepted_proposals=accepted_proposals,
        total_revenue_protected=total_revenue_protected,
    )


async def get_alerts(
    db: AsyncSession,
    user_id: UUID,
) -> list[Alert]:
    """Generate alerts for the user based on project data."""
    alerts: list[Alert] = []
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    forty_eight_hours_ago = now - timedelta(hours=48)
    fourteen_days_ago = now - timedelta(days=14)
    
    # Get user's projects with names
    projects_query = select(Project).where(Project.user_id == user_id)
    projects_result = await db.execute(projects_query)
    projects = {p.id: p for p in projects_result.scalars().all()}
    
    if not projects:
        return alerts
    
    project_ids = list(projects.keys())
    
    # Alert 1: Scope creep - Projects with >3 UNRESOLVED OUT_OF_SCOPE requests in last 7 days
    scope_creep_query = (
        select(
            ClientRequest.project_id,
            func.count(ClientRequest.id).label("count"),
        )
        .where(
            and_(
                ClientRequest.project_id.in_(project_ids),
                ClientRequest.classification == ScopeClassification.OUT_OF_SCOPE,
                # FIX: Only count unresolved requests
                ClientRequest.status.not_in([
                    RequestStatus.ADDRESSED,
                    RequestStatus.DECLINED,
                    RequestStatus.PROPOSAL_SENT,
                ]),
                ClientRequest.created_at >= seven_days_ago,
            )
        )
        .group_by(ClientRequest.project_id)
        .having(func.count(ClientRequest.id) > 3)
    )
    
    scope_creep_result = await db.execute(scope_creep_query)
    for row in scope_creep_result.fetchall():
        project = projects.get(row.project_id)
        if project:
            alerts.append(
                Alert(
                    type="scope_creep",
                    severity="high",
                    message=f"Project has {row.count} out-of-scope requests in the last 7 days",
                    project_id=project.id,
                    project_name=project.name,
                    related_id=None,
                    created_at=now,
                )
            )
    
    # Alert 2: Pending requests - NEW status older than 48 hours
    pending_query = select(ClientRequest).where(
        and_(
            ClientRequest.project_id.in_(project_ids),
            ClientRequest.status == RequestStatus.NEW,
            ClientRequest.created_at < forty_eight_hours_ago,
        )
    )
    
    pending_result = await db.execute(pending_query)
    for request in pending_result.scalars().all():
        project = projects.get(request.project_id)
        if project:
            # Handle timezone-aware comparison
            request_created = request.created_at
            if request_created.tzinfo is None:
                request_created = request_created.replace(tzinfo=timezone.utc)
            age_hours = int((now - request_created).total_seconds() / 3600)
            alerts.append(
                Alert(
                    type="pending_request",
                    severity="medium",
                    message=f"Request pending analysis for {age_hours} hours",
                    project_id=project.id,
                    project_name=project.name,
                    related_id=request.id,
                    created_at=request.created_at,
                )
            )
    
    # Alert 3: Proposal expiring - SENT proposals older than 14 days
    expiring_query = select(Proposal).where(
        and_(
            Proposal.project_id.in_(project_ids),
            Proposal.status == ProposalStatus.SENT,
            Proposal.created_at < fourteen_days_ago,
        )
    )
    
    expiring_result = await db.execute(expiring_query)
    for proposal in expiring_result.scalars().all():
        project = projects.get(proposal.project_id)
        if project:
            # Handle timezone-aware comparison
            proposal_created = proposal.created_at
            if proposal_created.tzinfo is None:
                proposal_created = proposal_created.replace(tzinfo=timezone.utc)
            age_days = (now - proposal_created).days
            alerts.append(
                Alert(
                    type="proposal_expiring",
                    severity="medium",
                    message=f"Proposal sent {age_days} days ago with no response",
                    project_id=project.id,
                    project_name=project.name,
                    related_id=proposal.id,
                    created_at=proposal.created_at,
                )
            )
    
    # Sort alerts by severity (high first) then by created_at (newest first)
    severity_order = {"high": 0, "medium": 1, "low": 2}
    alerts.sort(key=lambda a: (severity_order[a.severity], -a.created_at.timestamp()))
    
    return alerts


async def get_recent_activity(
    db: AsyncSession,
    user_id: UUID,
    limit: int = 20,
) -> list[RecentActivity]:
    """Get recent activity across all projects."""
    activities: list[RecentActivity] = []
    
    # Get user's projects
    projects_query = select(Project).where(Project.user_id == user_id)
    projects_result = await db.execute(projects_query)
    projects = {p.id: p for p in projects_result.scalars().all()}
    
    if not projects:
        return activities
    
    project_ids = list(projects.keys())
    
    # Get recent requests (both created and analyzed)
    requests_query = (
        select(ClientRequest)
        .where(ClientRequest.project_id.in_(project_ids))
        .order_by(ClientRequest.updated_at.desc())
        .limit(limit)
    )
    
    requests_result = await db.execute(requests_query)
    for request in requests_result.scalars().all():
        project = projects.get(request.project_id)
        if project:
            # Request created activity
            title_display = f"{request.title[:50]}..." if len(request.title) > 50 else request.title
            activities.append(
                RecentActivity(
                    type="request_created",
                    message=f"New request: {title_display}",
                    project_id=project.id,
                    project_name=project.name,
                    timestamp=request.created_at,
                )
            )
            
            # If analyzed, add that activity too
            if request.status == RequestStatus.ANALYZED and request.updated_at != request.created_at:
                classification = request.classification.value if request.classification else "unknown"
                activities.append(
                    RecentActivity(
                        type="request_analyzed",
                        message=f"Request analyzed as {classification}",
                        project_id=project.id,
                        project_name=project.name,
                        timestamp=request.updated_at,
                    )
                )
    
    # Get recent proposals
    proposals_query = (
        select(Proposal)
        .where(Proposal.project_id.in_(project_ids))
        .order_by(Proposal.updated_at.desc())
        .limit(limit)
    )
    
    proposals_result = await db.execute(proposals_query)
    for proposal in proposals_result.scalars().all():
        project = projects.get(proposal.project_id)
        if project:
            if proposal.status == ProposalStatus.SENT:
                activities.append(
                    RecentActivity(
                        type="proposal_sent",
                        message=f"Proposal sent: ${proposal.amount}",
                        project_id=project.id,
                        project_name=project.name,
                        timestamp=proposal.updated_at,
                    )
                )
            elif proposal.status == ProposalStatus.ACCEPTED:
                activities.append(
                    RecentActivity(
                        type="proposal_accepted",
                        message=f"Proposal accepted: ${proposal.amount}",
                        project_id=project.id,
                        project_name=project.name,
                        timestamp=proposal.updated_at,
                    )
                )
    
    # Get completed scope items
    scope_items_query = (
        select(ScopeItem)
        .where(
            and_(
                ScopeItem.project_id.in_(project_ids),
                ScopeItem.is_completed == True,  # noqa: E712
            )
        )
        .order_by(ScopeItem.updated_at.desc())
        .limit(limit)
    )
    
    scope_items_result = await db.execute(scope_items_query)
    for item in scope_items_result.scalars().all():
        project = projects.get(item.project_id)
        if project:
            title_display = f"{item.title[:40]}..." if len(item.title) > 40 else item.title
            activities.append(
                RecentActivity(
                    type="scope_completed",
                    message=f"Scope item completed: {title_display}",
                    project_id=project.id,
                    project_name=project.name,
                    timestamp=item.updated_at,
                )
            )
    
    # Sort by timestamp descending and limit
    activities.sort(key=lambda a: a.timestamp, reverse=True)
    return activities[:limit]


async def calculate_project_health(
    db: AsyncSession,
    project: Project,
) -> ProjectHealth:
    """Calculate health metrics for a single project."""
    now = datetime.now(timezone.utc)
    twenty_four_hours_ago = now - timedelta(hours=24)
    
    # Scope item stats - using is_completed boolean
    scope_query = select(
        func.count(ScopeItem.id).label("total"),
        func.sum(
            case((ScopeItem.is_completed == True, 1), else_=0)  # noqa: E712
        ).label("completed"),
    ).where(ScopeItem.project_id == project.id)
    
    scope_result = await db.execute(scope_query)
    scope_row = scope_result.one()
    scope_total = scope_row.total or 0
    scope_completed = int(scope_row.completed or 0)
    scope_completion_pct = (scope_completed / scope_total * 100) if scope_total > 0 else 0.0
    
    # Request stats - using 'classification' field (not scope_classification)
    requests_query = select(
        func.count(ClientRequest.id).label("total"),
        func.sum(
            case(
                (ClientRequest.classification == ScopeClassification.IN_SCOPE, 1),
                else_=0
            )
        ).label("in_scope"),
        # FIX: Only count unresolved out_of_scope requests
        func.sum(
            case(
                (
                    and_(
                        ClientRequest.classification == ScopeClassification.OUT_OF_SCOPE,
                        ClientRequest.status.not_in([
                            RequestStatus.ADDRESSED,
                            RequestStatus.DECLINED,
                            RequestStatus.PROPOSAL_SENT,
                        ]),
                    ),
                    1
                ),
                else_=0
            )
        ).label("out_of_scope"),
        func.sum(
            case((ClientRequest.status == RequestStatus.NEW, 1), else_=0)
        ).label("pending"),
        func.sum(
            case(
                (
                    and_(
                        ClientRequest.status == RequestStatus.NEW,
                        ClientRequest.created_at < twenty_four_hours_ago,
                    ),
                    1
                ),
                else_=0
            )
        ).label("pending_old"),
    ).where(ClientRequest.project_id == project.id)
    
    requests_result = await db.execute(requests_query)
    requests_row = requests_result.one()
    total_requests = requests_row.total or 0
    in_scope = int(requests_row.in_scope or 0)
    out_of_scope = int(requests_row.out_of_scope or 0)
    pending = int(requests_row.pending or 0)
    pending_old = int(requests_row.pending_old or 0)
    scope_creep_ratio = (out_of_scope / total_requests) if total_requests > 0 else 0.0
    
    # Proposal stats
    proposals_query = select(
        func.sum(
            case((Proposal.status == ProposalStatus.SENT, 1), else_=0)
        ).label("sent"),
        func.sum(
            case((Proposal.status == ProposalStatus.ACCEPTED, 1), else_=0)
        ).label("accepted"),
        func.coalesce(
            func.sum(
                case(
                    (Proposal.status == ProposalStatus.ACCEPTED, Proposal.amount),
                    else_=Decimal("0.00")
                )
            ),
            Decimal("0.00")
        ).label("revenue"),
    ).where(Proposal.project_id == project.id)
    
    proposals_result = await db.execute(proposals_query)
    proposals_row = proposals_result.one()
    proposals_sent = int(proposals_row.sent or 0)
    proposals_accepted = int(proposals_row.accepted or 0)
    revenue_protected = proposals_row.revenue or Decimal("0.00")
    
    # Calculate health score
    health_score = 100
    
    # Subtract 10 for each unaddressed OUT_OF_SCOPE request
    unaddressed_out_of_scope_query = select(func.count(ClientRequest.id)).where(
        and_(
            ClientRequest.project_id == project.id,
            ClientRequest.classification == ScopeClassification.OUT_OF_SCOPE,
            ClientRequest.status.in_([RequestStatus.NEW, RequestStatus.ANALYZED]),
        )
    )
    unaddressed_result = await db.execute(unaddressed_out_of_scope_query)
    unaddressed_count = unaddressed_result.scalar() or 0
    health_score -= unaddressed_count * 10
    
    # Subtract 5 for each pending request >24h old
    health_score -= pending_old * 5
    
    # Add 5 for each accepted proposal
    health_score += proposals_accepted * 5
    
    # Clamp to 0-100
    health_score = max(0, min(100, health_score))
    
    # Get budget from project if it exists
    budget = getattr(project, 'budget', None)
    
    return ProjectHealth(
        project_id=project.id,
        project_name=project.name,
        status=project.status.value,
        scope_completion_percentage=round(scope_completion_pct, 1),
        scope_items_total=scope_total,
        scope_items_completed=scope_completed,
        total_requests=total_requests,
        in_scope_requests=in_scope,
        out_of_scope_requests=out_of_scope,
        pending_analysis=pending,
        scope_creep_ratio=round(scope_creep_ratio, 2),
        budget=budget,
        proposals_sent=proposals_sent,
        proposals_accepted=proposals_accepted,
        revenue_protected=revenue_protected,
        health_score=health_score,
    )


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> DashboardResponse:
    """Get full dashboard data including summary, alerts, activity, and project health."""
    
    # Get summary stats
    summary = await get_dashboard_summary(db, current_user.id)
    
    # Get alerts
    alerts = await get_alerts(db, current_user.id)
    
    # Get recent activity
    recent_activity = await get_recent_activity(db, current_user.id, limit=20)
    
    # Get health for top 5 active projects
    projects_query = (
        select(Project)
        .where(
            and_(
                Project.user_id == current_user.id,
                Project.status == ProjectStatus.ACTIVE,
            )
        )
        .order_by(Project.updated_at.desc())
    )
    
    projects_result = await db.execute(projects_query)
    projects = projects_result.scalars().all()
    
    project_health = []
    for project in projects:
        health = await calculate_project_health(db, project)
        project_health.append(health)
    
    return DashboardResponse(
        summary=summary,
        alerts=alerts,
        recent_activity=recent_activity,
        project_health=project_health,
    )


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> DashboardSummary:
    """Get just the summary stats."""
    return await get_dashboard_summary(db, current_user.id)


@router.get("/alerts", response_model=list[Alert])
async def get_alerts_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[Alert]:
    """Get alerts only."""
    return await get_alerts(db, current_user.id)


@router.get("/activity", response_model=list[RecentActivity])
async def get_activity(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(default=20, le=50, ge=1),
) -> list[RecentActivity]:
    """Get recent activity (last 20 items by default)."""
    return await get_recent_activity(db, current_user.id, limit=limit)


@router.get("/projects/{project_id}/health", response_model=ProjectHealth)
async def get_project_health(
    project_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ProjectHealth:
    """Get health metrics for a specific project."""
    
    # Verify project exists and belongs to user
    project_query = select(Project).where(
        and_(
            Project.id == project_id,
            Project.user_id == current_user.id,
        )
    )
    
    result = await db.execute(project_query)
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    return await calculate_project_health(db, project)
