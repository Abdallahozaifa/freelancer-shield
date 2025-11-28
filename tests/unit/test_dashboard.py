"""Unit tests for Dashboard endpoints."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client_request import ClientRequest
from app.models.enums import (
    ProjectStatus,
    ProposalStatus,
    RequestStatus,
    ScopeClassification,
)
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.scope_item import ScopeItem
from app.models.client import Client
from app.models.user import User


# ============================================================================
# Dashboard-specific Fixtures
# ============================================================================


@pytest_asyncio.fixture
async def active_project(db_session: AsyncSession, test_user: User, test_client: Client) -> Project:
    """Create an active project for dashboard tests."""
    project = Project(
        user_id=test_user.id,
        client_id=test_client.id,
        name="Active Dashboard Project",
        description="A project for dashboard testing",
        status=ProjectStatus.ACTIVE,
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def completed_project(db_session: AsyncSession, test_user: User, test_client: Client) -> Project:
    """Create a completed project for dashboard tests."""
    project = Project(
        user_id=test_user.id,
        client_id=test_client.id,
        name="Completed Dashboard Project",
        description="A completed project",
        status=ProjectStatus.COMPLETED,
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


@pytest_asyncio.fixture
async def second_client(db_session: AsyncSession, test_user: User) -> Client:
    """Create a second client for dashboard tests."""
    client_obj = Client(
        user_id=test_user.id,
        name="Second Test Client",
        email="second.client@example.com",
    )
    db_session.add(client_obj)
    await db_session.commit()
    await db_session.refresh(client_obj)
    return client_obj


async def create_client_request(
    db_session: AsyncSession,
    project: Project,
    *,
    status: RequestStatus = RequestStatus.NEW,
    classification: ScopeClassification = ScopeClassification.PENDING,
    created_at: datetime | None = None,
) -> ClientRequest:
    """Helper to create a client request with specific attributes."""
    request = ClientRequest(
        project_id=project.id,
        title=f"Test Request {uuid4().hex[:8]}",
        content="Test request content",
        classification=classification,
        status=status,
    )
    db_session.add(request)
    await db_session.commit()
    await db_session.refresh(request)
    
    # Update created_at if specified (after commit to override default)
    if created_at:
        request.created_at = created_at
        await db_session.commit()
        await db_session.refresh(request)
    
    return request


async def create_proposal(
    db_session: AsyncSession,
    project: Project,
    source_request: ClientRequest | None = None,
    *,
    status: ProposalStatus = ProposalStatus.DRAFT,
    amount: Decimal = Decimal("500.00"),
    created_at: datetime | None = None,
) -> Proposal:
    """Helper to create a proposal with specific attributes."""
    proposal = Proposal(
        project_id=project.id,
        source_request_id=source_request.id if source_request else None,
        title=f"Test Proposal {uuid4().hex[:8]}",
        description="Test proposal description",
        amount=amount,
        status=status,
    )
    db_session.add(proposal)
    await db_session.commit()
    await db_session.refresh(proposal)
    
    # Update created_at if specified
    if created_at:
        proposal.created_at = created_at
        await db_session.commit()
        await db_session.refresh(proposal)
    
    return proposal


# ============================================================================
# Test Classes
# ============================================================================


class TestDashboardSummaryEmpty:
    """Test dashboard summary with no data."""
    
    @pytest.mark.asyncio
    async def test_summary_empty(self, client: AsyncClient, auth_headers: dict[str, str]):
        """New user with no data should have all counts at 0."""
        response = await client.get("/api/v1/dashboard/summary", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_projects"] == 0
        assert data["active_projects"] == 0
        assert data["total_clients"] == 0
        assert data["total_requests"] == 0
        assert data["out_of_scope_requests"] == 0
        assert data["pending_requests"] == 0
        assert data["total_proposals"] == 0
        assert data["pending_proposals"] == 0
        assert data["accepted_proposals"] == 0
        assert Decimal(data["total_revenue_protected"]) == Decimal("0.00")


class TestDashboardSummaryWithData:
    """Test dashboard summary with existing data."""
    
    @pytest.mark.asyncio
    async def test_summary_with_data(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
        completed_project: Project,
        second_client: Client,
    ):
        """User with projects, requests, proposals should have accurate counts."""
        # Create requests
        await create_client_request(
            db_session, active_project,
            status=RequestStatus.NEW,
            classification=ScopeClassification.PENDING,
        )
        await create_client_request(
            db_session, active_project,
            status=RequestStatus.ANALYZED,
            classification=ScopeClassification.OUT_OF_SCOPE,
        )
        await create_client_request(
            db_session, completed_project,
            status=RequestStatus.ANALYZED,
            classification=ScopeClassification.IN_SCOPE,
        )
        
        # Create proposals
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.ACCEPTED,
            amount=Decimal("500.00"),
        )
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.SENT,
            amount=Decimal("300.00"),
        )
        await create_proposal(
            db_session, completed_project,
            status=ProposalStatus.ACCEPTED,
            amount=Decimal("750.00"),
        )
        
        response = await client.get("/api/v1/dashboard/summary", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["total_projects"] == 2
        assert data["active_projects"] == 1
        assert data["total_clients"] == 2  # test_client + second_client
        assert data["total_requests"] == 3
        assert data["out_of_scope_requests"] == 1
        assert data["pending_requests"] == 1
        assert data["total_proposals"] == 3
        assert data["pending_proposals"] == 1  # SENT only
        assert data["accepted_proposals"] == 2
        assert Decimal(data["total_revenue_protected"]) == Decimal("1250.00")


class TestAlertsGeneration:
    """Test alert generation logic."""
    
    @pytest.mark.asyncio
    async def test_alerts_scope_creep(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Project with 4 OUT_OF_SCOPE requests in last week should trigger alert."""
        # Create 4 out-of-scope requests in the last 7 days
        for _ in range(4):
            await create_client_request(
                db_session, active_project,
                status=RequestStatus.ANALYZED,
                classification=ScopeClassification.OUT_OF_SCOPE,
                created_at=datetime.now(timezone.utc) - timedelta(days=2),
            )
        
        response = await client.get("/api/v1/dashboard/alerts", headers=auth_headers)
        
        assert response.status_code == 200
        alerts = response.json()
        
        scope_creep_alerts = [a for a in alerts if a["type"] == "scope_creep"]
        assert len(scope_creep_alerts) >= 1
        assert scope_creep_alerts[0]["severity"] == "high"
        assert "out-of-scope" in scope_creep_alerts[0]["message"].lower()
    
    @pytest.mark.asyncio
    async def test_alerts_pending_request(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Request with status=NEW, created 3 days ago should trigger alert."""
        # Create a request that's 3 days old and still NEW
        await create_client_request(
            db_session, active_project,
            status=RequestStatus.NEW,
            classification=ScopeClassification.PENDING,
            created_at=datetime.now(timezone.utc) - timedelta(days=3),
        )
        
        response = await client.get("/api/v1/dashboard/alerts", headers=auth_headers)
        
        assert response.status_code == 200
        alerts = response.json()
        
        pending_alerts = [a for a in alerts if a["type"] == "pending_request"]
        assert len(pending_alerts) >= 1
        assert pending_alerts[0]["severity"] == "medium"
        assert "pending" in pending_alerts[0]["message"].lower()
    
    @pytest.mark.asyncio
    async def test_alerts_proposal_expiring(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """SENT proposal older than 14 days should trigger alert."""
        # Create a proposal that's 15 days old and still SENT
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.SENT,
            amount=Decimal("500.00"),
            created_at=datetime.now(timezone.utc) - timedelta(days=15),
        )
        
        response = await client.get("/api/v1/dashboard/alerts", headers=auth_headers)
        
        assert response.status_code == 200
        alerts = response.json()
        
        expiring_alerts = [a for a in alerts if a["type"] == "proposal_expiring"]
        assert len(expiring_alerts) >= 1
        assert expiring_alerts[0]["severity"] == "medium"
    
    @pytest.mark.asyncio
    async def test_no_alerts_clean_project(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Well-maintained project should have no alerts."""
        # Create recent, analyzed in-scope request
        await create_client_request(
            db_session, active_project,
            status=RequestStatus.ANALYZED,
            classification=ScopeClassification.IN_SCOPE,
            created_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )
        
        # Create recent accepted proposal
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.ACCEPTED,
            amount=Decimal("500.00"),
            created_at=datetime.now(timezone.utc) - timedelta(days=5),
        )
        
        response = await client.get("/api/v1/dashboard/alerts", headers=auth_headers)
        
        assert response.status_code == 200
        alerts = response.json()
        
        # Should have no alerts
        assert len(alerts) == 0


class TestRecentActivity:
    """Test recent activity retrieval."""
    
    @pytest.mark.asyncio
    async def test_recent_activity(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Activities should be returned in reverse chronological order."""
        # Create activities at different times
        await create_client_request(
            db_session, active_project,
            status=RequestStatus.NEW,
            created_at=datetime.now(timezone.utc) - timedelta(hours=3),
        )
        await create_client_request(
            db_session, active_project,
            status=RequestStatus.NEW,
            created_at=datetime.now(timezone.utc) - timedelta(hours=1),
        )
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.SENT,
            amount=Decimal("500.00"),
            created_at=datetime.now(timezone.utc) - timedelta(minutes=30),
        )
        
        response = await client.get("/api/v1/dashboard/activity", headers=auth_headers)
        
        assert response.status_code == 200
        activities = response.json()
        
        assert len(activities) > 0
        
        # Verify reverse chronological order
        timestamps = [
            datetime.fromisoformat(a["timestamp"].replace("Z", "+00:00"))
            for a in activities
        ]
        assert timestamps == sorted(timestamps, reverse=True)


class TestProjectHealth:
    """Test project health calculation."""
    
    @pytest.mark.asyncio
    async def test_project_health_score_perfect(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Project with all IN_SCOPE requests, accepted proposals should have high score."""
        # Create in-scope analyzed requests
        for _ in range(3):
            await create_client_request(
                db_session, active_project,
                status=RequestStatus.ADDRESSED,  # Addressed, not unaddressed
                classification=ScopeClassification.IN_SCOPE,
            )
        
        # Create accepted proposals (adds +5 each)
        for _ in range(2):
            await create_proposal(
                db_session, active_project,
                status=ProposalStatus.ACCEPTED,
                amount=Decimal("500.00"),
            )
        
        response = await client.get(
            f"/api/v1/dashboard/projects/{active_project.id}/health",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        health = response.json()
        
        # Score should be high (100 base + 10 from 2 accepted proposals = 100 clamped)
        assert health["health_score"] >= 90
        assert health["out_of_scope_requests"] == 0
        assert health["scope_creep_ratio"] == 0.0
    
    @pytest.mark.asyncio
    async def test_project_health_score_poor(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Project with many OUT_OF_SCOPE requests, no proposals should have low score."""
        # Create out-of-scope requests (unaddressed = -10 each)
        for _ in range(8):
            await create_client_request(
                db_session, active_project,
                status=RequestStatus.ANALYZED,
                classification=ScopeClassification.OUT_OF_SCOPE,
            )
        
        # Create old pending requests (-5 each)
        for _ in range(3):
            await create_client_request(
                db_session, active_project,
                status=RequestStatus.NEW,
                created_at=datetime.now(timezone.utc) - timedelta(days=2),
            )
        
        response = await client.get(
            f"/api/v1/dashboard/projects/{active_project.id}/health",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        health = response.json()
        
        # Score should be low: 100 - (8 * 10) - (3 * 5) = 100 - 80 - 15 = 5, clamped to 0
        assert health["health_score"] <= 20
        assert health["out_of_scope_requests"] == 8
    
    @pytest.mark.asyncio
    async def test_revenue_protected_calculation(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Multiple accepted proposals should sum correctly."""
        # Create multiple accepted proposals
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.ACCEPTED,
            amount=Decimal("500.00"),
        )
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.ACCEPTED,
            amount=Decimal("750.00"),
        )
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.ACCEPTED,
            amount=Decimal("1000.00"),
        )
        # This one shouldn't count (not accepted)
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.SENT,
            amount=Decimal("300.00"),
        )
        
        response = await client.get(
            f"/api/v1/dashboard/projects/{active_project.id}/health",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        health = response.json()
        
        assert Decimal(health["revenue_protected"]) == Decimal("2250.00")
        assert health["proposals_accepted"] == 3
        assert health["proposals_sent"] == 1
    
    @pytest.mark.asyncio
    async def test_scope_creep_ratio(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """10 requests, 3 out of scope should give ratio of 0.3."""
        # Create 7 in-scope requests
        for _ in range(7):
            await create_client_request(
                db_session, active_project,
                status=RequestStatus.ANALYZED,
                classification=ScopeClassification.IN_SCOPE,
            )
        
        # Create 3 out-of-scope requests
        for _ in range(3):
            await create_client_request(
                db_session, active_project,
                status=RequestStatus.ANALYZED,
                classification=ScopeClassification.OUT_OF_SCOPE,
            )
        
        response = await client.get(
            f"/api/v1/dashboard/projects/{active_project.id}/health",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        health = response.json()
        
        assert health["total_requests"] == 10
        assert health["in_scope_requests"] == 7
        assert health["out_of_scope_requests"] == 3
        assert health["scope_creep_ratio"] == 0.3


class TestProjectHealthNotFound:
    """Test project health for non-existent project."""
    
    @pytest.mark.asyncio
    async def test_project_not_found(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ):
        """Requesting health for non-existent project should return 404."""
        fake_id = str(uuid4())
        response = await client.get(
            f"/api/v1/dashboard/projects/{fake_id}/health",
            headers=auth_headers,
        )
        
        assert response.status_code == 404


class TestFullDashboard:
    """Test the full dashboard endpoint."""
    
    @pytest.mark.asyncio
    async def test_full_dashboard(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        db_session: AsyncSession,
        active_project: Project,
    ):
        """Full dashboard should return all components."""
        await create_client_request(
            db_session, active_project,
            status=RequestStatus.NEW,
        )
        await create_proposal(
            db_session, active_project,
            status=ProposalStatus.ACCEPTED,
            amount=Decimal("500.00"),
        )
        
        response = await client.get("/api/v1/dashboard", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert "summary" in data
        assert "alerts" in data
        assert "recent_activity" in data
        assert "project_health" in data
        
        # Verify summary has correct structure
        assert "total_projects" in data["summary"]
        assert "total_revenue_protected" in data["summary"]
        
        # Verify project_health is a list
        assert isinstance(data["project_health"], list)


class TestDashboardAuthorization:
    """Test dashboard authorization - users can only see their own data."""
    
    @pytest.mark.asyncio
    async def test_cannot_access_other_user_project_health(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        other_user_project: Project,
    ):
        """User cannot access health of another user's project."""
        response = await client.get(
            f"/api/v1/dashboard/projects/{other_user_project.id}/health",
            headers=auth_headers,
        )
        
        assert response.status_code == 404