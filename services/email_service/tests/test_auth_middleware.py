"""
Phase 7: Authentication Middleware Tests
Comprehensive test coverage for JWT, multi-tenant isolation, RBAC, and logging
"""
import pytest
from flask import Flask, request
from datetime import datetime, timedelta
import jwt
import json
import logging
import sys
import os
from unittest.mock import patch, MagicMock

# Add service root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.middleware.auth import (
    AuthError,
    UserRole,
    JWTConfig,
    create_jwt_token,
    decode_jwt_token,
    extract_bearer_token,
    extract_tenant_context,
    verify_tenant_context,
    verify_role,
    get_tenant_context,
    get_user_role,
    verify_resource_access,
    log_request_context,
    is_valid_uuid,
)


# Test fixtures
@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    return app


@pytest.fixture
def client(app):
    """Create Flask test client"""
    return app.test_client()


@pytest.fixture
def app_context(app):
    """Create Flask app context"""
    with app.app_context():
        yield app


@pytest.fixture
def valid_tenant_id():
    """Valid test tenant UUID"""
    return "550e8400-e29b-41d4-a716-446655440000"


@pytest.fixture
def valid_user_id():
    """Valid test user UUID"""
    return "550e8400-e29b-41d4-a716-446655440001"


@pytest.fixture
def valid_token(valid_tenant_id, valid_user_id):
    """Valid JWT token"""
    return create_jwt_token(valid_tenant_id, valid_user_id, role="user")


@pytest.fixture
def admin_token(valid_tenant_id):
    """Admin JWT token"""
    admin_id = "550e8400-e29b-41d4-a716-446655440002"
    return create_jwt_token(valid_tenant_id, admin_id, role="admin")


# Tests: UUID Validation
class TestUUIDValidation:
    """Test UUID validation utility"""

    def test_valid_uuid(self):
        """Test valid UUID format"""
        assert is_valid_uuid("550e8400-e29b-41d4-a716-446655440000") is True

    def test_invalid_uuid_format(self):
        """Test invalid UUID format"""
        assert is_valid_uuid("invalid-uuid") is False

    def test_empty_uuid(self):
        """Test empty UUID"""
        assert is_valid_uuid("") is False

    def test_none_uuid(self):
        """Test None UUID"""
        assert is_valid_uuid(None) is False

    def test_short_uuid(self):
        """Test too-short UUID"""
        assert is_valid_uuid("550e8400") is False


# Tests: JWT Token Creation and Decoding
class TestJWTTokens:
    """Test JWT token creation and decoding"""

    def test_create_jwt_token_success(self, valid_tenant_id, valid_user_id):
        """Test successful token creation"""
        token = create_jwt_token(valid_tenant_id, valid_user_id, role="user")
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_jwt_token_with_admin_role(self, valid_tenant_id, valid_user_id):
        """Test token creation with admin role"""
        token = create_jwt_token(valid_tenant_id, valid_user_id, role="admin")
        payload = decode_jwt_token(token)
        assert payload['role'] == 'admin'

    def test_create_jwt_token_invalid_tenant_id(self, valid_user_id):
        """Test token creation with invalid tenant ID"""
        with pytest.raises(ValueError):
            create_jwt_token("invalid-id", valid_user_id)

    def test_create_jwt_token_invalid_user_id(self, valid_tenant_id):
        """Test token creation with invalid user ID"""
        with pytest.raises(ValueError):
            create_jwt_token(valid_tenant_id, "invalid-id")

    def test_create_jwt_token_invalid_role(self, valid_tenant_id, valid_user_id):
        """Test token creation with invalid role"""
        with pytest.raises(ValueError):
            create_jwt_token(valid_tenant_id, valid_user_id, role="invalid_role")

    def test_decode_jwt_token_success(self, valid_token):
        """Test successful token decoding"""
        payload = decode_jwt_token(valid_token)
        assert 'tenant_id' in payload
        assert 'user_id' in payload
        assert 'role' in payload
        assert payload['role'] == 'user'

    def test_decode_jwt_token_expired(self, valid_tenant_id, valid_user_id):
        """Test decoding expired token"""
        # Create token with -1 hours (expired)
        expired_token = create_jwt_token(
            valid_tenant_id, valid_user_id,
            expires_in_hours=-1
        )
        with pytest.raises(AuthError) as exc_info:
            decode_jwt_token(expired_token)
        assert exc_info.value.status_code == 401

    def test_decode_jwt_token_invalid_signature(self):
        """Test decoding token with invalid signature"""
        # Create token with different secret
        payload = {
            'tenant_id': "550e8400-e29b-41d4-a716-446655440000",
            'user_id': "550e8400-e29b-41d4-a716-446655440001",
            'role': 'user',
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, 'wrong-secret', algorithm='HS256')

        with pytest.raises(AuthError) as exc_info:
            decode_jwt_token(token)
        assert exc_info.value.status_code == 401

    def test_decode_jwt_token_malformed(self):
        """Test decoding malformed token"""
        with pytest.raises(AuthError) as exc_info:
            decode_jwt_token("not.a.token")
        assert exc_info.value.status_code == 401


# Tests: Bearer Token Extraction
class TestBearerTokenExtraction:
    """Test Bearer token extraction from headers"""

    def test_extract_bearer_token_success(self, app_context, valid_token):
        """Test successful Bearer token extraction"""
        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            token = extract_bearer_token()
            assert token == valid_token

    def test_extract_bearer_token_missing(self, app_context):
        """Test Bearer token extraction when missing"""
        with app_context.test_request_context():
            token = extract_bearer_token()
            assert token is None

    def test_extract_bearer_token_invalid_format(self, app_context):
        """Test Bearer token with invalid format"""
        with app_context.test_request_context(
            headers={'Authorization': 'Basic dXNlcjpwYXNz'}
        ):
            token = extract_bearer_token()
            assert token is None

    def test_extract_bearer_token_malformed(self, app_context):
        """Test Bearer token with only 'Bearer' prefix"""
        with app_context.test_request_context(
            headers={'Authorization': 'Bearer'}
        ):
            token = extract_bearer_token()
            assert token is None


# Tests: Tenant Context Extraction
class TestTenantContextExtraction:
    """Test extracting tenant and user context"""

    def test_extract_tenant_context_from_jwt(self, app_context, valid_token,
                                              valid_tenant_id, valid_user_id):
        """Test extracting context from JWT token"""
        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            tenant_id, user_id, role = extract_tenant_context()
            assert tenant_id == valid_tenant_id
            assert user_id == valid_user_id
            assert role == 'user'

    def test_extract_tenant_context_from_headers(self, app_context,
                                                   valid_tenant_id, valid_user_id):
        """Test extracting context from headers"""
        with app_context.test_request_context(
            headers={
                'X-Tenant-ID': valid_tenant_id,
                'X-User-ID': valid_user_id,
                'X-User-Role': 'admin'
            }
        ):
            tenant_id, user_id, role = extract_tenant_context()
            assert tenant_id == valid_tenant_id
            assert user_id == valid_user_id
            assert role == 'admin'

    def test_extract_tenant_context_from_query_params(self, app_context,
                                                        valid_tenant_id, valid_user_id):
        """Test extracting context from query parameters"""
        with app_context.test_request_context(
            f'/?tenant_id={valid_tenant_id}&user_id={valid_user_id}'
        ):
            tenant_id, user_id, role = extract_tenant_context()
            assert tenant_id == valid_tenant_id
            assert user_id == valid_user_id

    def test_extract_tenant_context_missing(self, app_context):
        """Test extracting context when missing"""
        with app_context.test_request_context():
            tenant_id, user_id, role = extract_tenant_context()
            assert tenant_id is None
            assert user_id is None

    def test_extract_tenant_context_default_role(self, app_context,
                                                   valid_tenant_id, valid_user_id):
        """Test default role when not specified"""
        with app_context.test_request_context(
            headers={
                'X-Tenant-ID': valid_tenant_id,
                'X-User-ID': valid_user_id
            }
        ):
            tenant_id, user_id, role = extract_tenant_context()
            assert role == 'user'  # Default role


# Tests: verify_tenant_context Decorator
class TestVerifyTenantContextDecorator:
    """Test verify_tenant_context decorator"""

    def test_verify_tenant_context_success(self, app_context, valid_token,
                                            valid_tenant_id, valid_user_id):
        """Test successful tenant context verification"""
        @verify_tenant_context
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200
            assert request.tenant_id == valid_tenant_id
            assert request.user_id == valid_user_id

    def test_verify_tenant_context_missing_headers(self, app_context):
        """Test verification fails when headers missing"""
        @verify_tenant_context
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context():
            response, status = test_route()
            assert status == 401
            assert 'Unauthorized' in response['error']

    def test_verify_tenant_context_invalid_uuid(self, app_context):
        """Test verification fails with invalid UUID"""
        @verify_tenant_context
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={
                'X-Tenant-ID': 'invalid',
                'X-User-ID': '550e8400-e29b-41d4-a716-446655440001'
            }
        ):
            response, status = test_route()
            assert status == 400
            assert 'must be valid UUID' in response['message']

    def test_verify_tenant_context_invalid_role(self, app_context,
                                                  valid_tenant_id, valid_user_id):
        """Test verification fails with invalid role"""
        @verify_tenant_context
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={
                'X-Tenant-ID': valid_tenant_id,
                'X-User-ID': valid_user_id,
                'X-User-Role': 'invalid_role'
            }
        ):
            response, status = test_route()
            assert status == 400
            assert 'Role must be one of' in response['message']

    def test_verify_tenant_context_sets_request_attributes(self, app_context, valid_token,
                                                             valid_tenant_id):
        """Test decorator sets request attributes"""
        @verify_tenant_context
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            test_route()
            assert hasattr(request, 'tenant_id')
            assert hasattr(request, 'user_id')
            assert hasattr(request, 'user_role')


# Tests: verify_role Decorator
class TestVerifyRoleDecorator:
    """Test verify_role decorator"""

    def test_verify_role_user_success(self, app_context, valid_token,
                                       valid_tenant_id, valid_user_id):
        """Test user role verification succeeds"""
        @verify_tenant_context
        @verify_role('user')
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200

    def test_verify_role_admin_success(self, app_context, admin_token):
        """Test admin role verification succeeds"""
        @verify_tenant_context
        @verify_role('admin')
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {admin_token}'}
        ):
            response, status = test_route()
            assert status == 200

    def test_verify_role_insufficient_permissions(self, app_context, valid_token):
        """Test verification fails with insufficient permissions"""
        @verify_tenant_context
        @verify_role('admin')  # Requires admin but token is user
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 403
            assert 'Forbidden' in response['error']

    def test_verify_role_multiple_allowed(self, app_context, valid_token):
        """Test verification with multiple allowed roles"""
        @verify_tenant_context
        @verify_role('user', 'admin')  # User or admin allowed
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200

    def test_verify_role_no_tenant_context(self, app_context):
        """Test role verification fails without tenant context"""
        @verify_role('user')
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context():
            response, status = test_route()
            assert status == 403


# Tests: get_tenant_context and get_user_role
class TestContextGetters:
    """Test context getter functions"""

    def test_get_tenant_context_success(self, app_context, valid_token):
        """Test successfully getting tenant context"""
        @verify_tenant_context
        def test_route():
            tenant_id, user_id = get_tenant_context()
            return {'tenant_id': tenant_id, 'user_id': user_id}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200
            assert 'tenant_id' in response

    def test_get_tenant_context_not_initialized(self, app_context):
        """Test getting context before initialization raises error"""
        with app_context.test_request_context():
            with pytest.raises(AuthError):
                get_tenant_context()

    def test_get_user_role_success(self, app_context, valid_token):
        """Test successfully getting user role"""
        @verify_tenant_context
        def test_route():
            role = get_user_role()
            return {'role': role}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200
            assert response['role'] == 'user'

    def test_get_user_role_admin(self, app_context, admin_token):
        """Test getting admin role"""
        @verify_tenant_context
        def test_route():
            role = get_user_role()
            return {'role': role}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {admin_token}'}
        ):
            response, status = test_route()
            assert status == 200
            assert response['role'] == 'admin'


# Tests: Resource Access Control
class TestVerifyResourceAccess:
    """Test row-level resource access control"""

    def test_verify_resource_access_user_own_resource(self, app_context, valid_token,
                                                       valid_tenant_id, valid_user_id):
        """Test user can access their own resource"""
        @verify_tenant_context
        def test_route():
            assert verify_resource_access(valid_tenant_id, valid_user_id) is True
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200

    def test_verify_resource_access_user_cross_user(self, app_context, valid_token,
                                                     valid_tenant_id):
        """Test user cannot access another user's resource"""
        other_user_id = "550e8400-e29b-41d4-a716-446655440099"

        @verify_tenant_context
        def test_route():
            with pytest.raises(AuthError) as exc_info:
                verify_resource_access(valid_tenant_id, other_user_id)
            assert exc_info.value.status_code == 403
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200

    def test_verify_resource_access_cross_tenant(self, app_context, valid_token):
        """Test cross-tenant access is prevented"""
        other_tenant_id = "550e8400-e29b-41d4-a716-446655440099"
        other_user_id = "550e8400-e29b-41d4-a716-446655440098"

        @verify_tenant_context
        def test_route():
            with pytest.raises(AuthError) as exc_info:
                verify_resource_access(other_tenant_id, other_user_id)
            assert exc_info.value.status_code == 403
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = test_route()
            assert status == 200

    def test_verify_resource_access_admin_any_resource(self, app_context, admin_token,
                                                        valid_tenant_id):
        """Test admin can access any resource in their tenant"""
        other_user_id = "550e8400-e29b-41d4-a716-446655440099"

        @verify_tenant_context
        def test_route():
            assert verify_resource_access(valid_tenant_id, other_user_id) is True
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {admin_token}'}
        ):
            response, status = test_route()
            assert status == 200

    def test_verify_resource_access_admin_cross_tenant_blocked(self, app_context, admin_token):
        """Test admin cannot cross tenant boundaries"""
        other_tenant_id = "550e8400-e29b-41d4-a716-446655440099"
        other_user_id = "550e8400-e29b-41d4-a716-446655440098"

        @verify_tenant_context
        def test_route():
            with pytest.raises(AuthError) as exc_info:
                verify_resource_access(other_tenant_id, other_user_id)
            assert exc_info.value.status_code == 403
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {admin_token}'}
        ):
            response, status = test_route()
            assert status == 200


# Tests: Request Logging
class TestRequestLogging:
    """Test request context logging"""

    @patch('src.middleware.auth.logger')
    def test_log_request_context_success(self, mock_logger, app_context,
                                          valid_tenant_id, valid_user_id):
        """Test successful request logging"""
        with app_context.test_request_context(
            '/api/accounts',
            method='GET',
            headers={
                'X-Tenant-ID': valid_tenant_id,
                'X-User-ID': valid_user_id,
                'User-Agent': 'Test Client'
            }
        ):
            log_request_context(request, valid_user_id, valid_tenant_id, 'user')
            mock_logger.info.assert_called()

    @patch('src.middleware.auth.logger')
    def test_log_request_context_full_info(self, mock_logger, app_context,
                                            valid_tenant_id, valid_user_id):
        """Test logging captures all request info"""
        with app_context.test_request_context(
            '/api/accounts',
            method='POST',
            headers={'User-Agent': 'Mozilla/5.0'}
        ):
            log_request_context(request, valid_user_id, valid_tenant_id, 'admin')

            # Verify logger was called with expected content
            call_args = mock_logger.info.call_args[0][0]
            assert valid_user_id in call_args
            assert valid_tenant_id in call_args
            assert 'POST' in call_args
            assert 'admin' in call_args

    @patch('src.middleware.auth.logger')
    def test_log_request_context_with_decorator(self, mock_logger, app_context, valid_token):
        """Test logging is called by verify_tenant_context decorator"""
        @verify_tenant_context
        def test_route():
            return {'status': 'ok'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            test_route()
            # Verify logger was called (called by decorator)
            assert mock_logger.info.called


# Tests: Error Handling
class TestErrorHandling:
    """Test error handling and responses"""

    def test_auth_error_exception(self):
        """Test AuthError exception creation"""
        error = AuthError("Test error", 403)
        assert error.message == "Test error"
        assert error.status_code == 403

    def test_auth_error_default_status(self):
        """Test AuthError default status code"""
        error = AuthError("Test error")
        assert error.status_code == 401

    def test_verify_tenant_context_exception_handling(self, app_context):
        """Test exception handling in decorator"""
        @verify_tenant_context
        def test_route():
            raise Exception("Unexpected error")

        with app_context.test_request_context(
            headers={
                'X-Tenant-ID': '550e8400-e29b-41d4-a716-446655440000',
                'X-User-ID': '550e8400-e29b-41d4-a716-446655440001'
            }
        ):
            response, status = test_route()
            assert status == 500
            assert 'Internal server error' in response['error']


# Integration Tests
class TestIntegrationScenarios:
    """Integration tests for complete auth workflows"""

    def test_full_auth_flow_user(self, app_context, valid_tenant_id, valid_user_id):
        """Test complete authentication flow for regular user"""
        token = create_jwt_token(valid_tenant_id, valid_user_id, role="user")

        @verify_tenant_context
        def list_accounts():
            tenant_id, user_id = get_tenant_context()
            role = get_user_role()
            return {
                'tenant_id': tenant_id,
                'user_id': user_id,
                'role': role
            }, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {token}'}
        ):
            response, status = list_accounts()
            assert status == 200
            assert response['role'] == 'user'

    def test_full_auth_flow_admin_with_role_check(self, app_context, valid_tenant_id):
        """Test complete authentication flow for admin with role check"""
        admin_id = "550e8400-e29b-41d4-a716-446655440002"
        token = create_jwt_token(valid_tenant_id, admin_id, role="admin")

        @verify_tenant_context
        @verify_role('admin')
        def admin_endpoint():
            return {'status': 'admin_only'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {token}'}
        ):
            response, status = admin_endpoint()
            assert status == 200

    def test_full_auth_flow_user_denied_admin(self, app_context, valid_token):
        """Test user is denied access to admin-only endpoint"""
        @verify_tenant_context
        @verify_role('admin')
        def admin_endpoint():
            return {'status': 'admin_only'}, 200

        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {valid_token}'}
        ):
            response, status = admin_endpoint()
            assert status == 403

    def test_multi_tenant_isolation_different_tenants(self, app_context):
        """Test multi-tenant isolation between different tenants"""
        tenant1_id = "550e8400-e29b-41d4-a716-446655440001"
        tenant2_id = "550e8400-e29b-41d4-a716-446655440002"
        user1_id = "550e8400-e29b-41d4-a716-446655440011"
        user2_id = "550e8400-e29b-41d4-a716-446655440012"

        # Create tokens for both users
        token1 = create_jwt_token(tenant1_id, user1_id)
        token2 = create_jwt_token(tenant2_id, user2_id)

        @verify_tenant_context
        def test_route():
            tenant_id, user_id = get_tenant_context()
            return {'tenant_id': tenant_id}, 200

        # First user's request
        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {token1}'}
        ):
            response1, _ = test_route()

        # Second user's request
        with app_context.test_request_context(
            headers={'Authorization': f'Bearer {token2}'}
        ):
            response2, _ = test_route()

        # Verify tenant isolation
        assert response1['tenant_id'] == tenant1_id
        assert response2['tenant_id'] == tenant2_id
        assert response1['tenant_id'] != response2['tenant_id']


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
