"""
Unit tests for Client Requests endpoints.
"""
from decimal import Decimal
from unittest.mock import AsyncMock, patch
from uuid import UUID

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Project, ScopeItem
from app.models.client_request import ClientRequest
from app.models.enums import (
    RequestSource,
    RequestStatus,
    ScopeClassification,
)


# Mock analysis result class matching your scope analyzer output
class MockAnalysisResult:
    def __init__(
        self,
        classification: str = "in_scope",
        confidence: float = 0.85,
        reasoning: str = "Test reasoning",
        matched_scope_item_id: UUID | None = None,
        suggested_action: str = "Proceed with task",
        scope_creep_indicators: list[str] | None = None,
    ):
        self.classification = classification
        self.confidence = confidence
        self.reasoning = reasoning
        self.matched_scope_item_id = matched_scope_item_id
        self.suggested_action = suggested_action
        self.scope_creep_indicators = scope_creep_indicators or []


@pytest.fixture
def mock_analyze_client_request():
    """Mock the analyze_client_request function."""
    with patch(
        "app.api.v1.endpoints.client_requests.analyze_client_request"
    ) as mock_func:
        async def side_effect(client_request, session=None, commit=False):
            # Simulate what the real function does - updates the client_request
            client_request.classification = ScopeClassification.IN_SCOPE
            client_request.confidence = Decimal("0.85")
            client_request.analysis_reasoning = "Test reasoning"
            client_request.suggested_action = "Proceed with task"
            client_request.status = RequestStatus.ANALYZED
            return MockAnalysisResult()
        
        mock_func.side_effect = side_effect
        yield mock_func


@pytest.fixture
def mock_analyze_out_of_scope():
    """Mock analyzer that returns OUT_OF_SCOPE."""
    with patch(
        "app.api.v1.endpoints.client_requests.analyze_client_request"
    ) as mock_func:
        async def side_effect(client_request, session=None, commit=False):
            client_request.classification = ScopeClassification.OUT_OF_SCOPE
            client_request.confidence = Decimal("0.92")
            client_request.analysis_reasoning = "This request is outside the defined project scope"
            client_request.suggested_action = "Create a change request proposal"
            client_request.status = RequestStatus.ANALYZED
            return MockAnalysisResult(
                classification="out_of_scope",
                confidence=0.92,
                reasoning="This request is outside the defined project scope",
                matched_scope_item_id=None,
                suggested_action="Create a change request proposal",
                scope_creep_indicators=[
                    "Request introduces new deliverable",
                    "Not mentioned in original scope",
                ],
            )
        
        mock_func.side_effect = side_effect
        yield mock_func


@pytest.fixture
def mock_analyze_in_scope(test_scope_item: ScopeItem):
    """Mock analyzer that returns IN_SCOPE with matched item."""
    with patch(
        "app.api.v1.endpoints.client_requests.analyze_client_request"
    ) as mock_func:
        async def side_effect(client_request, session=None, commit=False):
            client_request.classification = ScopeClassification.IN_SCOPE
            client_request.confidence = Decimal("0.95")
            client_request.analysis_reasoning = "This request aligns with scope item: Build user authentication"
            client_request.suggested_action = "Proceed with implementation"
            client_request.linked_scope_item_id = test_scope_item.id
            client_request.status = RequestStatus.ANALYZED
            return MockAnalysisResult(
                classification="in_scope",
                confidence=0.95,
                reasoning="This request aligns with scope item: Build user authentication",
                matched_scope_item_id=test_scope_item.id,
                suggested_action="Proceed with implementation",
                scope_creep_indicators=[],
            )
        
        mock_func.side_effect = side_effect
        yield mock_func


# ============================================================================
# Test: Create Request Without Analysis
# ============================================================================


class TestCreateRequestNoAnalysis:
    """Test creating a request without auto-analysis."""

    @pytest.mark.asyncio
    async def test_create_request_no_analysis(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Create request with auto_analyze=False, verify PENDING classification."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Test Request",
                "content": "This is a test client request",
                "source": "email",
                "auto_analyze": False,
            },
        )

        assert response.status_code == 201, f"Response: {response.json()}"
        data = response.json()

        assert data["title"] == "Test Request"
        assert data["content"] == "This is a test client request"
        assert data["source"] == "email"
        assert data["status"] == "new"
        assert data["classification"] == "pending"
        assert data["analysis_reasoning"] is None
        assert data["confidence"] is None
        assert data["linked_scope_item_id"] is None


# ============================================================================
# Test: Create Request With Analysis
# ============================================================================


class TestCreateRequestWithAnalysis:
    """Test creating a request with auto-analysis."""

    @pytest.mark.asyncio
    async def test_create_request_with_analysis(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_scope_item: ScopeItem,
        mock_analyze_client_request,
    ):
        """Create request with auto_analyze=True, verify analysis is performed."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Authentication Feature",
                "content": "Working on the login form",
                "source": "chat",
                "auto_analyze": True,
            },
        )

        assert response.status_code == 201, f"Response: {response.json()}"
        data = response.json()

        assert data["status"] == "analyzed"
        assert data["classification"] != "pending"
        assert data["analysis_reasoning"] is not None
        assert data["suggested_action"] is not None

        # Verify analyzer was called
        mock_analyze_client_request.assert_called_once()


# ============================================================================
# Test: Out of Scope Detection
# ============================================================================


class TestCreateRequestOutOfScope:
    """Test detection of out-of-scope requests."""

    @pytest.mark.asyncio
    async def test_create_request_out_of_scope_detected(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_scope_item: ScopeItem,
        mock_analyze_out_of_scope,
    ):
        """
        Scope: ["Build homepage"]
        Request: "Can you also build a mobile app?"
        Verify classification=out_of_scope, indicators detected.
        """
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Mobile App Request",
                "content": "Can you also build a mobile app?",
                "source": "email",
                "auto_analyze": True,
            },
        )

        assert response.status_code == 201, f"Response: {response.json()}"
        data = response.json()

        assert data["classification"] == "out_of_scope"
        assert data["status"] == "analyzed"
        assert data["analysis_reasoning"] is not None
        assert "scope" in data["analysis_reasoning"].lower()


# ============================================================================
# Test: In Scope Detection
# ============================================================================


class TestCreateRequestInScope:
    """Test detection of in-scope requests."""

    @pytest.mark.asyncio
    async def test_create_request_in_scope_detected(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_scope_item: ScopeItem,
        mock_analyze_in_scope,
    ):
        """
        Scope: ["Build user authentication"]
        Request: "Working on the login form"
        Verify classification=in_scope, linked_scope_item set.
        """
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Login Form Update",
                "content": "Working on the login form",
                "source": "meeting",
                "auto_analyze": True,
            },
        )

        assert response.status_code == 201, f"Response: {response.json()}"
        data = response.json()

        assert data["classification"] == "in_scope"
        assert data["status"] == "analyzed"
        assert data["linked_scope_item_id"] is not None


# ============================================================================
# Test: List Requests Filter by Classification
# ============================================================================


class TestListRequestsFilterClassification:
    """Test filtering requests by classification."""

    @pytest.mark.asyncio
    async def test_list_requests_filter_classification(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        db_session: AsyncSession,
    ):
        """
        Create IN_SCOPE and OUT_OF_SCOPE requests.
        Filter by classification=out_of_scope.
        Verify only out_of_scope returned.
        """
        # Create requests with different classifications directly in DB
        in_scope_request = ClientRequest(
            project_id=test_project.id,
            title="In Scope Request",
            content="This is in scope",
            source=RequestSource.EMAIL,
            status=RequestStatus.ANALYZED,
            classification=ScopeClassification.IN_SCOPE,
        )
        out_scope_request = ClientRequest(
            project_id=test_project.id,
            title="Out of Scope Request",
            content="This is out of scope",
            source=RequestSource.EMAIL,
            status=RequestStatus.ANALYZED,
            classification=ScopeClassification.OUT_OF_SCOPE,
        )
        db_session.add_all([in_scope_request, out_scope_request])
        await db_session.commit()

        # Filter by out_of_scope (lowercase)
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            params={"classification": "out_of_scope"},
        )

        assert response.status_code == 200, f"Response: {response.json()}"
        data = response.json()

        assert "items" in data
        assert len(data["items"]) == 1
        assert data["items"][0]["classification"] == "out_of_scope"


# ============================================================================
# Test: List Requests Filter by Status
# ============================================================================


class TestListRequestsFilterStatus:
    """Test filtering requests by status."""

    @pytest.mark.asyncio
    async def test_list_requests_filter_status(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        db_session: AsyncSession,
    ):
        """
        Create NEW and ANALYZED requests.
        Filter appropriately.
        """
        # Create requests with different statuses
        new_request = ClientRequest(
            project_id=test_project.id,
            title="New Request",
            content="This is new",
            source=RequestSource.EMAIL,
            status=RequestStatus.NEW,
            classification=ScopeClassification.PENDING,
        )
        analyzed_request = ClientRequest(
            project_id=test_project.id,
            title="Analyzed Request",
            content="This is analyzed",
            source=RequestSource.CHAT,
            status=RequestStatus.ANALYZED,
            classification=ScopeClassification.IN_SCOPE,
        )
        db_session.add_all([new_request, analyzed_request])
        await db_session.commit()

        # Filter by new status (lowercase)
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            params={"status": "new"},
        )

        assert response.status_code == 200, f"Response: {response.json()}"
        data = response.json()

        assert len(data["items"]) == 1
        assert data["items"][0]["status"] == "new"

        # Filter by analyzed status (lowercase)
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            params={"status": "analyzed"},
        )

        assert response.status_code == 200
        data = response.json()

        assert len(data["items"]) == 1
        assert data["items"][0]["status"] == "analyzed"


# ============================================================================
# Test: Manual Analyze Endpoint
# ============================================================================


class TestManualAnalyzeEndpoint:
    """Test manual analysis trigger endpoint."""

    @pytest.mark.asyncio
    async def test_manual_analyze_endpoint(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_scope_item: ScopeItem,
        mock_analyze_client_request,
    ):
        """
        Create request with auto_analyze=False.
        Call /analyze endpoint.
        Verify analysis results returned and saved.
        """
        # Create request without analysis
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Pending Request",
                "content": "This needs manual analysis",
                "source": "call",
                "auto_analyze": False,
            },
        )

        assert create_response.status_code == 201, f"Response: {create_response.json()}"
        request_id = create_response.json()["id"]
        assert create_response.json()["classification"] == "pending"

        # Trigger manual analysis
        analyze_response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests/{request_id}/analyze",
            headers=auth_headers,
        )

        assert analyze_response.status_code == 200
        analysis_data = analyze_response.json()

        assert "classification" in analysis_data
        assert "confidence" in analysis_data
        assert "reasoning" in analysis_data
        assert "suggested_action" in analysis_data
        assert "scope_creep_indicators" in analysis_data

        # Verify request was updated
        get_response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests/{request_id}",
            headers=auth_headers,
        )

        assert get_response.status_code == 200
        updated_data = get_response.json()
        assert updated_data["status"] == "analyzed"
        assert updated_data["classification"] != "pending"


# ============================================================================
# Test: Update Request Status
# ============================================================================


class TestUpdateRequestStatus:
    """Test updating request status."""

    @pytest.mark.asyncio
    async def test_update_request_status(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Update status to addressed, verify change persisted."""
        # Create a request
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Status Test",
                "content": "Testing status update",
                "auto_analyze": False,
            },
        )

        assert create_response.status_code == 201, f"Response: {create_response.json()}"
        request_id = create_response.json()["id"]

        # Update status (lowercase)
        update_response = await client.patch(
            f"/api/v1/projects/{test_project.id}/requests/{request_id}",
            headers=auth_headers,
            json={"status": "addressed"},
        )

        assert update_response.status_code == 200, f"Response: {update_response.json()}"
        assert update_response.json()["status"] == "addressed"

        # Verify persistence
        get_response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests/{request_id}",
            headers=auth_headers,
        )

        assert get_response.json()["status"] == "addressed"


# ============================================================================
# Test: Update Request Link Scope Item
# ============================================================================


class TestUpdateRequestLinkScopeItem:
    """Test manually linking request to scope item."""

    @pytest.mark.asyncio
    async def test_update_request_link_scope_item(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_scope_item: ScopeItem,
    ):
        """Manually link request to scope item, verify linked_scope_item_id set."""
        # Create a request
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Link Test",
                "content": "Testing scope item linking",
                "auto_analyze": False,
            },
        )

        assert create_response.status_code == 201, f"Response: {create_response.json()}"
        request_id = create_response.json()["id"]

        # Link to scope item
        update_response = await client.patch(
            f"/api/v1/projects/{test_project.id}/requests/{request_id}",
            headers=auth_headers,
            json={"linked_scope_item_id": str(test_scope_item.id)},
        )

        assert update_response.status_code == 200
        assert update_response.json()["linked_scope_item_id"] == str(test_scope_item.id)


# ============================================================================
# Test: Create Request Empty Scope
# ============================================================================


class TestCreateRequestEmptyScope:
    """Test handling requests when project has no scope items."""

    @pytest.mark.asyncio
    async def test_create_request_empty_scope(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,  # Project without scope items
    ):
        """
        Project with no scope items.
        auto_analyze=True.
        Verify handles gracefully (likely out_of_scope).
        """
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Empty Scope Test",
                "content": "What happens with no scope items?",
                "source": "other",
                "auto_analyze": True,
            },
        )

        assert response.status_code == 201, f"Response: {response.json()}"
        data = response.json()

        # Should handle gracefully - either out_of_scope or specific handling
        assert data["classification"] == "out_of_scope"
        assert data["status"] == "analyzed"
        assert "no scope items" in data["analysis_reasoning"].lower()


# ============================================================================
# Test: Request Validation
# ============================================================================


class TestRequestValidation:
    """Test request validation."""

    @pytest.mark.asyncio
    async def test_create_request_missing_title(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Verify validation error for missing title."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "content": "Content without title",
            },
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_request_empty_content(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Verify validation error for empty content."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Test",
                "content": "",
            },
        )

        assert response.status_code == 422


# ============================================================================
# Test: Request Not Found
# ============================================================================


class TestRequestNotFound:
    """Test 404 handling."""

    @pytest.mark.asyncio
    async def test_get_nonexistent_request(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Verify 404 for non-existent request."""
        import uuid
        fake_uuid = uuid.uuid4()
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests/{fake_uuid}",
            headers=auth_headers,
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_request_wrong_project(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        other_user_project: Project,
        other_auth_headers: dict,
    ):
        """Verify 404 when accessing request from wrong project."""
        # Create request in test_project
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Cross Project Test",
                "content": "Test content",
                "auto_analyze": False,
            },
        )

        assert create_response.status_code == 201, f"Response: {create_response.json()}"
        request_id = create_response.json()["id"]

        # Try to access from other_user_project (different owner)
        response = await client.get(
            f"/api/v1/projects/{other_user_project.id}/requests/{request_id}",
            headers=other_auth_headers,
        )

        assert response.status_code == 404


# ============================================================================
# Test: Invalid Scope Item Link
# ============================================================================


class TestInvalidScopeItemLink:
    """Test invalid scope item linking."""

    @pytest.mark.asyncio
    async def test_link_invalid_scope_item(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Verify error when linking to non-existent scope item."""
        import uuid
        
        # Create a request
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Invalid Link Test",
                "content": "Test content",
                "auto_analyze": False,
            },
        )

        assert create_response.status_code == 201, f"Response: {create_response.json()}"
        request_id = create_response.json()["id"]

        # Try to link to non-existent scope item (use valid UUID format)
        fake_scope_id = str(uuid.uuid4())
        update_response = await client.patch(
            f"/api/v1/projects/{test_project.id}/requests/{request_id}",
            headers=auth_headers,
            json={"linked_scope_item_id": fake_scope_id},
        )

        assert update_response.status_code == 400
        assert "scope item not found" in update_response.json()["detail"].lower()


# ============================================================================
# Test: Authorization
# ============================================================================


class TestRequestAuthorization:
    """Test authorization for client requests."""

    @pytest.mark.asyncio
    async def test_cannot_access_other_users_project_requests(
        self,
        client: AsyncClient,
        auth_headers: dict,
        other_user_project: Project,
    ):
        """Verify user cannot access requests from another user's project."""
        response = await client.get(
            f"/api/v1/projects/{other_user_project.id}/requests",
            headers=auth_headers,
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_cannot_create_request_in_other_users_project(
        self,
        client: AsyncClient,
        auth_headers: dict,
        other_user_project: Project,
    ):
        """Verify user cannot create request in another user's project."""
        response = await client.post(
            f"/api/v1/projects/{other_user_project.id}/requests",
            headers=auth_headers,
            json={
                "title": "Unauthorized Request",
                "content": "Should not be allowed",
                "auto_analyze": False,
            },
        )

        assert response.status_code == 404


# ============================================================================
# Test: Pagination
# ============================================================================


class TestListRequestsPagination:
    """Test pagination for listing requests."""

    @pytest.mark.asyncio
    async def test_list_requests_pagination(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        db_session: AsyncSession,
    ):
        """Test skip and limit parameters."""
        # Create multiple requests
        for i in range(5):
            request = ClientRequest(
                project_id=test_project.id,
                title=f"Request {i}",
                content=f"Content {i}",
                source=RequestSource.EMAIL,
                status=RequestStatus.NEW,
                classification=ScopeClassification.PENDING,
            )
            db_session.add(request)
        await db_session.commit()

        # Get first 2
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            params={"skip": 0, "limit": 2},
        )

        assert response.status_code == 200, f"Response: {response.json()}"
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 5
        assert data["skip"] == 0
        assert data["limit"] == 2

        # Get next 2
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/requests",
            headers=auth_headers,
            params={"skip": 2, "limit": 2},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["skip"] == 2