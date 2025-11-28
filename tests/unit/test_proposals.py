"""Unit tests for Proposals endpoints."""
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest
from fastapi import status
from httpx import AsyncClient

from app.models.enums import RequestStatus, ProposalStatus, ScopeClassification


class TestCreateProposalSuccess:
    """Test creating a proposal successfully."""
    
    @pytest.mark.asyncio
    async def test_create_proposal_success(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Create proposal manually and verify all fields."""
        proposal_data = {
            "title": "New Feature Proposal",
            "description": "This proposal outlines the new feature development",
            "amount": "1500.00",
            "estimated_hours": "20.0",
        }
        
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json=proposal_data,
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == proposal_data["title"]
        assert data["description"] == proposal_data["description"]
        assert Decimal(data["amount"]) == Decimal(proposal_data["amount"])
        assert Decimal(data["estimated_hours"]) == Decimal(proposal_data["estimated_hours"])
        assert data["status"] == ProposalStatus.DRAFT.value
        assert data["source_request_id"] is None
        assert data["sent_at"] is None
        assert data["responded_at"] is None


class TestCreateProposalFromRequest:
    """Test creating a proposal from a client request."""
    
    @pytest.mark.asyncio
    async def test_create_proposal_from_request(
        self, client: AsyncClient, auth_headers: dict, test_project, test_client_request
    ):
        """Create from OUT_OF_SCOPE request, verify title auto-generated and request linked."""
        proposal_data = {
            "source_request_id": str(test_client_request.id),
            "amount": "2000.00",
            "estimated_hours": "25.0",
        }
        
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests/{test_client_request.id}/create-proposal",
            json=proposal_data,
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == f"Proposal: {test_client_request.title}"
        assert data["source_request_id"] == str(test_client_request.id)
        assert test_client_request.content in data["description"]
        assert Decimal(data["amount"]) == Decimal(proposal_data["amount"])
        
    @pytest.mark.asyncio
    async def test_create_proposal_from_in_scope_request(
        self, client: AsyncClient, auth_headers: dict, test_project, test_client_request_in_scope
    ):
        """Create from IN_SCOPE request - should still work (user's choice)."""
        proposal_data = {
            "source_request_id": str(test_client_request_in_scope.id),
            "amount": "500.00",
            "estimated_hours": "5.0",
        }
        
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/requests/{test_client_request_in_scope.id}/create-proposal",
            json=proposal_data,
            headers=auth_headers,
        )
        
        # Should succeed - it's the user's choice to create proposals for any request
        assert response.status_code == status.HTTP_201_CREATED


class TestListProposals:
    """Test listing proposals."""
    
    @pytest.mark.asyncio
    async def test_list_proposals(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Create multiple proposals and verify list returns all."""
        # Create multiple proposals first
        proposals_to_create = [
            {"title": "Proposal 1", "description": "Desc 1", "amount": "1000.00"},
            {"title": "Proposal 2", "description": "Desc 2", "amount": "2000.00"},
            {"title": "Proposal 3", "description": "Desc 3", "amount": "3000.00"},
        ]
        
        for proposal_data in proposals_to_create:
            await client.post(
                f"/api/v1/projects/{test_project.id}/proposals",
                json=proposal_data,
                headers=auth_headers,
            )
        
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/proposals",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) >= len(proposals_to_create)
    
    @pytest.mark.asyncio
    async def test_list_proposals_with_status_filter(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Filter proposals by status."""
        # Create a draft proposal
        await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={"title": "Draft", "description": "Draft desc", "amount": "100.00"},
            headers=auth_headers,
        )
        
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/proposals?status=draft",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for proposal in data:
            assert proposal["status"] == "draft"


class TestUpdateProposal:
    """Test updating proposals."""
    
    @pytest.mark.asyncio
    async def test_update_proposal_amount(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Update amount and verify change."""
        # First create a proposal
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={
                "title": "Original Title",
                "description": "Original description",
                "amount": "1000.00",
            },
            headers=auth_headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        proposal_id = create_response.json()["id"]
        
        # Update the amount
        update_data = {"amount": "1500.00"}
        response = await client.patch(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}",
            json=update_data,
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert Decimal(data["amount"]) == Decimal("1500.00")
        
    @pytest.mark.asyncio
    async def test_update_status_to_accepted(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Update status to ACCEPTED, verify responded_at is set automatically."""
        # Create and send a proposal first
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={
                "title": "Test Proposal",
                "description": "Test description",
                "amount": "1000.00",
            },
            headers=auth_headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        proposal_id = create_response.json()["id"]
        
        # Send it
        send_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}/send",
            headers=auth_headers,
        )
        assert send_response.status_code == status.HTTP_200_OK
        
        # Update status to accepted
        response = await client.patch(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}",
            json={"status": "accepted"},
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == ProposalStatus.ACCEPTED.value
        assert data["responded_at"] is not None


class TestSendProposal:
    """Test sending proposals."""
    
    @pytest.mark.asyncio
    async def test_send_proposal(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Call /send endpoint, verify status=SENT and sent_at set."""
        # Create a proposal first
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={
                "title": "Test Proposal",
                "description": "Test description",
                "amount": "1000.00",
            },
            headers=auth_headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        proposal_id = create_response.json()["id"]
        
        # Send it
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}/send",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == ProposalStatus.SENT.value
        assert data["sent_at"] is not None
        
    @pytest.mark.asyncio
    async def test_send_already_sent(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Try to send already-sent proposal - expect 400."""
        # Create and send a proposal
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={
                "title": "Test Proposal",
                "description": "Test description",
                "amount": "1000.00",
            },
            headers=auth_headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        proposal_id = create_response.json()["id"]
        
        # Send it first time
        first_send = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}/send",
            headers=auth_headers,
        )
        assert first_send.status_code == status.HTTP_200_OK
        
        # Try to send again
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}/send",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "already" in response.json()["detail"].lower()


class TestGetStats:
    """Test proposal statistics."""
    
    @pytest.mark.asyncio
    async def test_get_stats(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Create proposals with various statuses and verify stats calculations."""
        # Create proposals with different statuses
        # Draft
        draft_resp = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={"title": "Draft 1", "description": "Desc", "amount": "100.00"},
            headers=auth_headers,
        )
        assert draft_resp.status_code == status.HTTP_201_CREATED
        
        # Sent
        sent_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={"title": "Sent 1", "description": "Desc", "amount": "200.00"},
            headers=auth_headers,
        )
        assert sent_response.status_code == status.HTTP_201_CREATED
        sent_id = sent_response.json()["id"]
        send_resp = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals/{sent_id}/send",
            headers=auth_headers,
        )
        assert send_resp.status_code == status.HTTP_200_OK
        
        # Accepted (must be sent first)
        accepted_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={"title": "Accepted 1", "description": "Desc", "amount": "500.00"},
            headers=auth_headers,
        )
        assert accepted_response.status_code == status.HTTP_201_CREATED
        accepted_id = accepted_response.json()["id"]
        await client.post(
            f"/api/v1/projects/{test_project.id}/proposals/{accepted_id}/send",
            headers=auth_headers,
        )
        await client.patch(
            f"/api/v1/projects/{test_project.id}/proposals/{accepted_id}",
            json={"status": "accepted"},
            headers=auth_headers,
        )
        
        # Get stats
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/proposals/stats",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_proposals"] >= 3
        assert data["draft_count"] >= 1
        assert data["sent_count"] >= 1
        assert data["accepted_count"] >= 1
        assert Decimal(data["total_amount_accepted"]) >= Decimal("500.00")


class TestDeleteProposal:
    """Test deleting proposals."""
    
    @pytest.mark.asyncio
    async def test_delete_proposal(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Delete draft proposal and verify it's deleted."""
        # Create a proposal
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={
                "title": "To Delete",
                "description": "This will be deleted",
                "amount": "100.00",
            },
            headers=auth_headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        proposal_id = create_response.json()["id"]
        
        # Delete it
        response = await client.delete(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's gone
        get_response = await client.get(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}",
            headers=auth_headers,
        )
        assert get_response.status_code == status.HTTP_404_NOT_FOUND
        
    @pytest.mark.asyncio
    async def test_delete_sent_proposal(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Try to delete sent proposal - expect 400."""
        # Create and send a proposal
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={
                "title": "Sent Proposal",
                "description": "This was sent",
                "amount": "100.00",
            },
            headers=auth_headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        proposal_id = create_response.json()["id"]
        
        # Send it
        send_resp = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}/send",
            headers=auth_headers,
        )
        assert send_resp.status_code == status.HTTP_200_OK
        
        # Try to delete
        response = await client.delete(
            f"/api/v1/projects/{test_project.id}/proposals/{proposal_id}",
            headers=auth_headers,
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "sent" in response.json()["detail"].lower()


class TestProposalNotFound:
    """Test 404 scenarios."""
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_proposal(
        self, client: AsyncClient, auth_headers: dict, test_project
    ):
        """Get a proposal that doesn't exist."""
        fake_id = str(uuid.uuid4())
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/proposals/{fake_id}",
            headers=auth_headers,
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
    @pytest.mark.asyncio
    async def test_proposal_in_wrong_project(
        self, client: AsyncClient, auth_headers: dict, test_project, other_user_project
    ):
        """Try to access proposal from a different user's project."""
        # Create a proposal in the test user's project
        create_response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={
                "title": "Test",
                "description": "Test",
                "amount": "100.00",
            },
            headers=auth_headers,
        )
        assert create_response.status_code == status.HTTP_201_CREATED
        proposal_id = create_response.json()["id"]
        
        # Try to access from a different user's project (should fail - not found because user doesn't own it)
        response = await client.get(
            f"/api/v1/projects/{other_user_project.id}/proposals/{proposal_id}",
            headers=auth_headers,
        )
        # Should return 404 (project not found for this user)
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestProposalUnauthorized:
    """Test unauthorized access."""
    
    @pytest.mark.asyncio
    async def test_list_proposals_unauthorized(
        self, client: AsyncClient, test_project
    ):
        """Try to list proposals without auth - expect 403."""
        response = await client.get(
            f"/api/v1/projects/{test_project.id}/proposals",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    @pytest.mark.asyncio
    async def test_create_proposal_unauthorized(
        self, client: AsyncClient, test_project
    ):
        """Try to create proposal without auth - expect 403."""
        response = await client.post(
            f"/api/v1/projects/{test_project.id}/proposals",
            json={"title": "Test", "description": "Test", "amount": "100.00"},
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN