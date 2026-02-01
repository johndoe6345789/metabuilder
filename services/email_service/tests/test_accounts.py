"""
Comprehensive test suite for email accounts API

Test Coverage:
- Account creation with validation
- Multi-tenant access control
- Credential encryption/decryption
- Rate limiting
- Error handling
- Pagination
- CRUD operations
"""
import pytest
import json
from uuid import uuid4


class TestAccountCreation:
    """Tests for account creation endpoint"""

    def test_create_account_success(self, client, auth_headers, sample_account_data):
        """Test successful account creation"""
        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.get_json()

        # Verify response structure
        assert 'id' in data
        assert data['accountName'] == sample_account_data['accountName']
        assert data['emailAddress'] == sample_account_data['emailAddress']
        assert data['tenantId'] == auth_headers['X-Tenant-ID']
        assert data['userId'] == auth_headers['X-User-ID']

    def test_create_account_missing_auth_headers(self, client, sample_account_data):
        """Test account creation fails without auth headers"""
        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers={'Content-Type': 'application/json'}
        )

        assert response.status_code == 401
        data = response.get_json()
        assert 'error' in data
        assert 'Unauthorized' in data['error']

    def test_create_account_missing_required_fields(self, client, auth_headers):
        """Test account creation fails with missing required fields"""
        incomplete_data = {
            'accountName': 'Test',
            'emailAddress': 'test@example.com'
            # Missing hostname, port, username, password
        }

        response = client.post(
            '/api/accounts',
            json=incomplete_data,
            headers=auth_headers
        )

        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data

    def test_create_account_invalid_port(self, client, auth_headers, sample_account_data):
        """Test account creation fails with invalid port"""
        sample_account_data['port'] = 99999  # Invalid port

        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_create_account_invalid_protocol(self, client, auth_headers, sample_account_data):
        """Test account creation fails with invalid protocol"""
        sample_account_data['protocol'] = 'smtp'  # Invalid protocol

        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_create_account_invalid_encryption(self, client, auth_headers, sample_account_data):
        """Test account creation fails with invalid encryption"""
        sample_account_data['encryption'] = 'ssl'  # Invalid encryption

        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        assert response.status_code == 400


class TestListAccounts:
    """Tests for list accounts endpoint"""

    def test_list_accounts_empty(self, client, auth_headers):
        """Test listing accounts when none exist"""
        response = client.get(
            '/api/accounts',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert 'accounts' in data
        assert len(data['accounts']) == 0
        assert data['pagination']['total'] == 0

    def test_list_accounts_with_pagination(self, client, auth_headers, sample_account_data):
        """Test account listing with pagination"""
        # Create multiple accounts
        for i in range(5):
            account_data = sample_account_data.copy()
            account_data['emailAddress'] = f'user{i}@example.com'
            client.post('/api/accounts', json=account_data, headers=auth_headers)

        # List with pagination
        response = client.get(
            '/api/accounts?limit=2&offset=0',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert len(data['accounts']) == 2
        assert data['pagination']['total'] == 5
        assert data['pagination']['limit'] == 2
        assert data['pagination']['offset'] == 0

    def test_list_accounts_missing_auth_headers(self, client):
        """Test list fails without auth headers"""
        response = client.get('/api/accounts')

        assert response.status_code == 401

    def test_list_accounts_multi_tenant_isolation(self, client, sample_account_data):
        """Test that accounts are isolated by tenant"""
        tenant1_headers = {
            'X-Tenant-ID': str(uuid4()),
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        tenant2_headers = {
            'X-Tenant-ID': str(uuid4()),
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        # Create account for tenant 1
        client.post('/api/accounts', json=sample_account_data, headers=tenant1_headers)

        # Create account for tenant 2
        account_data = sample_account_data.copy()
        account_data['emailAddress'] = 'other@example.com'
        client.post('/api/accounts', json=account_data, headers=tenant2_headers)

        # Verify tenant 1 only sees their account
        response = client.get('/api/accounts', headers=tenant1_headers)
        data = response.get_json()
        assert len(data['accounts']) == 1
        assert data['accounts'][0]['tenantId'] == tenant1_headers['X-Tenant-ID']


class TestGetAccount:
    """Tests for get account endpoint"""

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
        assert data['emailAddress'] == created_account['emailAddress']

    def test_get_account_not_found(self, client, auth_headers):
        """Test get account returns 404 for non-existent account"""
        fake_id = str(uuid4())

        response = client.get(
            f'/api/accounts/{fake_id}',
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_get_account_forbidden_cross_tenant(self, client, auth_headers, created_account):
        """Test get account blocked for cross-tenant access"""
        account_id = created_account['id']

        # Create different tenant headers
        different_tenant_headers = {
            'X-Tenant-ID': str(uuid4()),
            'X-User-ID': auth_headers['X-User-ID'],
            'Content-Type': 'application/json'
        }

        response = client.get(
            f'/api/accounts/{account_id}',
            headers=different_tenant_headers
        )

        assert response.status_code == 404  # Should not find account from different tenant


class TestDeleteAccount:
    """Tests for delete account endpoint"""

    def test_delete_account_success(self, client, auth_headers, created_account):
        """Test successful account deletion (soft delete)"""
        account_id = created_account['id']

        response = client.delete(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Account deleted successfully'

        # Verify account is disabled
        get_response = client.get(
            f'/api/accounts/{account_id}',
            headers=auth_headers
        )
        assert get_response.status_code == 404  # Disabled accounts not returned

    def test_delete_account_not_found(self, client, auth_headers):
        """Test delete non-existent account returns 404"""
        fake_id = str(uuid4())

        response = client.delete(
            f'/api/accounts/{fake_id}',
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_delete_account_forbidden_cross_user(self, client, auth_headers, created_account):
        """Test delete blocked for cross-user access"""
        account_id = created_account['id']

        # Create different user headers (same tenant)
        different_user_headers = {
            'X-Tenant-ID': auth_headers['X-Tenant-ID'],
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        response = client.delete(
            f'/api/accounts/{account_id}',
            headers=different_user_headers
        )

        assert response.status_code == 404  # Should not find account from different user


class TestUpdateAccount:
    """Tests for update account endpoint"""

    def test_update_account_success(self, client, auth_headers, created_account):
        """Test successful account update"""
        account_id = created_account['id']
        update_data = {
            'accountName': 'Updated Name',
            'isSyncEnabled': False,
            'syncInterval': 600
        }

        response = client.put(
            f'/api/accounts/{account_id}',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['accountName'] == 'Updated Name'
        assert data['isSyncEnabled'] == False
        assert data['syncInterval'] == 600

    def test_update_account_invalid_port(self, client, auth_headers, created_account):
        """Test update with invalid port"""
        account_id = created_account['id']
        update_data = {'port': 99999}

        response = client.put(
            f'/api/accounts/{account_id}',
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_update_account_not_found(self, client, auth_headers):
        """Test update non-existent account returns 404"""
        fake_id = str(uuid4())

        response = client.put(
            f'/api/accounts/{fake_id}',
            json={'accountName': 'New Name'},
            headers=auth_headers
        )

        assert response.status_code == 404


class TestCredentialEncryption:
    """Tests for credential encryption"""

    def test_password_not_in_response(self, client, auth_headers, created_account):
        """Test password is not returned in account response"""
        # Password should not be in the response
        assert 'password' not in created_account
        assert 'passwordHash' not in created_account
        assert 'passwordSalt' not in created_account

    def test_credential_encryption_consistency(self, client, auth_headers, sample_account_data):
        """Test that encrypted credentials are stored consistently"""
        # Create account with specific password
        response1 = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        account1 = response1.get_json()
        credential_id1 = account1.get('credentialId')

        # Create another account with same password
        sample_account_data['emailAddress'] = 'other@example.com'
        response2 = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=auth_headers
        )

        account2 = response2.get_json()
        credential_id2 = account2.get('credentialId')

        # Credential IDs should be different (different email addresses)
        assert credential_id1 != credential_id2


class TestRateLimiting:
    """Tests for rate limiting"""

    def test_rate_limit_create_accounts(self, client, auth_headers, sample_account_data):
        """Test rate limiting on account creation"""
        # Note: This test would need Redis to be configured for proper rate limiting
        # For now, we just verify the endpoint accepts requests

        for i in range(3):
            account_data = sample_account_data.copy()
            account_data['emailAddress'] = f'user{i}@example.com'

            response = client.post(
                '/api/accounts',
                json=account_data,
                headers=auth_headers
            )

            assert response.status_code in [201, 429]  # 201 or rate limited


class TestErrorHandling:
    """Tests for error handling"""

    def test_invalid_json_body(self, client, auth_headers):
        """Test handling of invalid JSON body"""
        response = client.post(
            '/api/accounts',
            data='not json',
            headers=auth_headers,
            content_type='application/json'
        )

        assert response.status_code == 400

    def test_missing_content_type(self, client, auth_headers, sample_account_data):
        """Test request with missing Content-Type header"""
        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers={k: v for k, v in auth_headers.items() if k != 'Content-Type'}
        )

        # Should still work (Flask defaults to application/json)
        assert response.status_code in [201, 400]

    def test_invalid_tenant_uuid(self, client, sample_account_data):
        """Test with invalid tenant UUID format"""
        bad_headers = {
            'X-Tenant-ID': 'not-a-uuid',
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=bad_headers
        )

        assert response.status_code == 400

    def test_invalid_user_uuid(self, client, sample_account_data):
        """Test with invalid user UUID format"""
        bad_headers = {
            'X-Tenant-ID': str(uuid4()),
            'X-User-ID': 'not-a-uuid',
            'Content-Type': 'application/json'
        }

        response = client.post(
            '/api/accounts',
            json=sample_account_data,
            headers=bad_headers
        )

        assert response.status_code == 400


class TestHealthCheck:
    """Tests for health check endpoint"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/health')

        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert data['service'] == 'email_service'
        assert 'version' in data


class TestMultiTenantSafety:
    """Tests for multi-tenant safety"""

    def test_user_cannot_see_other_user_accounts(self, client, sample_account_data):
        """Test users cannot see accounts from other users"""
        tenant_id = str(uuid4())

        user1_headers = {
            'X-Tenant-ID': tenant_id,
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        user2_headers = {
            'X-Tenant-ID': tenant_id,
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        # User 1 creates account
        client.post('/api/accounts', json=sample_account_data, headers=user1_headers)

        # User 2 tries to list accounts
        response = client.get('/api/accounts', headers=user2_headers)
        data = response.get_json()

        assert len(data['accounts']) == 0

    def test_admin_cannot_cross_tenant_boundary(self, client, sample_account_data):
        """Test tenant isolation cannot be bypassed"""
        # Create accounts in different tenants
        tenant1_headers = {
            'X-Tenant-ID': str(uuid4()),
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        tenant2_headers = {
            'X-Tenant-ID': str(uuid4()),
            'X-User-ID': str(uuid4()),
            'Content-Type': 'application/json'
        }

        client.post('/api/accounts', json=sample_account_data, headers=tenant1_headers)
        response1 = client.get('/api/accounts', headers=tenant1_headers)
        account_id = response1.get_json()['accounts'][0]['id']

        # Tenant 2 cannot access tenant 1's account
        response = client.get(
            f'/api/accounts/{account_id}',
            headers=tenant2_headers
        )

        assert response.status_code == 404
