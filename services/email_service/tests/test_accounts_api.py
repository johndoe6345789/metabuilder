"""
Test Suite for Email Accounts API - Phase 7
Comprehensive tests for email account management endpoints:
- POST /api/accounts - Create email account
- GET /api/accounts - List accounts
- GET /api/accounts/:id - Get account details
- PUT /api/accounts/:id - Update account settings
- DELETE /api/accounts/:id - Delete account
- POST /api/accounts/:id/test - Test connection

Tests cover:
- Happy path scenarios
- Input validation
- Error handling
- Multi-tenant safety
- Authentication
- Authorization
"""
import pytest
import json
import uuid
from datetime import datetime


class TestCreateAccount:
    """Tests for POST /api/accounts endpoint"""

    def test_create_account_success(self, client, auth_headers, sample_account_data):
        """Test successful account creation"""
        response = client.post(
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
        assert data['hostname'] == 'imap.company.com'
        assert data['port'] == 993
        assert data['encryption'] == 'tls'
        assert data['isSyncEnabled'] is True
        assert data['syncInterval'] == 300
        assert data['isEnabled'] is True
        assert data['createdAt'] is not None
        assert data['updatedAt'] is not None

    def test_create_account_with_defaults(self, client, auth_headers):
        """Test account creation with optional field defaults"""
        data = {
            'accountName': 'Gmail Account',
            'emailAddress': 'user@gmail.com',
            'hostname': 'imap.gmail.com',
            'port': 993,
            'username': 'user@gmail.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 201
        account = response.get_json()
        assert account['protocol'] == 'imap'  # default
        assert account['encryption'] == 'tls'  # default
        assert account['isSyncEnabled'] is True  # default
        assert account['syncInterval'] == 300  # default

    def test_create_account_pop3(self, client, auth_headers):
        """Test account creation with POP3 protocol"""
        data = {
            'accountName': 'POP3 Account',
            'emailAddress': 'user@example.com',
            'protocol': 'pop3',
            'hostname': 'pop.example.com',
            'port': 995,
            'encryption': 'tls',
            'username': 'user@example.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 201
        account = response.get_json()
        assert account['protocol'] == 'pop3'
        assert account['port'] == 995

    def test_create_account_missing_tenant_id(self, client, auth_headers, sample_account_data):
        """Test creation fails without X-Tenant-ID header"""
        headers = {
            'X-User-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }
        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['error'] == 'Unauthorized'

    def test_create_account_missing_user_id(self, client, auth_headers, sample_account_data):
        """Test creation fails without X-User-ID header"""
        headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }
        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['error'] == 'Unauthorized'

    def test_create_account_missing_required_field(self, client, auth_headers):
        """Test creation fails with missing required fields"""
        incomplete_data = {
            'accountName': 'Work Email',
            'emailAddress': 'user@company.com',
            # Missing hostname, port, username, credentialId
        }
        response = client.post(
            '/api/accounts',
            json=incomplete_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['error'] == 'Bad request'
        assert 'Missing required fields' in data['message']

    def test_create_account_invalid_email(self, client, auth_headers):
        """Test creation fails with invalid email address"""
        data = {
            'accountName': 'Work Email',
            'emailAddress': 'not-an-email',
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Invalid email address' in data['message']

    def test_create_account_invalid_port_type(self, client, auth_headers):
        """Test creation fails with non-integer port"""
        data = {
            'accountName': 'Work Email',
            'emailAddress': 'user@company.com',
            'hostname': 'imap.company.com',
            'port': 'not-a-number',
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_create_account_invalid_port_range(self, client, auth_headers):
        """Test creation fails with port out of range"""
        data = {
            'accountName': 'Work Email',
            'emailAddress': 'user@company.com',
            'hostname': 'imap.company.com',
            'port': 99999,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Port must be between' in data['message']

    def test_create_account_invalid_protocol(self, client, auth_headers):
        """Test creation fails with invalid protocol"""
        data = {
            'accountName': 'Work Email',
            'emailAddress': 'user@company.com',
            'protocol': 'smtp',  # Invalid
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Protocol must be' in data['message']

    def test_create_account_invalid_encryption(self, client, auth_headers):
        """Test creation fails with invalid encryption"""
        data = {
            'accountName': 'Work Email',
            'emailAddress': 'user@company.com',
            'encryption': 'ssl3',  # Invalid
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Encryption must be' in data['message']

    def test_create_account_invalid_sync_interval(self, client, auth_headers):
        """Test creation fails with invalid sync interval"""
        data = {
            'accountName': 'Work Email',
            'emailAddress': 'user@company.com',
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4()),
            'syncInterval': 10  # Too low (min is 60)
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Sync interval must be between' in data['message']

    def test_create_account_empty_json(self, client, auth_headers):
        """Test creation fails with empty JSON body"""
        response = client.post(
            '/api/accounts',
            json={},
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Missing required fields' in data['message']


class TestListAccounts:
    """Tests for GET /api/accounts endpoint"""

    def test_list_accounts_empty(self, client, auth_headers):
        """Test listing accounts when none exist"""
        response = client.get(
            '/api/accounts',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accounts'] == []
        assert data['count'] == 0

    def test_list_accounts_single(self, client, auth_headers, created_account):
        """Test listing accounts with one account created"""
        response = client.get(
            '/api/accounts',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['accounts']) == 1
        assert data['count'] == 1
        assert data['accounts'][0]['accountName'] == 'Work Email'

    def test_list_accounts_multiple(self, client, auth_headers, sample_account_data):
        """Test listing multiple accounts"""
        # Create first account
        client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        # Create second account
        data2 = sample_account_data.copy()
        data2['accountName'] = 'Personal Email'
        data2['emailAddress'] = 'personal@example.com'
        data2['hostname'] = 'imap.example.com'
        client.post(
            '/api/accounts',
            json=data2,
            headers=auth_headers
        )

        # List accounts
        response = client.get(
            '/api/accounts',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['accounts']) == 2
        assert data['count'] == 2

    def test_list_accounts_missing_tenant_id(self, client):
        """Test listing fails without tenant_id"""
        headers = {
            'X-User-ID': str(uuid.uuid4())
        }
        response = client.get(
            '/api/accounts',
            headers=headers
        )

        assert response.status_code == 401

    def test_list_accounts_multi_tenant_isolation(self, client, sample_account_data):
        """Test multi-tenant isolation in account listing"""
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

        # Create account for tenant1/user1
        client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers1
        )

        # Create account for tenant2/user2
        client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers2
        )

        # List accounts for tenant1/user1
        response = client.get(
            '/api/accounts',
            headers=headers1
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['accounts']) == 1  # Should only see tenant1's account


class TestGetAccount:
    """Tests for GET /api/accounts/:id endpoint"""

    def test_get_account_success(self, client, auth_headers, created_account):
        """Test successful account retrieval"""
        account_id = created_account['id']
        response = client.get(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['id'] == account_id
        assert data['accountName'] == 'Work Email'

    def test_get_account_not_found(self, client, auth_headers):
        """Test getting non-existent account"""
        fake_id = str(uuid.uuid4())
        response = client.get(
            f'/api/accounts/{fake_id}',
            headers=auth_headers
        )

        assert response.status_code == 404
        data = response.get_json()
        assert data['error'] == 'Not found'

    def test_get_account_wrong_tenant(self, client, created_account, sample_account_data):
        """Test access control for wrong tenant"""
        account_id = created_account['id']
        wrong_tenant = str(uuid.uuid4())
        wrong_user = str(uuid.uuid4())

        headers = {
            'X-Tenant-ID': wrong_tenant,
            'X-User-ID': wrong_user
        }

        response = client.get(
            f'/api/accounts/{account_id}',
            headers=headers
        )

        assert response.status_code == 403
        data = response.get_json()
        assert data['error'] == 'Forbidden'

    def test_get_account_missing_auth(self, client, created_account):
        """Test getting account without auth headers"""
        account_id = created_account['id']
        response = client.get(
            f'/api/accounts/{account_id}'
        )

        assert response.status_code == 401


class TestUpdateAccount:
    """Tests for PUT /api/accounts/:id endpoint"""

    def test_update_account_success(self, client, auth_headers, created_account):
        """Test successful account update"""
        account_id = created_account['id']
        update_data = {
            'accountName': 'Work Email Updated',
            'syncInterval': 600
        }

        response = client.put(
            f'/api/accounts/{account_id}',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accountName'] == 'Work Email Updated'
        assert data['syncInterval'] == 600
        assert data['updatedAt'] > created_account['updatedAt']

    def test_update_account_all_fields(self, client, auth_headers, created_account):
        """Test updating all account fields"""
        account_id = created_account['id']
        update_data = {
            'accountName': 'Updated Account',
            'emailAddress': 'newemail@example.com',
            'hostname': 'newimap.example.com',
            'port': 143,
            'encryption': 'starttls',
            'username': 'newuser@example.com',
            'isSyncEnabled': False,
            'syncInterval': 600,
            'isEnabled': False
        }

        response = client.put(
            f'/api/accounts/{account_id}',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accountName'] == 'Updated Account'
        assert data['emailAddress'] == 'newemail@example.com'
        assert data['port'] == 143
        assert data['encryption'] == 'starttls'
        assert data['isSyncEnabled'] is False
        assert data['isEnabled'] is False

    def test_update_account_partial(self, client, auth_headers, created_account):
        """Test updating only some fields"""
        account_id = created_account['id']
        original_email = created_account['emailAddress']

        update_data = {
            'accountName': 'New Name Only'
        }

        response = client.put(
            f'/api/accounts/{account_id}',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accountName'] == 'New Name Only'
        assert data['emailAddress'] == original_email  # Unchanged

    def test_update_account_not_found(self, client, auth_headers):
        """Test updating non-existent account"""
        fake_id = str(uuid.uuid4())
        response = client.put(
            f'/api/accounts/{fake_id}',
            json={'accountName': 'Updated'},
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_update_account_invalid_email(self, client, auth_headers, created_account):
        """Test update fails with invalid email"""
        account_id = created_account['id']
        response = client.put(
            f'/api/accounts/{account_id}',
            json={'emailAddress': 'not-an-email'},
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_update_account_invalid_port(self, client, auth_headers, created_account):
        """Test update fails with invalid port"""
        account_id = created_account['id']
        response = client.put(
            f'/api/accounts/{account_id}',
            json={'port': 99999},
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_update_account_invalid_sync_interval(self, client, auth_headers, created_account):
        """Test update fails with invalid sync interval"""
        account_id = created_account['id']
        response = client.put(
            f'/api/accounts/{account_id}',
            json={'syncInterval': 30},  # Too low
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_update_account_wrong_tenant(self, client, created_account):
        """Test update fails for wrong tenant"""
        account_id = created_account['id']
        wrong_headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'X-User-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }

        response = client.put(
            f'/api/accounts/{account_id}',
            json={'accountName': 'Hacked'},
            headers=wrong_headers
        )

        assert response.status_code == 403

    def test_update_account_empty_json(self, client, auth_headers, created_account):
        """Test update with empty JSON body"""
        account_id = created_account['id']
        response = client.put(
            f'/api/accounts/{account_id}',
            json={},
            headers=auth_headers
        )

        # Empty update should be allowed (no-op)
        assert response.status_code == 200


class TestDeleteAccount:
    """Tests for DELETE /api/accounts/:id endpoint"""

    def test_delete_account_success(self, client, auth_headers, created_account):
        """Test successful account deletion"""
        account_id = created_account['id']

        response = client.delete(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Account deleted successfully'
        assert data['id'] == account_id

        # Verify account is gone
        get_response = client.get(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )
        assert get_response.status_code == 404

    def test_delete_account_not_found(self, client, auth_headers):
        """Test deleting non-existent account"""
        fake_id = str(uuid.uuid4())
        response = client.delete(
            f'/api/accounts/{fake_id}',
            headers=auth_headers
        )

        assert response.status_code == 404
        data = response.get_json()
        assert data['error'] == 'Not found'

    def test_delete_account_wrong_tenant(self, client, created_account):
        """Test delete fails for wrong tenant"""
        account_id = created_account['id']
        wrong_headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'X-User-ID': str(uuid.uuid4())
        }

        response = client.delete(
            f'/api/accounts/{account_id}',
            headers=wrong_headers
        )

        assert response.status_code == 403
        data = response.get_json()
        assert data['error'] == 'Forbidden'

    def test_delete_account_missing_auth(self, client, created_account):
        """Test delete without auth headers"""
        account_id = created_account['id']
        response = client.delete(
            f'/api/accounts/{account_id}'
        )

        assert response.status_code == 401


class TestTestConnection:
    """Tests for POST /api/accounts/:id/test endpoint"""

    def test_test_connection_missing_password(self, client, auth_headers, created_account):
        """Test connection fails without password"""
        account_id = created_account['id']
        response = client.post(
            f'/api/accounts/{account_id}/test',
            json={},
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'Password required' in data['message']

    def test_test_connection_not_found(self, client, auth_headers):
        """Test connection on non-existent account"""
        fake_id = str(uuid.uuid4())
        response = client.post(
            f'/api/accounts/{fake_id}/test',
            json={'password': 'test123'},
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_test_connection_wrong_tenant(self, client, created_account):
        """Test connection fails for wrong tenant"""
        account_id = created_account['id']
        wrong_headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'X-User-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }

        response = client.post(
            f'/api/accounts/{account_id}/test',
            json={'password': 'test123'},
            headers=wrong_headers
        )

        assert response.status_code == 403

    def test_test_connection_with_timeout(self, client, auth_headers, created_account):
        """Test connection with custom timeout"""
        account_id = created_account['id']
        response = client.post(
            f'/api/accounts/{account_id}/test',
            json={'password': 'test123', 'timeout': 60},
            headers=auth_headers
        )

        # Will fail to connect (no real server) but should accept timeout param
        assert response.status_code in [400, 500]

    def test_test_connection_response_structure(self, client, auth_headers, created_account):
        """Test connection response has correct structure"""
        account_id = created_account['id']
        response = client.post(
            f'/api/accounts/{account_id}/test',
            json={'password': 'test123'},
            headers=auth_headers
        )

        # Will fail to connect but response should have correct structure
        data = response.get_json()
        assert 'success' in data
        assert 'protocol' in data
        assert 'server' in data
        assert 'timestamp' in data
        assert isinstance(data['timestamp'], int)


class TestAuthenticationAndAuthorization:
    """Tests for authentication and authorization across endpoints"""

    def test_all_endpoints_require_auth(self, client, sample_account_data):
        """Verify all endpoints require authentication"""
        # Create account first
        headers = {
            'X-Tenant-ID': str(uuid.uuid4()),
            'X-User-ID': str(uuid.uuid4()),
            'Content-Type': 'application/json'
        }
        create_response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers
        )
        account_id = create_response.get_json()['id']

        # Test each endpoint without auth
        endpoints = [
            ('GET', '/api/accounts'),
            ('POST', '/api/accounts'),
            ('GET', f'/api/accounts/{account_id}'),
            ('PUT', f'/api/accounts/{account_id}'),
            ('DELETE', f'/api/accounts/{account_id}'),
            ('POST', f'/api/accounts/{account_id}/test'),
        ]

        for method, endpoint in endpoints:
            if method == 'GET':
                response = client.get(endpoint)
            elif method == 'POST':
                response = client.post(endpoint, json={})
            elif method == 'PUT':
                response = client.put(endpoint, json={})
            elif method == 'DELETE':
                response = client.delete(endpoint)

            assert response.status_code == 401, f'{method} {endpoint} should require auth'

    def test_tenant_isolation(self, client, sample_account_data):
        """Verify strict tenant isolation"""
        tenant1_id = str(uuid.uuid4())
        tenant2_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())

        headers1 = {
            'X-Tenant-ID': tenant1_id,
            'X-User-ID': user_id,
            'Content-Type': 'application/json'
        }
        headers2 = {
            'X-Tenant-ID': tenant2_id,
            'X-User-ID': user_id,
            'Content-Type': 'application/json'
        }

        # Create account in tenant1
        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=headers1
        )
        account_id = response.get_json()['id']

        # Try to access from tenant2
        get_response = client.get(
            f'/api/accounts/{account_id}',
            headers=headers2
        )
        assert get_response.status_code == 403

        # Try to update from tenant2
        update_response = client.put(
            f'/api/accounts/{account_id}',
            json={'accountName': 'Hacked'},
            headers=headers2
        )
        assert update_response.status_code == 403

        # Try to delete from tenant2
        delete_response = client.delete(
            f'/api/accounts/{account_id}',
            headers=headers2
        )
        assert delete_response.status_code == 403


class TestDataValidation:
    """Tests for data validation across all endpoints"""

    def test_account_id_format(self, client, auth_headers):
        """Test handling of various account ID formats"""
        test_ids = [
            'not-a-uuid',
            '12345',
            'x' * 1000,
            '',
        ]

        for test_id in test_ids:
            response = client.get(
                f'/api/accounts/{test_id}',
                headers=auth_headers
            )
            # Should return 404 for non-existent IDs
            assert response.status_code == 404

    def test_special_characters_in_account_name(self, client, auth_headers):
        """Test account creation with special characters"""
        data = {
            'accountName': 'Email <Work> & "Personal"',
            'emailAddress': 'user@company.com',
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 201
        account = response.get_json()
        assert account['accountName'] == 'Email <Work> & "Personal"'

    def test_unicode_in_account_data(self, client, auth_headers):
        """Test account creation with unicode characters"""
        data = {
            'accountName': '邮件账户 📧',
            'emailAddress': 'user@company.com',
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )

        assert response.status_code == 201
        account = response.get_json()
        assert '邮件账户' in account['accountName']


class TestEdgeCases:
    """Tests for edge cases and boundary conditions"""

    def test_create_account_max_string_length(self, client, auth_headers):
        """Test account creation with very long strings"""
        long_string = 'x' * 1000
        data = {
            'accountName': long_string,
            'emailAddress': f'{long_string}@company.com',
            'hostname': 'imap.company.com',
            'port': 993,
            'username': 'user@company.com',
            'credentialId': str(uuid.uuid4())
        }
        # Should succeed (application should handle long strings)
        response = client.post(
            '/api/accounts',
            json=data,
            headers=auth_headers
        )
        assert response.status_code in [201, 400]

    def test_sync_interval_boundaries(self, client, auth_headers):
        """Test sync interval at boundary values"""
        test_values = [59, 60, 61, 3599, 3600, 3601]
        results = []

        for value in test_values:
            data = {
                'accountName': f'Account {value}',
                'emailAddress': f'user{value}@company.com',
                'hostname': 'imap.company.com',
                'port': 993,
                'username': 'user@company.com',
                'credentialId': str(uuid.uuid4()),
                'syncInterval': value
            }
            response = client.post(
                '/api/accounts',
                json=data,
                headers=auth_headers
            )
            results.append((value, response.status_code))

        # 59 and 3601 should fail, others should succeed
        assert results[0][1] == 400  # 59 - too low
        assert results[1][1] == 201  # 60 - min
        assert results[2][1] == 201  # 61 - ok
        assert results[3][1] == 201  # 3599 - ok
        assert results[4][1] == 201  # 3600 - max
        assert results[5][1] == 400  # 3601 - too high

    def test_port_boundaries(self, client, auth_headers):
        """Test port numbers at boundary values"""
        test_ports = [0, 1, 65535, 65536]
        results = []

        for port in test_ports:
            data = {
                'accountName': f'Account {port}',
                'emailAddress': f'user{port}@company.com',
                'hostname': 'imap.company.com',
                'port': port,
                'username': 'user@company.com',
                'credentialId': str(uuid.uuid4())
            }
            response = client.post(
                '/api/accounts',
                json=data,
                headers=auth_headers
            )
            results.append((port, response.status_code))

        # 0 and 65536 should fail, 1 and 65535 should succeed
        assert results[0][1] == 400  # 0
        assert results[1][1] == 201  # 1
        assert results[2][1] == 201  # 65535
        assert results[3][1] == 400  # 65536
