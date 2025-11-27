"""Unit tests for user profile management endpoints."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import status
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.api.deps import get_current_user, get_db


@pytest.fixture
def mock_user():
    """Create a mock user for testing."""
    user = MagicMock()
    user.id = "test-user-id-123"
    user.email = "test@example.com"
    user.full_name = "Test User"
    user.business_name = "Test Business"
    user.is_active = True
    user.created_at = datetime(2024, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
    return user


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = AsyncMock()
    return db


@pytest.fixture
def auth_headers():
    """Return authorization headers for authenticated requests."""
    return {"Authorization": "Bearer valid-test-token"}


class TestGetProfile:
    """Tests for GET /api/v1/users/profile endpoint."""

    @pytest.mark.asyncio
    async def test_get_profile_success(self, mock_user, auth_headers):
        """
        Test that an authenticated user can successfully retrieve their profile.
        Verifies all fields are returned including created_at.
        """
        app.dependency_overrides[get_current_user] = lambda: mock_user

        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
            ) as client:
                response = await client.get(
                    "/api/v1/users/profile",
                    headers=auth_headers,
                )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert data["id"] == "test-user-id-123"
            assert data["email"] == "test@example.com"
            assert data["full_name"] == "Test User"
            assert data["business_name"] == "Test Business"
            assert data["is_active"] is True
            assert "created_at" in data
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_get_profile_unauthorized(self):
        """
        Test that unauthenticated requests are rejected.
        Expected: 403 Forbidden.
        """
        app.dependency_overrides.clear()

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.get("/api/v1/users/profile")

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestUpdateProfile:
    """Tests for PATCH /api/v1/users/profile endpoint."""

    @pytest.mark.asyncio
    async def test_update_profile_full_name(self, mock_user, mock_db, auth_headers):
        """
        Test updating only the full_name field.
        Verifies full_name changes while other fields remain unchanged.
        """

        async def mock_refresh(obj):
            obj.full_name = "Updated Name"

        mock_db.refresh = mock_refresh

        app.dependency_overrides[get_current_user] = lambda: mock_user
        app.dependency_overrides[get_db] = lambda: mock_db

        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
            ) as client:
                response = await client.patch(
                    "/api/v1/users/profile",
                    headers=auth_headers,
                    json={"full_name": "Updated Name"},
                )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert data["full_name"] == "Updated Name"
            assert data["email"] == "test@example.com"
            assert data["business_name"] == "Test Business"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_profile_business_name(self, mock_user, mock_db, auth_headers):
        """
        Test updating only the business_name field.
        Verifies business_name changes while other fields remain unchanged.
        """

        async def mock_refresh(obj):
            obj.business_name = "New Business LLC"

        mock_db.refresh = mock_refresh

        app.dependency_overrides[get_current_user] = lambda: mock_user
        app.dependency_overrides[get_db] = lambda: mock_db

        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
            ) as client:
                response = await client.patch(
                    "/api/v1/users/profile",
                    headers=auth_headers,
                    json={"business_name": "New Business LLC"},
                )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert data["business_name"] == "New Business LLC"
            assert data["full_name"] == "Test User"
            assert data["email"] == "test@example.com"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_profile_both_fields(self, mock_user, mock_db, auth_headers):
        """
        Test updating both full_name and business_name simultaneously.
        Verifies both fields are updated correctly.
        """

        async def mock_refresh(obj):
            obj.full_name = "New Full Name"
            obj.business_name = "New Business Name"

        mock_db.refresh = mock_refresh

        app.dependency_overrides[get_current_user] = lambda: mock_user
        app.dependency_overrides[get_db] = lambda: mock_db

        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
            ) as client:
                response = await client.patch(
                    "/api/v1/users/profile",
                    headers=auth_headers,
                    json={
                        "full_name": "New Full Name",
                        "business_name": "New Business Name",
                    },
                )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert data["full_name"] == "New Full Name"
            assert data["business_name"] == "New Business Name"
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_profile_unauthorized(self):
        """
        Test that unauthenticated update requests are rejected.
        Expected: 403 Forbidden.
        """
        app.dependency_overrides.clear()

        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.patch(
                "/api/v1/users/profile",
                json={"full_name": "Hacker"},
            )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_update_profile_empty_body(self, mock_user, mock_db, auth_headers):
        """
        Test that empty update requests are rejected.
        Expected: 400 Bad Request.
        """
        app.dependency_overrides[get_current_user] = lambda: mock_user
        app.dependency_overrides[get_db] = lambda: mock_db

        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
            ) as client:
                response = await client.patch(
                    "/api/v1/users/profile",
                    headers=auth_headers,
                    json={},
                )

            assert response.status_code == status.HTTP_400_BAD_REQUEST
            assert "No fields to update" in response.json()["detail"]
        finally:
            app.dependency_overrides.clear()

    @pytest.mark.asyncio
    async def test_update_profile_full_name_validation(self, mock_user, mock_db, auth_headers):
        """
        Test that full_name validation is enforced (min_length=1).
        Expected: 422 Unprocessable Entity for empty string.
        """
        app.dependency_overrides[get_current_user] = lambda: mock_user
        app.dependency_overrides[get_db] = lambda: mock_db

        try:
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://test",
            ) as client:
                response = await client.patch(
                    "/api/v1/users/profile",
                    headers=auth_headers,
                    json={"full_name": ""},
                )

            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        finally:
            app.dependency_overrides.clear()