"""Unit tests for client endpoints."""

import pytest
from uuid import uuid4

from fastapi import status


class TestCreateClient:
    """Tests for POST /api/v1/clients endpoint."""

    @pytest.mark.asyncio
    async def test_create_client_success(self, client, auth_headers):
        """Test creating a client with all fields."""
        client_data = {
            "name": "New Client",
            "email": "newclient@example.com",
            "company": "New Company Inc.",
            "notes": "Important client notes",
        }

        response = await client.post(
            "/api/v1/clients",
            json=client_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == client_data["name"]
        assert data["email"] == client_data["email"]
        assert data["company"] == client_data["company"]
        assert data["notes"] == client_data["notes"]
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert data["project_count"] == 0

    @pytest.mark.asyncio
    async def test_create_client_minimal(self, client, auth_headers):
        """Test creating a client with only required fields."""
        client_data = {"name": "Minimal Client"}

        response = await client.post(
            "/api/v1/clients",
            json=client_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == client_data["name"]
        assert data["email"] is None
        assert data["company"] is None
        assert data["notes"] is None
        assert data["project_count"] == 0

    @pytest.mark.asyncio
    async def test_create_client_invalid_email(self, client, auth_headers):
        """Test creating a client with invalid email format."""
        client_data = {
            "name": "Invalid Email Client",
            "email": "not-an-email",
        }

        response = await client.post(
            "/api/v1/clients",
            json=client_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.asyncio
    async def test_create_client_empty_name(self, client, auth_headers):
        """Test creating a client with empty name fails."""
        client_data = {"name": ""}

        response = await client.post(
            "/api/v1/clients",
            json=client_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.asyncio
    async def test_create_client_name_too_long(self, client, auth_headers):
        """Test creating a client with name exceeding max length."""
        client_data = {"name": "a" * 256}

        response = await client.post(
            "/api/v1/clients",
            json=client_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.asyncio
    async def test_create_client_unauthorized(self, client):
        """Test creating a client without authentication."""
        client_data = {"name": "Unauthorized Client"}

        response = await client.post(
            "/api/v1/clients",
            json=client_data,
        )

        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


class TestListClients:
    """Tests for GET /api/v1/clients endpoint."""

    @pytest.mark.asyncio
    async def test_list_clients_empty(self, client, auth_headers):
        """Test listing clients when user has none."""
        response = await client.get(
            "/api/v1/clients",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["clients"] == []
        assert data["total"] == 0

    @pytest.mark.asyncio
    async def test_list_clients_with_data(self, client, auth_headers):
        """Test listing clients when user has multiple clients."""
        # Create 3 clients first
        for i in range(3):
            await client.post(
                "/api/v1/clients",
                json={"name": f"Client {i + 1}"},
                headers=auth_headers,
            )

        response = await client.get(
            "/api/v1/clients",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["clients"]) == 3
        assert data["total"] == 3
        for c in data["clients"]:
            assert c["project_count"] == 0

    @pytest.mark.asyncio
    async def test_list_clients_pagination(self, client, auth_headers):
        """Test listing clients with pagination parameters."""
        # Create 5 clients
        for i in range(5):
            await client.post(
                "/api/v1/clients",
                json={"name": f"Client {i + 1}"},
                headers=auth_headers,
            )

        # Get first page
        response = await client.get(
            "/api/v1/clients",
            params={"skip": 0, "limit": 2},
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["clients"]) == 2
        assert data["total"] == 5

        # Get second page
        response = await client.get(
            "/api/v1/clients",
            params={"skip": 2, "limit": 2},
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["clients"]) == 2
        assert data["total"] == 5

    @pytest.mark.asyncio
    async def test_list_clients_unauthorized(self, client):
        """Test listing clients without authentication."""
        response = await client.get("/api/v1/clients")

        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


class TestGetClient:
    """Tests for GET /api/v1/clients/{client_id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_client_success(self, client, auth_headers):
        """Test getting an existing client."""
        # Create a client first
        create_response = await client.post(
            "/api/v1/clients",
            json={
                "name": "Test Client",
                "email": "test@client.com",
                "company": "Test Co",
                "notes": "Some notes",
            },
            headers=auth_headers,
        )
        client_id = create_response.json()["id"]

        # Get the client
        response = await client.get(
            f"/api/v1/clients/{client_id}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == client_id
        assert data["name"] == "Test Client"
        assert data["email"] == "test@client.com"
        assert data["company"] == "Test Co"
        assert data["notes"] == "Some notes"
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_get_client_not_found(self, client, auth_headers):
        """Test getting a non-existent client."""
        fake_id = str(uuid4())

        response = await client.get(
            f"/api/v1/clients/{fake_id}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "Client not found"

    @pytest.mark.asyncio
    async def test_get_client_unauthorized(self, client):
        """Test getting a client without authentication."""
        fake_id = str(uuid4())

        response = await client.get(f"/api/v1/clients/{fake_id}")

        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


class TestUpdateClient:
    """Tests for PATCH /api/v1/clients/{client_id} endpoint."""

    @pytest.mark.asyncio
    async def test_update_client_partial(self, client, auth_headers):
        """Test updating only the name field."""
        # Create a client
        create_response = await client.post(
            "/api/v1/clients",
            json={
                "name": "Original Name",
                "email": "original@example.com",
                "company": "Original Company",
            },
            headers=auth_headers,
        )
        client_id = create_response.json()["id"]

        # Update only the name
        response = await client.patch(
            f"/api/v1/clients/{client_id}",
            json={"name": "Updated Name"},
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Name"
        # Other fields should remain unchanged
        assert data["email"] == "original@example.com"
        assert data["company"] == "Original Company"

    @pytest.mark.asyncio
    async def test_update_client_all_fields(self, client, auth_headers):
        """Test updating all fields."""
        # Create a client
        create_response = await client.post(
            "/api/v1/clients",
            json={"name": "Original"},
            headers=auth_headers,
        )
        client_id = create_response.json()["id"]

        # Update all fields
        update_data = {
            "name": "Updated Name",
            "email": "updated@example.com",
            "company": "Updated Company",
            "notes": "Updated notes",
        }
        response = await client.patch(
            f"/api/v1/clients/{client_id}",
            json=update_data,
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["email"] == update_data["email"]
        assert data["company"] == update_data["company"]
        assert data["notes"] == update_data["notes"]

    @pytest.mark.asyncio
    async def test_update_client_not_found(self, client, auth_headers):
        """Test updating a non-existent client."""
        fake_id = str(uuid4())

        response = await client.patch(
            f"/api/v1/clients/{fake_id}",
            json={"name": "Updated"},
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "Client not found"

    @pytest.mark.asyncio
    async def test_update_client_invalid_email(self, client, auth_headers):
        """Test updating client with invalid email."""
        # Create a client
        create_response = await client.post(
            "/api/v1/clients",
            json={"name": "Test Client"},
            headers=auth_headers,
        )
        client_id = create_response.json()["id"]

        # Try to update with invalid email
        response = await client.patch(
            f"/api/v1/clients/{client_id}",
            json={"email": "not-valid-email"},
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.asyncio
    async def test_update_client_unauthorized(self, client):
        """Test updating a client without authentication."""
        fake_id = str(uuid4())

        response = await client.patch(
            f"/api/v1/clients/{fake_id}",
            json={"name": "Updated"},
        )

        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


class TestDeleteClient:
    """Tests for DELETE /api/v1/clients/{client_id} endpoint."""

    @pytest.mark.asyncio
    async def test_delete_client_success(self, client, auth_headers):
        """Test deleting an existing client."""
        # Create a client
        create_response = await client.post(
            "/api/v1/clients",
            json={"name": "To Be Deleted"},
            headers=auth_headers,
        )
        client_id = create_response.json()["id"]

        # Delete the client
        response = await client.delete(
            f"/api/v1/clients/{client_id}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify client is gone
        get_response = await client.get(
            f"/api/v1/clients/{client_id}",
            headers=auth_headers,
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_delete_client_not_found(self, client, auth_headers):
        """Test deleting a non-existent client."""
        fake_id = str(uuid4())

        response = await client.delete(
            f"/api/v1/clients/{fake_id}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["detail"] == "Client not found"

    @pytest.mark.asyncio
    async def test_delete_client_unauthorized(self, client):
        """Test deleting a client without authentication."""
        fake_id = str(uuid4())

        response = await client.delete(f"/api/v1/clients/{fake_id}")

        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)