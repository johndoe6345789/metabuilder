"""
Email Accounts API Routes
- GET /accounts - List user email accounts
- POST /accounts - Create new email account
- GET /accounts/{id} - Get account details
- DELETE /accounts/{id} - Delete account
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import uuid
from datetime import datetime

accounts_bp = Blueprint('accounts', __name__)

# In-memory storage for demo (replace with DBAL in production)
email_accounts: Dict[str, Dict[str, Any]] = {}

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
                "id": "cuid",
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
        ]
    }
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')

        if not tenant_id or not user_id:
            return {
                'error': 'Missing required parameters',
                'message': 'tenant_id and user_id are required'
            }, 400

        # Filter accounts by tenant_id and user_id (multi-tenant safety)
        filtered_accounts = [
            account for account in email_accounts.values()
            if account.get('tenantId') == tenant_id and account.get('userId') == user_id
        ]

        return {
            'accounts': filtered_accounts
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to list accounts',
            'message': str(e)
        }, 500

@accounts_bp.route('', methods=['POST'])
def create_account():
    """
    Create a new email account

    Request Body:
    {
        "accountName": "Work Email",
        "emailAddress": "user@company.com",
        "protocol": "imap",
        "hostname": "imap.company.com",
        "port": 993,
        "encryption": "tls",
        "username": "user@company.com",
        "credentialId": "uuid",
        "isSyncEnabled": true,
        "syncInterval": 300
    }

    Returns:
    {
        "id": "cuid",
        "accountName": "Work Email",
        ...
    }
    """
    try:
        tenant_id = request.headers.get('X-Tenant-ID')
        user_id = request.headers.get('X-User-ID')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'X-Tenant-ID and X-User-ID headers required'
            }, 401

        data = request.get_json()

        # Validate required fields
        required_fields = ['accountName', 'emailAddress', 'hostname', 'port', 'username', 'credentialId']
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return {
                'error': 'Missing required fields',
                'message': f'Missing: {", ".join(missing_fields)}'
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
            'protocol': data.get('protocol', 'imap'),
            'hostname': data['hostname'],
            'port': data['port'],
            'encryption': data.get('encryption', 'tls'),
            'username': data['username'],
            'credentialId': data['credentialId'],
            'isSyncEnabled': data.get('isSyncEnabled', True),
            'syncInterval': data.get('syncInterval', 300),
            'lastSyncAt': None,
            'isSyncing': False,
            'isEnabled': True,
            'createdAt': now,
            'updatedAt': now
        }

        email_accounts[account_id] = account

        return account, 201
    except Exception as e:
        return {
            'error': 'Failed to create account',
            'message': str(e)
        }, 500

@accounts_bp.route('/<account_id>', methods=['GET'])
def get_account(account_id: str):
    """
    Get email account details

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)

    Returns:
    {
        "id": "cuid",
        "accountName": "Work Email",
        ...
    }
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'tenant_id and user_id required'
            }, 401

        account = email_accounts.get(account_id)

        if not account:
            return {
                'error': 'Not found',
                'message': f'Account {account_id} not found'
            }, 404

        # Verify tenant/user ownership
        if account.get('tenantId') != tenant_id or account.get('userId') != user_id:
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this account'
            }, 403

        return account, 200
    except Exception as e:
        return {
            'error': 'Failed to get account',
            'message': str(e)
        }, 500

@accounts_bp.route('/<account_id>', methods=['DELETE'])
def delete_account(account_id: str):
    """
    Delete email account

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)

    Returns:
    {
        "message": "Account deleted successfully"
    }
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'tenant_id and user_id required'
            }, 401

        account = email_accounts.get(account_id)

        if not account:
            return {
                'error': 'Not found',
                'message': f'Account {account_id} not found'
            }, 404

        # Verify tenant/user ownership
        if account.get('tenantId') != tenant_id or account.get('userId') != user_id:
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this account'
            }, 403

        del email_accounts[account_id]

        return {
            'message': 'Account deleted successfully',
            'id': account_id
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to delete account',
            'message': str(e)
        }, 500
