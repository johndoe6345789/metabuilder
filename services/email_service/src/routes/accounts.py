"""
Email Accounts API Routes - Phase 7
Complete endpoint suite for email account management:
- GET /accounts - List user email accounts
- POST /accounts - Create new email account
- GET /accounts/{id} - Get account details
- PUT /accounts/{id} - Update account settings
- DELETE /accounts/{id} - Delete account
- POST /accounts/{id}/test - Test connection

All endpoints require tenantId + userId authentication.
Request validation and comprehensive error responses.
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional, Tuple
import uuid
from datetime import datetime
import logging
from src.imap_sync import IMAPSyncManager
from src.smtp_send import SMTPSender

logger = logging.getLogger(__name__)

accounts_bp = Blueprint('accounts', __name__)

# In-memory storage for demo (replace with DBAL in production)
email_accounts: Dict[str, Dict[str, Any]] = {}

# ============================================================================
# VALIDATION & HELPER FUNCTIONS
# ============================================================================

def validate_account_creation(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email account creation payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = [
        'accountName',
        'emailAddress',
        'hostname',
        'port',
        'username',
        'credentialId'
    ]

    missing_fields = [f for f in required_fields if f not in data or data[f] is None]
    if missing_fields:
        return False, f'Missing required fields: {", ".join(missing_fields)}'

    # Validate email address format
    if not isinstance(data.get('emailAddress'), str) or '@' not in data['emailAddress']:
        return False, 'Invalid email address format'

    # Validate port is integer
    try:
        port = int(data.get('port', 993))
        if port < 1 or port > 65535:
            return False, 'Port must be between 1 and 65535'
    except (ValueError, TypeError):
        return False, 'Port must be a valid integer'

    # Validate protocol
    protocol = data.get('protocol', 'imap').lower()
    if protocol not in ['imap', 'pop3']:
        return False, f'Protocol must be imap or pop3, got {protocol}'

    # Validate encryption
    encryption = data.get('encryption', 'tls').lower()
    if encryption not in ['tls', 'starttls', 'none']:
        return False, f'Encryption must be tls, starttls, or none, got {encryption}'

    # Validate sync interval if provided
    if 'syncInterval' in data:
        try:
            sync_interval = int(data['syncInterval'])
            if sync_interval < 60 or sync_interval > 3600:
                return False, 'Sync interval must be between 60 and 3600 seconds'
        except (ValueError, TypeError):
            return False, 'Sync interval must be a valid integer'

    return True, None


def validate_account_update(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email account update payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    # All fields are optional on update, but validate if provided
    if 'emailAddress' in data and '@' not in str(data['emailAddress']):
        return False, 'Invalid email address format'

    if 'port' in data:
        try:
            port = int(data['port'])
            if port < 1 or port > 65535:
                return False, 'Port must be between 1 and 65535'
        except (ValueError, TypeError):
            return False, 'Port must be a valid integer'

    if 'protocol' in data:
        protocol = data.get('protocol', '').lower()
        if protocol and protocol not in ['imap', 'pop3']:
            return False, f'Protocol must be imap or pop3, got {protocol}'

    if 'encryption' in data:
        encryption = data.get('encryption', '').lower()
        if encryption and encryption not in ['tls', 'starttls', 'none']:
            return False, f'Encryption must be tls, starttls, or none, got {encryption}'

    if 'syncInterval' in data:
        try:
            sync_interval = int(data['syncInterval'])
            if sync_interval < 60 or sync_interval > 3600:
                return False, 'Sync interval must be between 60 and 3600 seconds'
        except (ValueError, TypeError):
            return False, 'Sync interval must be a valid integer'

    return True, None


def authenticate_request() -> Tuple[Optional[str], Optional[str], Optional[Tuple[Dict, int]]]:
    """
    Extract and validate tenant_id and user_id from request

    Returns:
        Tuple of (tenant_id, user_id, error_response)
        If valid, error_response is None
        If invalid, tenant_id and user_id are None
    """
    # Check headers first (for POST/PUT/DELETE)
    tenant_id = request.headers.get('X-Tenant-ID')
    user_id = request.headers.get('X-User-ID')

    # Fall back to query params (for GET)
    if not tenant_id:
        tenant_id = request.args.get('tenant_id')
    if not user_id:
        user_id = request.args.get('user_id')

    if not tenant_id or not user_id:
        error_response = {
            'error': 'Unauthorized',
            'message': 'X-Tenant-ID and X-User-ID headers (or tenant_id and user_id query params) required'
        }
        return None, None, (error_response, 401)

    return tenant_id, user_id, None


def check_account_ownership(account: Dict[str, Any], tenant_id: str, user_id: str) -> Optional[Tuple[Dict, int]]:
    """
    Verify that account belongs to tenant/user

    Returns:
        Error response tuple if ownership check fails, None if successful
    """
    if account.get('tenantId') != tenant_id or account.get('userId') != user_id:
        return {
            'error': 'Forbidden',
            'message': 'You do not have access to this account'
        }, 403

    return None

# ============================================================================
# ENDPOINT: GET /api/accounts - List user's email accounts
# ============================================================================

@accounts_bp.route('', methods=['GET'])
def list_accounts():
    """
    List all email accounts for the authenticated user

    Query Parameters:
    - tenant_id: str (required) - Tenant ID from auth context
    - user_id: str (required) - User ID from auth context

    Returns:
    {
        "accounts": [
            {
                "id": "uuid",
                "accountName": "Work Email",
                "emailAddress": "user@company.com",
                "protocol": "imap",
                "hostname": "imap.company.com",
                "port": 993,
                "encryption": "tls",
                "isSyncEnabled": true,
                "syncInterval": 300,
                "lastSyncAt": 1706033200000,
                "isSyncing": false,
                "isEnabled": true,
                "createdAt": 1706033200000,
                "updatedAt": 1706033200000
            }
        ],
        "count": 1
    }

    Error Responses:
    - 400: Missing tenant_id or user_id
    - 500: Internal server error
    """
    try:
        tenant_id, user_id, auth_error = authenticate_request()
        if auth_error:
            return auth_error

        # Filter accounts by tenant_id and user_id (multi-tenant safety)
        filtered_accounts = [
            account for account in email_accounts.values()
            if account.get('tenantId') == tenant_id and account.get('userId') == user_id
        ]

        return {
            'accounts': filtered_accounts,
            'count': len(filtered_accounts)
        }, 200
    except Exception as e:
        logger.error(f'Failed to list accounts: {e}')
        return {
            'error': 'Failed to list accounts',
            'message': str(e)
        }, 500

# ============================================================================
# ENDPOINT: POST /api/accounts - Create new email account
# ============================================================================

@accounts_bp.route('', methods=['POST'])
def create_account():
    """
    Create a new email account with validation

    Request Headers:
    - X-Tenant-ID: str (required) - Tenant ID from auth context
    - X-User-ID: str (required) - User ID from auth context

    Request Body:
    {
        "accountName": "Work Email",
        "emailAddress": "user@company.com",
        "protocol": "imap",           [optional, default: "imap"]
        "hostname": "imap.company.com",
        "port": 993,
        "encryption": "tls",          [optional, default: "tls"]
        "username": "user@company.com",
        "credentialId": "uuid",
        "isSyncEnabled": true,        [optional, default: true]
        "syncInterval": 300           [optional, default: 300, range: 60-3600]
    }

    Returns (201):
    {
        "id": "uuid",
        "accountName": "Work Email",
        "emailAddress": "user@company.com",
        "protocol": "imap",
        "hostname": "imap.company.com",
        "port": 993,
        "encryption": "tls",
        "isSyncEnabled": true,
        "syncInterval": 300,
        "lastSyncAt": null,
        "isSyncing": false,
        "isEnabled": true,
        "createdAt": 1706033200000,
        "updatedAt": 1706033200000
    }

    Error Responses:
    - 400: Missing required fields or invalid data
    - 401: Missing authentication headers
    - 500: Internal server error
    """
    try:
        tenant_id, user_id, auth_error = authenticate_request()
        if auth_error:
            return auth_error

        data = request.get_json()
        if not data:
            return {
                'error': 'Bad request',
                'message': 'Request body must be valid JSON'
            }, 400

        # Validate payload
        is_valid, error_msg = validate_account_creation(data)
        if not is_valid:
            return {
                'error': 'Bad request',
                'message': error_msg
            }, 400

        # Create account
        account_id = str(uuid.uuid4())
        now = int(datetime.utcnow().timestamp() * 1000)

        account = {
            'id': account_id,
            'tenantId': tenant_id,
            'userId': user_id,
            'accountName': data['accountName'],
            'emailAddress': data['emailAddress'],
            'protocol': data.get('protocol', 'imap').lower(),
            'hostname': data['hostname'],
            'port': int(data['port']),
            'encryption': data.get('encryption', 'tls').lower(),
            'username': data['username'],
            'credentialId': data['credentialId'],
            'isSyncEnabled': data.get('isSyncEnabled', True),
            'syncInterval': int(data.get('syncInterval', 300)),
            'lastSyncAt': None,
            'isSyncing': False,
            'isEnabled': True,
            'createdAt': now,
            'updatedAt': now
        }

        email_accounts[account_id] = account

        logger.info(f'Created email account {account_id} for tenant {tenant_id}, user {user_id}')
        return account, 201

    except ValueError as e:
        return {
            'error': 'Bad request',
            'message': f'Invalid data type: {str(e)}'
        }, 400
    except Exception as e:
        logger.error(f'Failed to create account: {e}')
        return {
            'error': 'Failed to create account',
            'message': str(e)
        }, 500

# ============================================================================
# ENDPOINT: GET /api/accounts/:id - Get account details
# ============================================================================

@accounts_bp.route('/<account_id>', methods=['GET'])
def get_account(account_id: str):
    """
    Get email account details

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)

    Returns (200):
    {
        "id": "uuid",
        "accountName": "Work Email",
        "emailAddress": "user@company.com",
        "protocol": "imap",
        "hostname": "imap.company.com",
        "port": 993,
        "encryption": "tls",
        "isSyncEnabled": true,
        "syncInterval": 300,
        "lastSyncAt": 1706033200000,
        "isSyncing": false,
        "isEnabled": true,
        "createdAt": 1706033200000,
        "updatedAt": 1706033200000
    }

    Error Responses:
    - 401: Missing authentication params
    - 403: No access to this account
    - 404: Account not found
    - 500: Internal server error
    """
    try:
        tenant_id, user_id, auth_error = authenticate_request()
        if auth_error:
            return auth_error

        account = email_accounts.get(account_id)

        if not account:
            return {
                'error': 'Not found',
                'message': f'Account {account_id} not found'
            }, 404

        # Verify tenant/user ownership
        ownership_error = check_account_ownership(account, tenant_id, user_id)
        if ownership_error:
            return ownership_error

        return account, 200

    except Exception as e:
        logger.error(f'Failed to get account {account_id}: {e}')
        return {
            'error': 'Failed to get account',
            'message': str(e)
        }, 500

# ============================================================================
# ENDPOINT: PUT /api/accounts/:id - Update account settings
# ============================================================================

@accounts_bp.route('/<account_id>', methods=['PUT'])
def update_account(account_id: str):
    """
    Update email account settings

    Path Parameters:
    - account_id: str - Account ID

    Request Headers:
    - X-Tenant-ID: str (required)
    - X-User-ID: str (required)

    Request Body (all fields optional):
    {
        "accountName": "Work Email",
        "emailAddress": "user@company.com",
        "hostname": "imap.company.com",
        "port": 993,
        "encryption": "tls",
        "username": "user@company.com",
        "isSyncEnabled": true,
        "syncInterval": 300,
        "isEnabled": true
    }

    Returns (200):
    {
        "id": "uuid",
        "accountName": "Work Email Updated",
        ...
        "updatedAt": 1706033200000
    }

    Error Responses:
    - 400: Invalid request data
    - 401: Missing authentication headers
    - 403: No access to this account
    - 404: Account not found
    - 500: Internal server error
    """
    try:
        tenant_id, user_id, auth_error = authenticate_request()
        if auth_error:
            return auth_error

        account = email_accounts.get(account_id)

        if not account:
            return {
                'error': 'Not found',
                'message': f'Account {account_id} not found'
            }, 404

        # Verify tenant/user ownership
        ownership_error = check_account_ownership(account, tenant_id, user_id)
        if ownership_error:
            return ownership_error

        data = request.get_json()
        if not data:
            return {
                'error': 'Bad request',
                'message': 'Request body must be valid JSON'
            }, 400

        # Validate payload
        is_valid, error_msg = validate_account_update(data)
        if not is_valid:
            return {
                'error': 'Bad request',
                'message': error_msg
            }, 400

        # Update fields
        if 'accountName' in data:
            account['accountName'] = data['accountName']
        if 'emailAddress' in data:
            account['emailAddress'] = data['emailAddress']
        if 'hostname' in data:
            account['hostname'] = data['hostname']
        if 'port' in data:
            account['port'] = int(data['port'])
        if 'encryption' in data:
            account['encryption'] = data['encryption'].lower()
        if 'username' in data:
            account['username'] = data['username']
        if 'isSyncEnabled' in data:
            account['isSyncEnabled'] = bool(data['isSyncEnabled'])
        if 'syncInterval' in data:
            account['syncInterval'] = int(data['syncInterval'])
        if 'isEnabled' in data:
            account['isEnabled'] = bool(data['isEnabled'])

        account['updatedAt'] = int(datetime.utcnow().timestamp() * 1000)
        email_accounts[account_id] = account

        logger.info(f'Updated email account {account_id} for tenant {tenant_id}, user {user_id}')
        return account, 200

    except ValueError as e:
        return {
            'error': 'Bad request',
            'message': f'Invalid data type: {str(e)}'
        }, 400
    except Exception as e:
        logger.error(f'Failed to update account {account_id}: {e}')
        return {
            'error': 'Failed to update account',
            'message': str(e)
        }, 500


# ============================================================================
# ENDPOINT: DELETE /api/accounts/:id - Delete account
# ============================================================================

@accounts_bp.route('/<account_id>', methods=['DELETE'])
def delete_account(account_id: str):
    """
    Delete email account (soft delete recommended for production)

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)

    Returns (200):
    {
        "message": "Account deleted successfully",
        "id": "uuid"
    }

    Error Responses:
    - 401: Missing authentication params
    - 403: No access to this account
    - 404: Account not found
    - 500: Internal server error
    """
    try:
        tenant_id, user_id, auth_error = authenticate_request()
        if auth_error:
            return auth_error

        account = email_accounts.get(account_id)

        if not account:
            return {
                'error': 'Not found',
                'message': f'Account {account_id} not found'
            }, 404

        # Verify tenant/user ownership
        ownership_error = check_account_ownership(account, tenant_id, user_id)
        if ownership_error:
            return ownership_error

        del email_accounts[account_id]

        logger.info(f'Deleted email account {account_id} for tenant {tenant_id}, user {user_id}')
        return {
            'message': 'Account deleted successfully',
            'id': account_id
        }, 200

    except Exception as e:
        logger.error(f'Failed to delete account {account_id}: {e}')
        return {
            'error': 'Failed to delete account',
            'message': str(e)
        }, 500


# ============================================================================
# ENDPOINT: POST /api/accounts/:id/test - Test connection
# ============================================================================

@accounts_bp.route('/<account_id>/test', methods=['POST'])
def test_account_connection(account_id: str):
    """
    Test email account connection (IMAP/SMTP)

    Path Parameters:
    - account_id: str - Account ID

    Request Headers:
    - X-Tenant-ID: str (required)
    - X-User-ID: str (required)

    Request Body (optional):
    {
        "password": "account_password",  [required if not in credential store]
        "timeout": 30                     [optional, default: 30]
    }

    Returns (200):
    {
        "success": true,
        "protocol": "imap",
        "server": "imap.company.com:993",
        "message": "Connection successful",
        "folders": 15,
        "timestamp": 1706033200000
    }

    Returns (400) on connection failure:
    {
        "success": false,
        "error": "Connection failed",
        "message": "Network timeout",
        "timestamp": 1706033200000
    }

    Error Responses:
    - 401: Missing authentication headers
    - 403: No access to this account
    - 404: Account not found
    - 500: Internal server error
    """
    try:
        tenant_id, user_id, auth_error = authenticate_request()
        if auth_error:
            return auth_error

        account = email_accounts.get(account_id)

        if not account:
            return {
                'error': 'Not found',
                'message': f'Account {account_id} not found'
            }, 404

        # Verify tenant/user ownership
        ownership_error = check_account_ownership(account, tenant_id, user_id)
        if ownership_error:
            return ownership_error

        data = request.get_json() or {}
        timeout = data.get('timeout', 30)

        # In production, fetch password from credential store using credentialId
        # For demo, check request body or return error
        password = data.get('password')
        if not password:
            return {
                'error': 'Bad request',
                'message': 'Password required for connection test'
            }, 400

        try:
            # Test IMAP connection
            if account.get('protocol') == 'pop3':
                # For POP3, we'd use poplib (not included in this basic test)
                return {
                    'success': False,
                    'error': 'POP3 testing not yet implemented',
                    'timestamp': int(datetime.utcnow().timestamp() * 1000)
                }, 501
            else:
                # Test IMAP connection
                sync_manager = IMAPSyncManager(
                    hostname=account['hostname'],
                    port=account['port'],
                    username=account['username'],
                    password=password,
                    encryption=account['encryption']
                )

                # Set timeout
                if hasattr(sync_manager, 'timeout'):
                    sync_manager.timeout = timeout

                # Attempt connection
                connected = sync_manager.connect()

                if not connected:
                    return {
                        'success': False,
                        'error': 'Connection failed',
                        'message': 'Failed to authenticate with IMAP server',
                        'protocol': account['protocol'],
                        'server': f"{account['hostname']}:{account['port']}",
                        'timestamp': int(datetime.utcnow().timestamp() * 1000)
                    }, 400

                # List folders to verify full connectivity
                folders = sync_manager.list_folders()

                # Disconnect
                sync_manager.disconnect()

                return {
                    'success': True,
                    'protocol': account['protocol'],
                    'server': f"{account['hostname']}:{account['port']}",
                    'message': 'Connection successful',
                    'folders': len(folders),
                    'folderDetails': [
                        {
                            'name': f['name'],
                            'displayName': f['displayName'],
                            'type': f['type'],
                            'isSelectable': f['isSelectable']
                        }
                        for f in folders[:10]  # Return first 10 for display
                    ],
                    'timestamp': int(datetime.utcnow().timestamp() * 1000)
                }, 200

        except Exception as e:
            logger.error(f'Connection test failed for account {account_id}: {e}')
            return {
                'success': False,
                'error': 'Connection failed',
                'message': str(e),
                'protocol': account['protocol'],
                'server': f"{account['hostname']}:{account['port']}",
                'timestamp': int(datetime.utcnow().timestamp() * 1000)
            }, 400

    except Exception as e:
        logger.error(f'Failed to test account {account_id}: {e}')
        return {
            'error': 'Failed to test account',
            'message': str(e)
        }, 500
