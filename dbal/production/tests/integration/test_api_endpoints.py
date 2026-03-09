"""
Integration tests for DBAL daemon API endpoints.

Tests HTTP endpoints using requests library against a running daemon.
Run with: pytest tests/integration/test_api_endpoints.py -v
"""

import pytest
import requests
import time
from typing import Dict, Any


# Test configuration
BASE_URL = "http://localhost:8080"  # DBAL daemon port (mapped in docker-compose.yml)
TIMEOUT = 5  # seconds


@pytest.fixture(scope="module")
def api_client():
    """Wait for daemon to be ready before running tests."""
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=1)
            if response.status_code == 200:
                print(f"\n✓ Daemon ready after {attempt + 1} attempts")
                return BASE_URL
        except requests.exceptions.RequestException:
            if attempt < max_attempts - 1:
                time.sleep(0.5)
            else:
                pytest.skip("Daemon not available - start with docker-compose up")
    return BASE_URL


class TestHealthEndpoints:
    """Test health and status endpoints."""

    def test_health_endpoint_returns_200(self, api_client):
        """Health endpoint should return 200 OK."""
        response = requests.get(f"{api_client}/health", timeout=TIMEOUT)
        assert response.status_code == 200

    def test_health_endpoint_json_format(self, api_client):
        """Health endpoint should return JSON with expected fields."""
        response = requests.get(f"{api_client}/health", timeout=TIMEOUT)
        data = response.json()

        assert "service" in data
        assert "status" in data
        assert data["service"] == "dbal"
        assert data["status"] == "healthy"

    def test_version_endpoint_returns_200(self, api_client):
        """Version endpoint should return 200 OK."""
        response = requests.get(f"{api_client}/version", timeout=TIMEOUT)
        assert response.status_code == 200

    def test_version_endpoint_json_format(self, api_client):
        """Version endpoint should return JSON with version info."""
        response = requests.get(f"{api_client}/version", timeout=TIMEOUT)
        data = response.json()

        assert "service" in data
        assert "version" in data
        assert data["service"] == "DBAL Daemon"
        assert data["version"] == "1.0.0"

    def test_status_endpoint_returns_200(self, api_client):
        """Status endpoint should return 200 OK."""
        response = requests.get(f"{api_client}/status", timeout=TIMEOUT)
        assert response.status_code == 200

    def test_status_endpoint_has_server_info(self, api_client):
        """Status endpoint should return server status information."""
        response = requests.get(f"{api_client}/status", timeout=TIMEOUT)
        data = response.json()

        # Check for expected status fields
        assert "status" in data
        assert data["status"] == "running"
        assert "address" in data


class TestEntityEndpoints:
    """Test DBAL entity CRUD endpoints."""

    def test_list_users_endpoint(self, api_client):
        """List users endpoint should be accessible."""
        response = requests.get(
            f"{api_client}/acme/admin/User",
            timeout=TIMEOUT
        )
        # Should return 200 or 404 (if no users), but not 500
        assert response.status_code in [200, 404]
        print(f"\n✓ List users: {response.status_code}")

    def test_create_user_endpoint(self, api_client):
        """Create user endpoint should accept POST requests."""
        user_data = {
            "username": f"test_user_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "test_password_123"
        }

        response = requests.post(
            f"{api_client}/acme/admin/User",
            json=user_data,
            timeout=TIMEOUT
        )

        # Should return 201 (created), 200 (ok), or 400 (validation error)
        # But not 500 (server error)
        assert response.status_code in [200, 201, 400, 401]
        print(f"\n✓ Create user: {response.status_code}")

    def test_invalid_tenant_returns_error(self, api_client):
        """Invalid tenant should return appropriate error."""
        response = requests.get(
            f"{api_client}/invalid_tenant/admin/User",
            timeout=TIMEOUT
        )
        # Should return 400 or 404, not crash
        assert response.status_code in [400, 404, 401]
        print(f"\n✓ Invalid tenant: {response.status_code}")

    def test_invalid_entity_returns_error(self, api_client):
        """Invalid entity should return appropriate error."""
        response = requests.get(
            f"{api_client}/acme/admin/InvalidEntity",
            timeout=TIMEOUT
        )
        assert response.status_code in [400, 404]
        print(f"\n✓ Invalid entity: {response.status_code}")


class TestConcurrency:
    """Test concurrent request handling."""

    def test_concurrent_health_checks(self, api_client):
        """Multiple concurrent health checks should all succeed."""
        import concurrent.futures

        def check_health():
            response = requests.get(f"{api_client}/health", timeout=TIMEOUT)
            return response.status_code == 200

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(check_health) for _ in range(10)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        # All requests should succeed
        assert all(results)
        assert len(results) == 10
        print(f"\n✓ Concurrent health checks: {len(results)} requests successful")

    def test_concurrent_status_checks(self, api_client):
        """Multiple concurrent status checks should all succeed."""
        import concurrent.futures

        def check_status():
            response = requests.get(f"{api_client}/status", timeout=TIMEOUT)
            return response.status_code == 200

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(check_status) for _ in range(5)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        assert all(results)
        assert len(results) == 5
        print(f"\n✓ Concurrent status checks: {len(results)} requests successful")


class TestErrorHandling:
    """Test error handling and edge cases."""

    def test_404_on_unknown_endpoint(self, api_client):
        """Unknown endpoints should return 404."""
        response = requests.get(
            f"{api_client}/unknown/endpoint/path",
            timeout=TIMEOUT
        )
        assert response.status_code == 404
        print(f"\n✓ 404 handling: unknown endpoint returns {response.status_code}")

    def test_invalid_json_in_post(self, api_client):
        """Invalid JSON should return 400 Bad Request."""
        response = requests.post(
            f"{api_client}/acme/admin/User",
            data="invalid json {{{",
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        # Should return 400 (bad request) or 415 (unsupported media type)
        assert response.status_code in [400, 415]
        print(f"\n✓ Invalid JSON handling: {response.status_code}")

    def test_options_request_handling(self, api_client):
        """OPTIONS requests should be handled (CORS)."""
        response = requests.options(
            f"{api_client}/health",
            timeout=TIMEOUT
        )
        # Should return 200 or 204 (No Content)
        assert response.status_code in [200, 204]
        print(f"\n✓ OPTIONS handling: returns {response.status_code}")


class TestResponseHeaders:
    """Test HTTP response headers."""

    def test_content_type_json(self, api_client):
        """JSON endpoints should return application/json content type."""
        response = requests.get(f"{api_client}/health", timeout=TIMEOUT)
        content_type = response.headers.get("Content-Type", "")
        assert "application/json" in content_type
        print(f"\n✓ Content-Type header: {content_type}")

    def test_response_has_server_header(self, api_client):
        """Responses should include server identification (optional)."""
        response = requests.get(f"{api_client}/health", timeout=TIMEOUT)
        # Just check that we got headers back
        assert len(response.headers) > 0
        print(f"\n✓ Response headers: {len(response.headers)} headers present")


if __name__ == "__main__":
    # Allow running directly with python test_api_endpoints.py
    pytest.main([__file__, "-v", "--tb=short"])
