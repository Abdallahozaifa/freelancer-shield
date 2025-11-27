"""
Tests for health check endpoints.
"""

import pytest
from httpx import AsyncClient


class TestHealthCheck:
    """Tests for GET /api/v1/health"""
    
    async def test_health_check(self, client: AsyncClient):
        """Test health check returns healthy status."""
        response = await client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "app" in data
        assert "version" in data
