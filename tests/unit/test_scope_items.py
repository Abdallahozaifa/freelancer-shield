"""Unit tests for Scope Items API endpoints."""
from decimal import Decimal
from uuid import uuid4

import pytest
from fastapi import status
from httpx import AsyncClient

from app.models import Project, ScopeItem, User


class TestCreateScopeItem:
    """Tests for creating scope items."""

    @pytest.mark.asyncio
    async def test_create_scope_item_success(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test creating a scope item successfully."""
        scope_data = {
            "title": "Design homepage",
            "description": "Create the homepage design mockup",
            "estimated_hours": "5.0",
        }
        
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope",
            json=scope_data,
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == scope_data["title"]
        assert data["description"] == scope_data["description"]
        assert data["order"] == 0  # First item should have order 0
        assert data["is_completed"] is False

    @pytest.mark.asyncio
    async def test_create_scope_item_auto_order(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test that scope items auto-assign incrementing orders."""
        titles = ["First task", "Second task", "Third task"]
        
        for i, title in enumerate(titles):
            response = await client.post(
                f"/api/v1/projects/{test_project.id}/scope",
                json={"title": title},
                headers=auth_headers,
            )
            
            assert response.status_code == status.HTTP_201_CREATED
            data = response.json()
            assert data["order"] == i  # Orders should be 0, 1, 2

    @pytest.mark.asyncio
    async def test_create_scope_item_minimal_data(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test creating a scope item with only required fields."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope",
            json={"title": "Minimal task"},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "Minimal task"
        assert data["description"] is None
        assert data["estimated_hours"] is None


class TestListScopeItems:
    """Tests for listing scope items."""

    @pytest.mark.asyncio
    async def test_list_scope_items_ordered(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_ordered: list[ScopeItem],
    ):
        """Test that scope items are returned in order."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify items are in correct order
        assert len(data) == 3
        for i, item in enumerate(data):
            assert item["order"] == i

    @pytest.mark.asyncio
    async def test_list_scope_items_empty(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test listing scope items for a project with no items."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data == []


class TestUpdateScopeItem:
    """Tests for updating scope items."""

    @pytest.mark.asyncio
    async def test_update_scope_item_completed(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        test_scope_item: ScopeItem,
    ):
        """Test marking a scope item as completed."""
        response = await client.patch(
            f"/api/v1/projects/{test_project.id}/scope/{test_scope_item.id}",
            json={"is_completed": True},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_completed"] is True

    @pytest.mark.asyncio
    async def test_update_scope_item_title(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        test_scope_item: ScopeItem,
    ):
        """Test updating a scope item's title."""
        new_title = "Updated task title"
        response = await client.patch(
            f"/api/v1/projects/{test_project.id}/scope/{test_scope_item.id}",
            json={"title": new_title},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["title"] == new_title

    @pytest.mark.asyncio
    async def test_update_scope_item_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test updating a non-existent scope item."""
        fake_id = str(uuid4())
        response = await client.patch(
            f"/api/v1/projects/{test_project.id}/scope/{fake_id}",
            json={"is_completed": True},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestGetProgress:
    """Tests for getting scope progress."""

    @pytest.mark.asyncio
    async def test_get_progress_empty(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test getting progress for a project with no scope items."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope/progress",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_items"] == 0
        assert data["completed_items"] == 0
        assert data["completion_percentage"] == 0.0

    @pytest.mark.asyncio
    async def test_get_progress_partial(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_with_progress: list[ScopeItem],
    ):
        """Test getting progress with partial completion (1 of 3 = 33.33%)."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope/progress",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_items"] == 3
        assert data["completed_items"] == 1
        assert data["completion_percentage"] == 33.33

    @pytest.mark.asyncio
    async def test_get_progress_with_hours(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_with_hours: list[ScopeItem],
    ):
        """Test getting progress with estimated hours calculations."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope/progress",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Total hours: 5 + 10 + 3 = 18
        # Completed hours: 5 + 3 = 8 (tasks 1 and 3 are completed)
        assert data["total_estimated_hours"] is not None
        assert data["completed_estimated_hours"] is not None
        assert Decimal(str(data["total_estimated_hours"])) == Decimal("18.0")
        assert Decimal(str(data["completed_estimated_hours"])) == Decimal("8.0")

    @pytest.mark.asyncio
    async def test_get_progress_all_completed(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_all_completed: list[ScopeItem],
    ):
        """Test getting progress when all items are completed."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope/progress",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["completion_percentage"] == 100.0
        assert data["total_items"] == data["completed_items"]


class TestReorderScopeItems:
    """Tests for reordering scope items."""

    @pytest.mark.asyncio
    async def test_reorder_scope_items(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_abc: tuple[ScopeItem, ScopeItem, ScopeItem],
    ):
        """Test reordering scope items from A,B,C to C,A,B."""
        item_a, item_b, item_c = scope_items_abc
        new_order = [str(item_c.id), str(item_a.id), str(item_b.id)]
        
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope/reorder",
            json={"item_ids": new_order},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify new orders: C=0, A=1, B=2
        assert data[0]["id"] == str(item_c.id)
        assert data[0]["order"] == 0
        assert data[1]["id"] == str(item_a.id)
        assert data[1]["order"] == 1
        assert data[2]["id"] == str(item_b.id)
        assert data[2]["order"] == 2

    @pytest.mark.asyncio
    async def test_reorder_invalid_ids(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_abc: tuple[ScopeItem, ScopeItem, ScopeItem],
    ):
        """Test reorder with non-existent item_id returns 400."""
        fake_id = str(uuid4())
        item_a, item_b, _ = scope_items_abc
        
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope/reorder",
            json={"item_ids": [fake_id, str(item_a.id), str(item_b.id)]},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.asyncio
    async def test_reorder_missing_items(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_abc: tuple[ScopeItem, ScopeItem, ScopeItem],
    ):
        """Test reorder with missing items in the list returns 400."""
        item_a, item_b, _ = scope_items_abc
        # Only providing 2 items when 3 exist
        
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope/reorder",
            json={"item_ids": [str(item_a.id), str(item_b.id)]},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestDeleteScopeItem:
    """Tests for deleting scope items."""

    @pytest.mark.asyncio
    async def test_delete_scope_item(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        test_scope_item: ScopeItem,
    ):
        """Test deleting a scope item."""
        response = await client.delete(
            f"/api/v1/projects/{test_project.id}/scope/{test_scope_item.id}",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT

    @pytest.mark.asyncio
    async def test_delete_scope_item_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test deleting a non-existent scope item."""
        fake_id = str(uuid4())
        response = await client.delete(
            f"/api/v1/projects/{test_project.id}/scope/{fake_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_delete_middle_item_preserves_others(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
        scope_items_abc: tuple[ScopeItem, ScopeItem, ScopeItem],
    ):
        """Test that deleting a middle item doesn't affect others."""
        item_a, item_b, item_c = scope_items_abc
        
        # Delete middle item (B)
        response = await client.delete(
            f"/api/v1/projects/{test_project.id}/scope/{item_b.id}",
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify remaining items still exist
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope",
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Should have 2 items left
        assert len(data) == 2
        item_ids = [item["id"] for item in data]
        assert str(item_a.id) in item_ids
        assert str(item_b.id) not in item_ids
        assert str(item_c.id) in item_ids


class TestScopeItemAuthorization:
    """Tests for scope item authorization."""

    @pytest.mark.asyncio
    async def test_scope_item_other_users_project(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        other_user_project: Project,
    ):
        """Test that a user cannot add scope to another user's project."""
        response = await client.post(
            f"/api/v1/projects/{other_user_project.id}/scope",
            json={"title": "Unauthorized task"},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_list_scope_other_users_project(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        other_user_project: Project,
    ):
        """Test that a user cannot list scope from another user's project."""
        response = await client.get(
            f"/api/v1/projects/{other_user_project.id}/scope",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_unauthorized_access(
        self,
        client: AsyncClient,
        test_project: Project,
    ):
        """Test that unauthenticated requests are rejected."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/scope",
        )
        
        # Accept either 401 (Unauthorized) or 403 (Forbidden) - both indicate auth required
        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


class TestScopeItemValidation:
    """Tests for scope item input validation."""

    @pytest.mark.asyncio
    async def test_create_scope_item_empty_title(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test that empty title is rejected."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope",
            json={"title": ""},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.asyncio
    async def test_create_scope_item_title_too_long(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test that overly long title is rejected."""
        long_title = "x" * 256
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope",
            json={"title": long_title},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.asyncio
    async def test_create_scope_item_negative_hours(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_project: Project,
    ):
        """Test that negative estimated hours is rejected."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/scope",
            json={"title": "Task", "estimated_hours": "-5.0"},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.asyncio
    async def test_invalid_project_id_format(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        """Test that invalid UUID format returns 404."""
        response = await client.get(
            "/api/v1/projects/not-a-uuid/scope",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
