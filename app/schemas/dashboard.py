"""Dashboard schemas for aggregated stats and alerts."""

from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class DashboardSummary(BaseModel):
    """High-level stats for the user."""
    
    total_projects: int = Field(default=0, description="Total number of projects")
    active_projects: int = Field(default=0, description="Number of active projects")
    total_clients: int = Field(default=0, description="Total number of clients")
    
    # Request stats
    total_requests: int = Field(default=0, description="Total client requests")
    out_of_scope_requests: int = Field(default=0, description="Requests flagged as out of scope")
    pending_requests: int = Field(default=0, description="Requests awaiting analysis")
    
    # Proposal stats
    total_proposals: int = Field(default=0, description="Total proposals created")
    pending_proposals: int = Field(default=0, description="Proposals in DRAFT or SENT status")
    accepted_proposals: int = Field(default=0, description="Proposals accepted by clients")
    total_revenue_protected: Decimal = Field(
        default=Decimal("0.00"),
        description="Sum of accepted proposal amounts"
    )

    model_config = {"from_attributes": True}


class Alert(BaseModel):
    """An alert for the user's attention."""
    
    type: Literal["scope_creep", "pending_request", "proposal_expiring", "milestone_overdue"]
    severity: Literal["low", "medium", "high"]
    message: str
    project_id: UUID
    project_name: str
    related_id: UUID | None = Field(default=None, description="Related request_id or proposal_id")
    created_at: datetime

    model_config = {"from_attributes": True}


class RecentActivity(BaseModel):
    """Recent activity item."""
    
    type: Literal[
        "request_created",
        "request_analyzed",
        "proposal_sent",
        "proposal_accepted",
        "scope_completed"
    ]
    message: str
    project_id: UUID
    project_name: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class ProjectHealth(BaseModel):
    """Health metrics for a single project."""
    
    project_id: UUID
    project_name: str
    status: str
    
    # Scope health
    scope_completion_percentage: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Percentage of scope items completed"
    )
    scope_items_total: int = Field(default=0)
    scope_items_completed: int = Field(default=0)
    
    # Request health
    total_requests: int = Field(default=0)
    in_scope_requests: int = Field(default=0)
    out_of_scope_requests: int = Field(default=0)
    pending_analysis: int = Field(default=0)
    scope_creep_ratio: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Ratio of out_of_scope to total requests"
    )
    
    # Financial health
    budget: Decimal | None = Field(default=None)
    proposals_sent: int = Field(default=0)
    proposals_accepted: int = Field(default=0)
    revenue_protected: Decimal = Field(default=Decimal("0.00"))
    
    # Overall health score (0-100)
    health_score: int = Field(
        default=100,
        ge=0,
        le=100,
        description="Overall project health score"
    )

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    """Full dashboard data."""
    
    summary: DashboardSummary
    alerts: list[Alert]
    recent_activity: list[RecentActivity]
    project_health: list[ProjectHealth] = Field(
        default_factory=list,
        description="Health metrics for top 5 active projects"
    )

    model_config = {"from_attributes": True}
