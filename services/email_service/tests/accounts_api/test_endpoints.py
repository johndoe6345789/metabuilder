"""
Minimal Test Suite for Email Accounts API - Phase 7
Tests that don't require the full Flask app initialization.

Uses a lightweight Flask app fixture that only loads the accounts blueprint.
"""
import pytest
import json
import uuid
from datetime import datetime


@pytest.fixture(scope='function')
def minimal_app():
    """
    Create a minimal Flask app with only the accounts blueprint
    """
    from flask import Flask

    app = Flask(__name__)
    app.config['TESTING'] = True

    # Import and register only the accounts blueprint
    from src.routes.accounts import accounts_bp
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')

    return app


@pytest.fixture(scope='function')
def test_client(minimal_app):
    """Create test client from minimal app"""
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


# ============================================================================
# TEST: POST /api/accounts - Create Account
# ============================================================================

class TestCreateAccount:
    """Tests for account creation endpoint"""

    def test_create_account_success(self, test_client, auth_headers, sample_account_data):
        """Test successful account creation"""
        response = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['id'] is not None
        assert data['accountName'] == 'Work Email'
        assert data['emailAddress'] == 'user@company.com'
        assert data['protocol'] == 'imap'
        assert data['port'] == 993
        assert data['isEnabled'] is True

    def test_create_with_defaults(self, test_client, auth_headers):
        """Test defaults are applied"""
        data = {
            'accountName': 'Gmail',
            'emailAddress': 'user@gmail.com',
            'hostname': 'imap.gmail.com',
            'port': 993,
            'username': 'user@gmail.com',
            'credentialId': str(uuid.uuid4())
        }
        response = test_client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 201
        account = response.get_json()
        assert account['protocol'] == 'imap'
        assert account['encryption'] == 'tls'
        assert account['isSyncEnabled'] is True
        assert account['syncInterval'] == 300

    def test_missing_required_field(self, test_client, auth_headers):
        """Test validation of required fields"""
        incomplete = {
            'accountName': 'Gmail',
            'emailAddress': 'user@gmail.com'
        }
        response = test_client.post(
            '/api/accounts',
            json=incomplete,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Missing required fields' in data['message']

    def test_invalid_email(self, test_client, auth_headers):
        """Test email validation"""
        data = {
            'accountName': 'Work',
            'emailAddress': 'not-an-email',
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = test_client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        assert 'Invalid email address' in response.get_json()['message']

    def test_invalid_port_range(self, test_client, auth_headers):
        """Test port validation"""
        data = {
            'accountName': 'Work',
            'emailAddress': 'user@company.com',
            'hostname': 'imap.company.com',
            'port': 99999,  # Invalid
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = test_client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        assert 'Port must be between' in response.get_json()['message']

    def test_invalid_protocol(self, test_client, auth_headers):
        """Test protocol validation"""
        data = {
            'accountName': 'Work',
            'emailAddress': 'user@company.com',
            'protocol': 'smtp',  # Invalid
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = test_client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_invalid_encryption(self, test_client, auth_headers):
        """Test encryption validation"""
        data = {
            'accountName': 'Work',
            'emailAddress': 'user@company.com',
            'encryption': 'ssl3',  # Invalid
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = test_client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_invalid_sync_interval(self, test_client, auth_headers):
        """Test sync interval validation"""
        data = {
            'accountName': 'Work',
            'emailAddress': 'user@company.com',
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4()),
            'syncInterval': 10  # Too low (min is 60)
        }
        response = test_client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        assert 'Sync interval must be between' in response.get_json()['message']

    def test_missing_tenant_id(self, test_client, sample_account_data):
        """Test auth requirement: tenant ID"""
        headers = {'X-User-ID': str(uuid.uuid4())}
        response = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers
        )

        assert response.status_code == 401
        assert response.get_json()['error'] == 'Unauthorized'

    def test_missing_user_id(self, test_client, sample_account_data):
        """Test auth requirement: user ID"""
        headers = {'X-Tenant-ID': str(uuid.uuid4())}
        response = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers
        )

        assert response.status_code == 401


# ============================================================================
# TEST: GET /api/accounts - List Accounts
# ============================================================================

class TestListAccounts:
    """Tests for list accounts endpoint"""

    def test_list_empty(self, test_client, auth_headers):
        """Test listing when no accounts exist"""
        response = test_client.get(
            '/api/accounts',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accounts'] == []
        assert data['count'] == 0

    def test_list_single(self, test_client, auth_headers, sample_account_data):
        """Test listing with one account"""
        # Create account
        test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        # List
        response = test_client.get(
            '/api/accounts',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['accounts']) == 1
        assert data['count'] == 1

    def test_list_multiple(self, test_client, auth_headers, sample_account_data):
        """Test listing multiple accounts"""
        # Create 2 accounts
        test_client.post('/api/accounts', json=sample_account_data, headers=auth_headers)

        data2 = sample_account_data.copy()
        data2['accountName'] = 'Personal'
        test_client.post('/api/accounts', json=data2, headers=auth_headers)

        # List
        response = test_client.get('/api/accounts', headers=auth_headers)

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['accounts']) == 2

    def test_multi_tenant_isolation(self, test_client, sample_account_data):
        """Test accounts are isolated by tenant"""
        tenant1 = str(uuid.uuid4())
        tenant2 = str(uuid.uuid4())
        user1 = str(uuid.uuid4())
        user2 = str(uuid.uuid4())

        headers1 = {
            'X-Tenant-ID': tenant1,
            'X-User-ID': user1,
            'Content-Type': 'application/json'
        }
        headers2 = {
            'X-Tenant-ID': tenant2,
            'X-User-ID': user2,
            'Content-Type': 'application/json'
        }

        # Create accounts in both tenants
        test_client.post('/api/accounts', json=sample_account_data, headers=headers1)
        test_client.post('/api/accounts', json=sample_account_data, headers=headers2)

        # Tenant 1 should only see its own
        response = test_client.get('/api/accounts', headers=headers1)
        data = response.get_json()
        assert len(data['accounts']) == 1


# ============================================================================
# TEST: GET /api/accounts/:id - Get Account
# ============================================================================

class TestGetAccount:
    """Tests for get account endpoint"""

    def test_get_success(self, test_client, auth_headers, sample_account_data):
        """Test successful get"""
        # Create
        create_resp = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )
        account_id = create_resp.get_json()['id']

        # Get
        response = test_client.get(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == account_id

    def test_not_found(self, test_client, auth_headers):
        """Test 404 for non-existent account"""
        fake_id = str(uuid.uuid4())
        response = test_client.get(
            f'/api/accounts/{fake_id}',
            headers=auth_headers
        )

        assert response.status_code == 404
        assert response.get_json()['error'] == 'Not found'

    def test_tenant_forbidden(self, test_client, sample_account_data):
        """Test forbidden for wrong tenant"""
        tenant1 = str(uuid.uuid4())
        tenant2 = str(uuid.uuid4())
        user = str(uuid.uuid4())

        headers1 = {'X-Tenant-ID': tenant1, 'X-User-ID': user, 'Content-Type': 'application/json'}
        headers2 = {'X-Tenant-ID': tenant2, 'X-User-ID': user, 'Content-Type': 'application/json'}

        # Create in tenant1
        create_resp = test_client.post('/api/accounts', json=sample_account_data, headers=headers1)
        account_id = create_resp.get_json()['id']

        # Try to get from tenant2
        response = test_client.get(f'/api/accounts/{account_id}', headers=headers2)

        assert response.status_code == 403
        assert response.get_json()['error'] == 'Forbidden'


# ============================================================================
# TEST: PUT /api/accounts/:id - Update Account
# ============================================================================

class TestUpdateAccount:
    """Tests for update account endpoint"""

    def test_update_success(self, test_client, auth_headers, sample_account_data):
        """Test successful update"""
        # Create
        create_resp = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )
        account_id = create_resp.get_json()['id']

        # Update
        response = test_client.put(
            f'/api/accounts/{account_id}',
            json={'accountName': 'Updated Name'},
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accountName'] == 'Updated Name'

    def test_update_all_fields(self, test_client, auth_headers, sample_account_data):
        """Test updating all fields"""
        create_resp = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )
        account_id = create_resp.get_json()['id']

        update_data = {
            'accountName': 'New Name',
            'emailAddress': 'newemail@example.com',
            'hostname': 'newimap.example.com',
            'port': 143,
            'encryption': 'starttls',
            'isSyncEnabled': False,
            'syncInterval': 600,
            'isEnabled': False
        }

        response = test_client.put(
            f'/api/accounts/{account_id}',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accountName'] == 'New Name'
        assert data['port'] == 143
        assert data['encryption'] == 'starttls'
        assert data['isSyncEnabled'] is False

    def test_update_not_found(self, test_client, auth_headers):
        """Test 404 for non-existent account"""
        fake_id = str(uuid.uuid4())
        response = test_client.put(
            f'/api/accounts/{fake_id}',
            json={'accountName': 'Updated'},
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_update_forbidden(self, test_client, sample_account_data):
        """Test forbidden for wrong tenant"""
        tenant1 = str(uuid.uuid4())
        tenant2 = str(uuid.uuid4())
        user = str(uuid.uuid4())

        headers1 = {'X-Tenant-ID': tenant1, 'X-User-ID': user, 'Content-Type': 'application/json'}
        headers2 = {'X-Tenant-ID': tenant2, 'X-User-ID': user, 'Content-Type': 'application/json'}

        create_resp = test_client.post('/api/accounts', json=sample_account_data, headers=headers1)
        account_id = create_resp.get_json()['id']

        response = test_client.put(
            f'/api/accounts/{account_id}',
            json={'accountName': 'Hacked'},
            headers=headers2
        )

        assert response.status_code == 403

    def test_update_invalid_port(self, test_client, auth_headers, sample_account_data):
        """Test port validation on update"""
        create_resp = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )
        account_id = create_resp.get_json()['id']

        response = test_client.put(
            f'/api/accounts/{account_id}',
            json={'port': 99999},
            headers=auth_headers
        )

        assert response.status_code == 400


# ============================================================================
# TEST: DELETE /api/accounts/:id - Delete Account
# ============================================================================

class TestDeleteAccount:
    """Tests for delete account endpoint"""

    def test_delete_success(self, test_client, auth_headers, sample_account_data):
        """Test successful deletion"""
        # Create
        create_resp = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )
        account_id = create_resp.get_json()['id']

        # Delete
        response = test_client.delete(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.get_json()['message'] == 'Account deleted successfully'

        # Verify gone
        get_resp = test_client.get(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )
        assert get_resp.status_code == 404

    def test_delete_not_found(self, test_client, auth_headers):
        """Test 404 for non-existent account"""
        response = test_client.delete(
            f'/api/accounts/{str(uuid.uuid4())}',
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_delete_forbidden(self, test_client, sample_account_data):
        """Test forbidden for wrong tenant"""
        tenant1 = str(uuid.uuid4())
        tenant2 = str(uuid.uuid4())
        user = str(uuid.uuid4())

        headers1 = {'X-Tenant-ID': tenant1, 'X-User-ID': user, 'Content-Type': 'application/json'}
        headers2 = {'X-Tenant-ID': tenant2, 'X-User-ID': user, 'Content-Type': 'application/json'}

        create_resp = test_client.post('/api/accounts', json=sample_account_data, headers=headers1)
        account_id = create_resp.get_json()['id']

        response = test_client.delete(
            f'/api/accounts/{account_id}',
            headers=headers2
        )

        assert response.status_code == 403


# ============================================================================
# TEST: POST /api/accounts/:id/test - Test Connection
# ============================================================================

class TestConnectionTest:
    """Tests for connection test endpoint"""

    def test_missing_password(self, test_client, auth_headers, sample_account_data):
        """Test password is required"""
        create_resp = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )
        account_id = create_resp.get_json()['id']

        response = test_client.post(
            f'/api/accounts/{account_id}/test',
            json={},
            headers=auth_headers
        )

        assert response.status_code == 400
        assert 'Password required' in response.get_json()['message']

    def test_account_not_found(self, test_client, auth_headers):
        """Test 404 for non-existent account"""
        response = test_client.post(
            f'/api/accounts/{str(uuid.uuid4())}/test',
            json={'password': 'test123'},
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_forbidden_wrong_tenant(self, test_client, sample_account_data):
        """Test forbidden for wrong tenant"""
        tenant1 = str(uuid.uuid4())
        tenant2 = str(uuid.uuid4())
        user = str(uuid.uuid4())

        headers1 = {'X-Tenant-ID': tenant1, 'X-User-ID': user, 'Content-Type': 'application/json'}
        headers2 = {'X-Tenant-ID': tenant2, 'X-User-ID': user, 'Content-Type': 'application/json'}

        create_resp = test_client.post('/api/accounts', json=sample_account_data, headers=headers1)
        account_id = create_resp.get_json()['id']

        response = test_client.post(
            f'/api/accounts/{account_id}/test',
            json={'password': 'test123'},
            headers=headers2
        )

        assert response.status_code == 403


# ============================================================================
# TEST: Authentication & Authorization
# ============================================================================

class TestAuthenticationAndAuthorization:
    """Tests for auth requirements across all endpoints"""

    def test_all_endpoints_require_auth(self, test_client, sample_account_data):
        """Verify all endpoints require authentication"""
        # Create account first
        headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'X-User-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }
        create_resp = test_client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers
        )
        account_id = create_resp.get_json()['id']

        # Test endpoints without auth
        assert test_client.get('/api/accounts').status_code == 401
        assert test_client.post('/api/accounts', json={}).status_code == 401
        assert test_client.get(f'/api/accounts/{account_id}').status_code == 401
        assert test_client.put(f'/api/accounts/{account_id}', json={}).status_code == 401
        assert test_client.delete(f'/api/accounts/{account_id}').status_code == 401
        assert test_client.post(f'/api/accounts/{account_id}/test', json={}).status_code == 401
