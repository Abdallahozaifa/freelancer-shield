"""Unit tests for Projects API endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.models.enums import ProjectStatus
from app.models.project import Project
from app.models.user import User


@pytest.fixture
async def test_client_fixture(
    db_session: AsyncSession,
    test_user: User,
) -> Client:
    """Create a test client for the test user."""
    client = Client(
        user_id=test_user.id,
        name="Test Client",
        email="testclient@example.com",
        company="Test Company",
    )
    db_session.add(client)
    await db_session.commit()
    await db_session.refresh(client)
    return client


@pytest.fixture
async def other_user_client(
    db_session: AsyncSession,
    other_user: User,
) -> Client:
    """Create a client belonging to another user."""
    client = Client(
        user_id=other_user.id,
        name="Other User Client",
        email="otherclient@example.com",
        company="Other Company",
    )
    db_session.add(client)
    await db_session.commit()
    await db_session.refresh(client)
    return client


@pytest.fixture
async def test_project(
    db_session: AsyncSession,
    test_user: User,
    test_client_fixture: Client,
) -> Project:
    """Create a test project."""
    project = Project(
        user_id=test_user.id,
        client_id=test_client_fixture.id,
        name="Test Project",
        description="A test project",
        status=ProjectStatus.ACTIVE,
        budget=10000.00,
        hourly_rate=150.00,
        estimated_hours=100.0,
    )
    db_session.add(project)
    await db_session.commit()
    await db_session.refresh(project)
    return project


class TestCreateProject:
    """Tests for POST /api/v1/projects."""

    async def test_create_project_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_client_fixture: Client,
    ):
        """Test creating a project with valid client_id."""
        response = await client.post(
            "/api/v1/projects",
            headers=auth_headers,
            json={
                "client_id": str(test_client_fixture.id),
                "name": "New Project",
                "description": "Project description",
                "status": "active",
                "budget": "5000.00",
                "hourly_rate": "100.00",
                "estimated_hours": "50.0",
            },
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"
        assert data["description"] == "Project description"
        assert data["client_id"] == str(test_client_fixture.id)
        assert data["client_name"] == test_client_fixture.name
        assert data["status"] == "active"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    async def test_create_project_invalid_client(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test creating project with non-existent client_id returns 404."""
        response = await client.post(
            "/api/v1/projects",
            headers=auth_headers,
            json={
                "client_id": "00000000-0000-0000-0000-000000000000",
                "name": "New Project",
            },
        )
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Client not found"

    async def test_create_project_other_users_client(
        self,
        client: AsyncClient,
        auth_headers: dict,
        other_user_client: Client,
    ):
        """Test creating project with another user's client returns 404."""
        response = await client.post(
            "/api/v1/projects",
            headers=auth_headers,
            json={
                "client_id": str(other_user_client.id),
                "name": "New Project",
            },
        )
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Client not found"


class TestListProjects:
    """Tests for GET /api/v1/projects."""

    async def test_list_projects_empty(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test listing projects when user has none."""
        response = await client.get(
            "/api/v1/projects",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["projects"] == []
        assert data["total"] == 0

    async def test_list_projects_filter_by_status(
        self,
        client: AsyncClient,
        auth_headers: dict,
        db_session: AsyncSession,
        test_user: User,
        test_client_fixture: Client,
    ):
        """Test filtering projects by status."""
        # Create ACTIVE project
        active_project = Project(
            user_id=test_user.id,
            client_id=test_client_fixture.id,
            name="Active Project",
            status=ProjectStatus.ACTIVE,
        )
        # Create COMPLETED project
        completed_project = Project(
            user_id=test_user.id,
            client_id=test_client_fixture.id,
            name="Completed Project",
            status=ProjectStatus.COMPLETED,
        )
        db_session.add_all([active_project, completed_project])
        await db_session.commit()
        
        # Filter by ACTIVE status
        response = await client.get(
            "/api/v1/projects",
            headers=auth_headers,
            params={"status": "active"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["projects"]) == 1
        assert data["projects"][0]["name"] == "Active Project"
        assert data["projects"][0]["status"] == "active"

    async def test_list_projects_filter_by_client(
        self,
        client: AsyncClient,
        auth_headers: dict,
        db_session: AsyncSession,
        test_user: User,
        test_client_fixture: Client,
    ):
        """Test filtering projects by client_id."""
        # Create another client
        other_client = Client(
            user_id=test_user.id,
            name="Other Client",
            email="other@example.com",
        )
        db_session.add(other_client)
        await db_session.commit()
        await db_session.refresh(other_client)
        
        # Create project for test_client
        project1 = Project(
            user_id=test_user.id,
            client_id=test_client_fixture.id,
            name="Project for Test Client",
            status=ProjectStatus.ACTIVE,
        )
        # Create project for other_client
        project2 = Project(
            user_id=test_user.id,
            client_id=other_client.id,
            name="Project for Other Client",
            status=ProjectStatus.ACTIVE,
        )
        db_session.add_all([project1, project2])
        await db_session.commit()
        
        # Filter by test_client_fixture
        response = await client.get(
            "/api/v1/projects",
            headers=auth_headers,
            params={"client_id": str(test_client_fixture.id)},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["projects"]) == 1
        assert data["projects"][0]["name"] == "Project for Test Client"
        assert data["projects"][0]["client_id"] == str(test_client_fixture.id)


class TestGetProject:
    """Tests for GET /api/v1/projects/{project_id}."""

    async def test_get_project_with_stats(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
        test_client_fixture: Client,
    ):
        """Test getting a project with stats."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_project.id)
        assert data["name"] == "Test Project"
        assert data["client_name"] == test_client_fixture.name
        # Stats should be 0 initially
        assert data["scope_item_count"] == 0
        assert data["completed_scope_count"] == 0
        assert data["out_of_scope_request_count"] == 0

    async def test_get_project_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test getting non-existent project returns 404."""
        response = await client.get(
            "/api/v1/projects/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"

    async def test_get_project_invalid_uuid(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test getting project with invalid UUID returns 404."""
        response = await client.get(
            "/api/v1/projects/invalid-uuid",
            headers=auth_headers,
        )
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Project not found"


class TestGetProjectDetail:
    """Tests for GET /api/v1/projects/{project_id}/detail."""

    async def test_get_project_detail(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Test getting project detail with scope items and requests."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/detail",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(test_project.id)
        assert "scope_items" in data
        assert "recent_requests" in data
        assert data["scope_items"] == []
        assert data["recent_requests"] == []


class TestUpdateProject:
    """Tests for PATCH /api/v1/projects/{project_id}."""

    async def test_update_project_status(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Test updating project status from ACTIVE to COMPLETED."""
        assert test_project.status == ProjectStatus.ACTIVE
        
        response = await client.patch(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
            json={"status": "completed"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"

    async def test_update_project_partial(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Test partial update only changes specified fields."""
        original_description = test_project.description
        
        response = await client.patch(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
            json={"name": "Updated Name"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["description"] == original_description

    async def test_update_project_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test updating non-existent project returns 404."""
        response = await client.patch(
            "/api/v1/projects/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
            json={"name": "New Name"},
        )
        
        assert response.status_code == 404


class TestDeleteProject:
    """Tests for DELETE /api/v1/projects/{project_id}."""

    async def test_delete_project_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_project: Project,
    ):
        """Test deleting a project returns 204."""
        response = await client.delete(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == 204
        
        # Verify project is deleted
        get_response = await client.get(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
        )
        assert get_response.status_code == 404

    async def test_delete_project_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test deleting non-existent project returns 404."""
        response = await client.delete(
            "/api/v1/projects/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        
        assert response.status_code == 404