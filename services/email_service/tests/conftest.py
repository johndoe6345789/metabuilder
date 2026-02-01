"""
Pytest configuration and fixtures for email service tests

Provides:
- Flask test client
- Database fixtures (setup/teardown)
- Mock auth context
- Sample test data
"""
import pytest
import os
import uuid
from datetime import datetime

# Configure test environment
os.environ['FLASK_ENV'] = 'testing'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['REDIS_URL'] = 'redis://localhost:6379/1'


@pytest.fixture(scope='session')
def app():
    """
    Create Flask application for testing

    Uses in-memory SQLite database for fast tests.
    """
    try:
        from app import app as flask_app

        # Configure for testing
        flask_app.config['TESTING'] = True
        flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

        return flask_app
    except ImportError:
        # Return None if Flask app can't be imported (for handler tests)
        return None


@pytest.fixture
def client(app):
    """
    Create Flask test client

    Returns:
        Flask test client for making requests
    """
    if app is None:
        return None
    return app.test_client()


@pytest.fixture(autouse=True)
def init_db(app, request):
    """
    Initialize database tables before each test

    Autouse: Runs before every test automatically
    Skip for auth middleware tests that don't need DB
    """
    if app is None:
        yield
        return

    # Skip for auth middleware tests
    if 'test_auth_middleware' in request.node.nodeid:
        yield
        return

    try:
        with app.app_context():
            from src.db import db
            db.create_all()
            yield
            db.session.remove()
            db.drop_all()
    except ImportError:
        yield


@pytest.fixture
def tenant_id():
    """Generate test tenant ID"""
    return str(uuid.uuid4())


@pytest.fixture
def user_id():
    """Generate test user ID"""
    return str(uuid.uuid4())


@pytest.fixture
def auth_headers(tenant_id, user_id):
    """
    Create authentication headers for requests

    Returns:
        Dict with X-Tenant-ID and X-User-ID headers
    """
    return {
        'X-Tenant-ID': tenant_id,
        'X-User-ID': user_id,
        'Content-Type': 'application/json'
    }


@pytest.fixture
def sample_account_data():
    """
    Create sample email account data

    Returns:
        Dict with valid account creation payload
    """
    return {
        'accountName': 'Work Email',
        'emailAddress': 'user@company.com',
        'protocol': 'imap',
        'hostname': 'imap.company.com',
        'port': 993,
        'encryption': 'tls',
        'username': 'user@company.com',
        'credentialId': str(uuid.uuid4()),
        'password': 'secure_password_123',
        'isSyncEnabled': True,
        'syncInterval': 300
    }


@pytest.fixture
def created_account(client, auth_headers, sample_account_data):
    """
    Create a test email account

    Returns:
        Response with created account data
    """
    if client is None:
        return None
    response = client.post(
        '/api/accounts',
        json=sample_account_data,
        headers=auth_headers
    )
    if response.status_code == 201:
        return response.get_json()
    return None


# ============================================================================
# MOCK FIXTURES
# ============================================================================

@pytest.fixture
def mock_redis(mocker):
    """Mock Redis connection"""
    return mocker.patch('redis.Redis')


@pytest.fixture
def mock_database(mocker):
    """Mock database connection"""
    return mocker.patch('src.db.db')


# ============================================================================
# UTILITY FIXTURES
# ============================================================================

@pytest.fixture
def timestamp_ms():
    """Get current timestamp in milliseconds"""
    return int(datetime.utcnow().timestamp() * 1000)
