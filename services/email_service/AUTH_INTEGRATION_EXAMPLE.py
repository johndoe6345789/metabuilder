"""
Phase 7: Authentication Middleware Integration Example
Shows how to integrate JWT auth middleware into Flask email service routes
"""
from flask import Blueprint, request, jsonify
from src.middleware.auth import (
    verify_tenant_context,
    verify_role,
    get_tenant_context,
    get_user_role,
    verify_resource_access,
    create_jwt_token,
    AuthError
)
import logging

logger = logging.getLogger(__name__)

# Create blueprint for authentication-protected routes
auth_routes = Blueprint('auth_routes', __name__, url_prefix='/api/v1')


# ============================================================================
# EXAMPLE 1: Basic Authentication with Multi-Tenant Isolation
# ============================================================================

@auth_routes.route('/accounts', methods=['GET'])
@verify_tenant_context
def list_accounts():
    """
    List email accounts for current user/tenant

    Features:
    - JWT token or header authentication
    - Multi-tenant isolation enforced
    - User only sees their own accounts
    - Automatic request logging with user context

    Query Params (optional for pagination):
    - limit: Number of results (default 20)
    - offset: Skip N results (default 0)

    Response:
        {
            "accounts": [
                {
                    "id": "uuid",
                    "email": "user@example.com",
                    "account_type": "imap",
                    "is_sync_enabled": true,
                    "created_at": "2026-01-24T10:30:00Z"
                }
            ],
            "total": 3,
            "limit": 20,
            "offset": 0
        }
    """
    try:
        # Extract tenant/user from authentication middleware
        tenant_id, user_id = get_tenant_context()

        # Example: Query accounts filtered by tenant_id AND user_id
        # accounts = db.query(EmailAccount).filter(
        #     EmailAccount.tenant_id == tenant_id,
        #     EmailAccount.user_id == user_id
        # ).all()

        # Mock response for demonstration
        accounts = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440010",
                "email": "john@example.com",
                "account_type": "imap",
                "is_sync_enabled": True,
                "created_at": "2026-01-20T10:30:00Z"
            }
        ]

        return jsonify({
            'accounts': accounts,
            'total': len(accounts),
            'limit': 20,
            'offset': 0
        }), 200

    except Exception as e:
        logger.error(f'Error listing accounts: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500


@auth_routes.route('/accounts', methods=['POST'])
@verify_tenant_context
def create_account():
    """
    Create new email account

    Features:
    - Validates request body
    - Enforces multi-tenant isolation
    - Associates account with current user/tenant
    - Returns created account with ID

    Request Body:
        {
            "email": "user@example.com",
            "account_type": "imap",
            "hostname": "imap.example.com",
            "port": 993,
            "encryption": "tls",
            "username": "user@example.com",
            "password": "secure_password"
        }

    Response (201 Created):
        {
            "id": "550e8400-e29b-41d4-a716-446655440010",
            "email": "user@example.com",
            "account_type": "imap",
            "created_at": "2026-01-24T10:30:00Z"
        }
    """
    try:
        # Get authenticated user/tenant context
        tenant_id, user_id = get_tenant_context()

        # Validate request body
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request', 'message': 'Missing request body'}), 400

        required_fields = ['email', 'account_type', 'hostname', 'port', 'encryption']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({
                'error': 'Invalid request',
                'message': f'Missing required fields: {", ".join(missing)}'
            }), 400

        # Example: Create account in database
        # account = EmailAccount(
        #     tenant_id=tenant_id,  # CRITICAL: Always set tenant_id
        #     user_id=user_id,      # CRITICAL: Always set user_id
        #     email=data['email'],
        #     account_type=data['account_type'],
        #     hostname=data['hostname'],
        #     port=data['port'],
        #     encryption=data['encryption'],
        #     username=data.get('username', data['email'])
        # )
        # db.session.add(account)
        # db.session.commit()

        # Mock response for demonstration
        account = {
            'id': '550e8400-e29b-41d4-a716-446655440010',
            'email': data['email'],
            'account_type': data['account_type'],
            'created_at': '2026-01-24T10:30:00Z'
        }

        logger.info(f'Account created for user {user_id} in tenant {tenant_id}')
        return jsonify(account), 201

    except Exception as e:
        logger.error(f'Error creating account: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# EXAMPLE 2: Row-Level Access Control (RLS)
# ============================================================================

@auth_routes.route('/accounts/<account_id>', methods=['GET'])
@verify_tenant_context
def get_account(account_id):
    """
    Get specific email account with row-level access control

    Features:
    - Verifies user can access this specific account
    - Prevents cross-user/cross-tenant access
    - Returns 403 Forbidden if access denied

    Path Parameters:
    - account_id: Account UUID

    Response:
        {
            "id": "550e8400-e29b-41d4-a716-446655440010",
            "email": "user@example.com",
            "account_type": "imap",
            "is_sync_enabled": true
        }
    """
    try:
        # Get authenticated context
        tenant_id, user_id = get_tenant_context()

        # Example: Query from database
        # account = db.query(EmailAccount).filter(
        #     EmailAccount.id == account_id,
        #     EmailAccount.tenant_id == tenant_id
        # ).first()

        # Mock data for demonstration
        if account_id == '550e8400-e29b-41d4-a716-446655440010':
            account = {
                'id': account_id,
                'email': 'john@example.com',
                'account_type': 'imap',
                'is_sync_enabled': True,
                'tenant_id': tenant_id,
                'user_id': user_id
            }
        else:
            return jsonify({'error': 'Not found'}), 404

        # Verify user can access this resource
        # If user tries to access another user's resource in same tenant:
        #   verify_resource_access will raise AuthError with 403 Forbidden
        # If admin: Can access any resource in their tenant
        try:
            verify_resource_access(account['tenant_id'], account['user_id'])
        except AuthError as e:
            return jsonify({'error': e.message}), e.status_code

        return jsonify(account), 200

    except Exception as e:
        logger.error(f'Error getting account: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500


@auth_routes.route('/accounts/<account_id>', methods=['PUT'])
@verify_tenant_context
def update_account(account_id):
    """
    Update email account with row-level access control

    Features:
    - User can only update their own accounts
    - Admin can update any account in their tenant
    - Prevents cross-tenant modifications

    Path Parameters:
    - account_id: Account UUID

    Request Body (all optional):
        {
            "is_sync_enabled": true,
            "sync_interval": 300
        }

    Response:
        {
            "id": "550e8400-e29b-41d4-a716-446655440010",
            "updated": true
        }
    """
    try:
        tenant_id, user_id = get_tenant_context()

        # Example: Get account from database
        # account = db.query(EmailAccount).filter(
        #     EmailAccount.id == account_id,
        #     EmailAccount.tenant_id == tenant_id
        # ).first()

        account = {
            'id': account_id,
            'tenant_id': tenant_id,
            'user_id': user_id
        }

        if not account:
            return jsonify({'error': 'Not found'}), 404

        # Verify access before modification
        try:
            verify_resource_access(account['tenant_id'], account['user_id'])
        except AuthError as e:
            return jsonify({'error': e.message}), e.status_code

        # Update account
        data = request.get_json()
        # account.is_sync_enabled = data.get('is_sync_enabled', account.is_sync_enabled)
        # db.session.commit()

        logger.info(f'Account {account_id} updated by user {user_id}')
        return jsonify({'id': account_id, 'updated': True}), 200

    except Exception as e:
        logger.error(f'Error updating account: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# EXAMPLE 3: Role-Based Access Control (RBAC)
# ============================================================================

@auth_routes.route('/admin/accounts', methods=['GET'])
@verify_tenant_context
@verify_role('admin')  # Admin-only endpoint
def admin_list_all_accounts():
    """
    List all email accounts in tenant (Admin-only)

    Features:
    - Requires admin role
    - Can see all users' accounts in tenant
    - User role returns 403 Forbidden

    Response:
        {
            "accounts": [
                {
                    "id": "uuid",
                    "email": "john@example.com",
                    "user_id": "uuid",
                    "account_type": "imap"
                }
            ],
            "total": 5
        }
    """
    try:
        tenant_id, admin_id = get_tenant_context()
        role = get_user_role()

        logger.info(f'Admin {admin_id} listing all accounts in tenant {tenant_id}')

        # Example: Query all accounts in tenant (not filtered by user_id)
        # accounts = db.query(EmailAccount).filter(
        #     EmailAccount.tenant_id == tenant_id
        # ).all()

        accounts = [
            {
                'id': '550e8400-e29b-41d4-a716-446655440010',
                'email': 'john@example.com',
                'user_id': '550e8400-e29b-41d4-a716-446655440001',
                'account_type': 'imap'
            },
            {
                'id': '550e8400-e29b-41d4-a716-446655440011',
                'email': 'jane@example.com',
                'user_id': '550e8400-e29b-41d4-a716-446655440002',
                'account_type': 'imap'
            }
        ]

        return jsonify({'accounts': accounts, 'total': len(accounts)}), 200

    except Exception as e:
        logger.error(f'Error listing all accounts: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500


@auth_routes.route('/admin/accounts/<account_id>/disable', methods=['POST'])
@verify_tenant_context
@verify_role('admin')  # Admin-only action
def admin_disable_account(account_id):
    """
    Disable account (Admin action)

    Features:
    - Admin can disable any account in their tenant
    - User cannot disable accounts
    - Logs admin action with context

    Response:
        {
            "id": "account_id",
            "disabled": true
        }
    """
    try:
        tenant_id, admin_id = get_tenant_context()

        logger.warning(
            f'Admin {admin_id} disabled account {account_id} in tenant {tenant_id}'
        )

        # Example: Disable in database
        # account = db.query(EmailAccount).filter(
        #     EmailAccount.id == account_id,
        #     EmailAccount.tenant_id == tenant_id
        # ).first()
        # if account:
        #     account.is_enabled = False
        #     db.session.commit()

        return jsonify({'id': account_id, 'disabled': True}), 200

    except Exception as e:
        logger.error(f'Error disabling account: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# EXAMPLE 4: Multi-Role Authorization
# ============================================================================

@auth_routes.route('/account-settings', methods=['GET'])
@verify_tenant_context
@verify_role('user', 'admin')  # Both user and admin allowed
def get_account_settings():
    """
    Get account settings (User or Admin)

    Features:
    - Both regular users and admins can access
    - User sees only their own settings
    - Admin sees their own settings
    - Other roles return 403 Forbidden

    Response:
        {
            "user_id": "uuid",
            "notification_enabled": true,
            "sync_interval": 300
        }
    """
    tenant_id, user_id = get_tenant_context()
    role = get_user_role()

    logger.info(f'Account settings accessed by {role} {user_id}')

    # Example: Query settings
    # settings = db.query(AccountSettings).filter(
    #     AccountSettings.user_id == user_id
    # ).first()

    settings = {
        'user_id': user_id,
        'notification_enabled': True,
        'sync_interval': 300
    }

    return jsonify(settings), 200


# ============================================================================
# EXAMPLE 5: Authentication Token Generation (for testing/development)
# ============================================================================

@auth_routes.route('/test/generate-token', methods=['POST'])
def generate_test_token():
    """
    Generate test JWT token (Development/Testing only)

    DANGER: This endpoint should ONLY be available in development!
    In production, tokens should be issued by a dedicated auth service.

    Request Body:
        {
            "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
            "user_id": "550e8400-e29b-41d4-a716-446655440001",
            "role": "user"  # or "admin"
        }

    Response:
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "expires_in": 86400
        }
    """
    # In production, this should be protected or removed entirely
    if os.getenv('FLASK_ENV') != 'development':
        return jsonify({'error': 'Not available in production'}), 403

    try:
        data = request.get_json()

        # Validate input
        required = ['tenant_id', 'user_id']
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({
                'error': 'Missing required fields',
                'fields': missing
            }), 400

        # Create token
        token = create_jwt_token(
            tenant_id=data['tenant_id'],
            user_id=data['user_id'],
            role=data.get('role', 'user')
        )

        return jsonify({
            'token': token,
            'expires_in': 86400  # 24 hours
        }), 200

    except Exception as e:
        logger.error(f'Error generating test token: {str(e)}')
        return jsonify({'error': 'Failed to generate token'}), 500


# ============================================================================
# INTEGRATION INSTRUCTIONS
# ============================================================================

"""
To use this authentication middleware in your Flask app:

1. Import in your main Flask app (app.py):

    from flask import Flask
    from flask_cors import CORS
    from AUTH_INTEGRATION_EXAMPLE import auth_routes

    app = Flask(__name__)

    # Enable CORS
    CORS(app, resources={
        r'/api/*': {
            'origins': ['localhost:3000'],
            'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'allow_headers': ['Content-Type', 'Authorization']
        }
    })

    # Register authenticated routes
    app.register_blueprint(auth_routes)


2. Make requests with JWT token:

    curl -H "Authorization: Bearer <token>" \
         http://localhost:5000/api/v1/accounts


3. Make requests with headers (development):

    curl -H "X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440000" \
         -H "X-User-ID: 550e8400-e29b-41d4-a716-446655440001" \
         http://localhost:5000/api/v1/accounts


4. Generate test token:

    curl -X POST http://localhost:5000/api/v1/test/generate-token \
         -H "Content-Type: application/json" \
         -d '{
           "tenant_id": "550e8400-e29b-41d4-a716-446655440000",
           "user_id": "550e8400-e29b-41d4-a716-446655440001",
           "role": "user"
         }'


5. Environment variables (.env):

    JWT_SECRET_KEY=your-secure-secret-key-32-chars-min
    JWT_EXPIRATION_HOURS=24
    CORS_ORIGINS=localhost:3000,app.example.com
    FLASK_ENV=development


6. Verify multi-tenant isolation:

    - User can ONLY access their own resources
    - Admin can access any resource in their TENANT
    - Admin CANNOT cross tenant boundaries
    - All database queries MUST filter by tenant_id
    - All responses MUST respect user/role restrictions
"""

import os
