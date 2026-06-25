"""
Smoke tests for DBAL daemon - tests basic availability and health.

These tests verify the daemon is running and responding to basic requests.
Run with: pytest tests/integration/test_smoke.py -v
"""

import pytest
import requests
import time


BASE_URL = "http://localhost:8080"
TIMEOUT = 3


@pytest.fixture(scope="module")
def wait_for_daemon():
    """Wait for daemon to be ready."""
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=1)
            if response.status_code == 200:
                print(f"\n✓ Daemon ready")
                return True
        except requests.exceptions.RequestException:
            if attempt < max_attempts - 1:
                time.sleep(0.5)
    pytest.skip("Daemon not available")


def test_health_endpoint(wait_for_daemon):
    """Health endpoint returns healthy status."""
    response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)

    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "dbal"
    assert data["status"] == "healthy"
    print(f"\n✓ Health: {data}")


def test_version_endpoint(wait_for_daemon):
    """Version endpoint returns version info."""
    response = requests.get(f"{BASE_URL}/version", timeout=TIMEOUT)

    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "DBAL Daemon"
    assert data["version"] == "1.0.0"
    print(f"\n✓ Version: {data}")


def test_status_endpoint(wait_for_daemon):
    """Status endpoint returns server status."""
    response = requests.get(f"{BASE_URL}/status", timeout=TIMEOUT)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "address" in data
    print(f"\n✓ Status: {data}")


def test_concurrent_requests(wait_for_daemon):
    """Multiple concurrent health checks succeed."""
    import concurrent.futures

    def check():
        return requests.get(f"{BASE_URL}/health", timeout=TIMEOUT).status_code == 200

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(check) for _ in range(5)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    assert all(results)
    print(f"\n✓ Concurrent: {len(results)} requests successful")


def test_json_content_type(wait_for_daemon):
    """Responses have correct content type."""
    response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)

    content_type = response.headers.get("Content-Type", "")
    assert "application/json" in content_type
    print(f"\n✓ Content-Type: {content_type}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
