"""
Minimal pytest configuration for accounts API tests
Only loads the accounts blueprint, avoiding full app initialization
"""
import pytest
import uuid


# Override root conftest app fixture to prevent DB initialization
@pytest.fixture(scope='session')
def app():
    """Override root conftest to return None so init_db is skipped"""
    return None


@pytest.fixture(scope='function')
def minimal_app():
    """Create a minimal Flask app with only the accounts blueprint"""
    from flask import Flask
    app = Flask(__name__)
    app.config['TESTING'] = True

    # Import and register only the accounts blueprint
    from src.routes.accounts import accounts_bp
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')

    return app


@pytest.fixture(scope='function')
def test_client(minimal_app):
    """Create test client"""
    return minimal_app.test_client()


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
    """Create authentication headers"""
    return {
        'X-Tenant-ID': tenant_id,
        'X-User-ID': user_id,
        'Content-Type': 'application/json'
    }


@pytest.fixture
def sample_account_data():
    """Create sample account data"""
    return {
        'accountName': 'Work Email',
        'emailAddress': 'user@company.com',
        'protocol': 'imap',
        'hostname': 'imap.company.com',
        'port': 993,
        'encryption': 'tls',
        'username': 'user@company.com',
        'credentialId': str(uuid.uuid4()),
        'isSyncEnabled': True,
        'syncInterval': 300
    }
