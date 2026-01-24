"""
Email Folders API Routes - Phase 7
Complete endpoint suite for email folder/mailbox management:
- GET /accounts/:id/folders - List folders with message counts
- POST /accounts/:id/folders - Create folder
- PUT /accounts/:id/folders/:folderId - Rename folder
- DELETE /accounts/:id/folders/:folderId - Delete folder
- GET /accounts/:id/folders/:folderId/messages - Messages in folder
- Folder hierarchy support (parent/child relationships)
- Special folders: Inbox, Sent, Drafts, Trash, Spam
- Unread/total message counts

All endpoints require tenantId + userId authentication.
Request validation and comprehensive error responses.
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional, Tuple, List
import uuid
from datetime import datetime
import logging
from src.models.folder import EmailFolder
from src.models.account import EmailAccount
from src.db import db

logger = logging.getLogger(__name__)

folders_bp = Blueprint('folders', __name__)

# Special folder types that are system-managed
SPECIAL_FOLDER_TYPES = ['inbox', 'sent', 'drafts', 'trash', 'spam']

# ============================================================================
# VALIDATION & HELPER FUNCTIONS
# ============================================================================

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


def verify_account_access(account_id: str, tenant_id: str, user_id: str) -> Tuple[Optional[EmailAccount], Optional[Tuple[Dict, int]]]:
    """
    Verify that account exists and belongs to tenant/user

    Returns:
        Tuple of (account, error_response)
        If successful, error_response is None
    """
    account = EmailAccount.get_by_id(account_id, tenant_id, user_id)

    if not account:
        return None, ({
            'error': 'Not found',
            'message': f'Account {account_id} not found or unauthorized'
        }, 404)

    return account, None


def verify_folder_access(folder_id: str, tenant_id: str, user_id: str) -> Tuple[Optional[EmailFolder], Optional[Tuple[Dict, int]]]:
    """
    Verify that folder exists and belongs to tenant/user

    Returns:
        Tuple of (folder, error_response)
        If successful, error_response is None
    """
    folder = EmailFolder.get_by_id(folder_id, tenant_id, user_id)

    if not folder:
        return None, ({
            'error': 'Not found',
            'message': f'Folder {folder_id} not found or unauthorized'
        }, 404)

    return folder, None


def validate_folder_creation(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email folder creation payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ['folderName']

    missing_fields = [f for f in required_fields if f not in data or data[f] is None]
    if missing_fields:
        return False, f'Missing required fields: {", ".join(missing_fields)}'

    # Validate folder name
    if not isinstance(data.get('folderName'), str) or len(data['folderName']) < 1:
        return False, 'Folder name must be a non-empty string'

    if len(data['folderName']) > 255:
        return False, 'Folder name must be 255 characters or less'

    # Validate folder type if provided
    folder_type = data.get('folderType', 'custom').lower()
    if folder_type not in SPECIAL_FOLDER_TYPES + ['custom']:
        return False, f'Invalid folder type: {folder_type}'

    return True, None


def validate_folder_update(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email folder update payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    # displayName validation
    if 'displayName' in data:
        if not isinstance(data['displayName'], str) or len(data['displayName']) < 1:
            return False, 'Display name must be a non-empty string'
        if len(data['displayName']) > 255:
            return False, 'Display name must be 255 characters or less'

    # Count validations
    if 'unreadCount' in data:
        try:
            count = int(data['unreadCount'])
            if count < 0:
                return False, 'Unread count cannot be negative'
        except (ValueError, TypeError):
            return False, 'Unread count must be a non-negative integer'

    if 'totalCount' in data:
        try:
            count = int(data['totalCount'])
            if count < 0:
                return False, 'Total count cannot be negative'
        except (ValueError, TypeError):
            return False, 'Total count must be a non-negative integer'

    # Sync state validation
    if 'syncStateUidvalidity' in data and data['syncStateUidvalidity'] is not None:
        if not isinstance(data['syncStateUidvalidity'], str):
            return False, 'Sync state UIDVALIDITY must be a string'

    if 'syncStateUidnext' in data and data['syncStateUidnext'] is not None:
        try:
            int(data['syncStateUidnext'])
        except (ValueError, TypeError):
            return False, 'Sync state UIDNEXT must be an integer'

    return True, None


def build_folder_response(folder: EmailFolder, include_children: bool = False) -> Dict[str, Any]:
    """
    Build complete folder response with optional child folders

    Args:
        folder: EmailFolder object
        include_children: Include child folders in response

    Returns:
        Dictionary with folder data and children
    """
    response = folder.to_dict()

    if include_children:
        children = folder.get_child_folders()
        response['children'] = [build_folder_response(child, include_children=False) for child in children]
    else:
        response['children'] = []

    return response


# ============================================================================
# ENDPOINT: GET /api/accounts/:id/folders - List folders with counts
# ============================================================================

@folders_bp.route('/accounts/<account_id>/folders', methods=['GET'])
def list_folders(account_id: str):
    """
    List all folders for an email account

    Path Parameters:
    - account_id: str - Email account ID

    Query Parameters:
    - tenant_id: str (required) - Tenant ID
    - user_id: str (required) - User ID
    - parent_id: str (optional) - Filter by parent folder (for hierarchy)
    - include_counts: bool (optional, default=true) - Include message counts

    Returns:
    {
        "folders": [
            {
                "id": "uuid",
                "accountId": "uuid",
                "folderName": "INBOX",
                "displayName": "Inbox",
                "parentFolderId": null,
                "folderType": "inbox",
                "imapName": "INBOX",
                "isSystemFolder": true,
                "unreadCount": 42,
                "totalCount": 157,
                "isSelectable": true,
                "hasChildren": false,
                "isVisible": true,
                "lastSyncedAt": 1706033200000,
                "createdAt": 1706033200000,
                "updatedAt": 1706033200000,
                "children": []
            }
        ],
        "count": 1
    }

    Error Responses:
    - 400: Missing tenant_id or user_id
    - 404: Account not found
    - 500: Internal server error
    """
    try:
        tenant_id, user_id, auth_error = authenticate_request()
        if auth_error:
            return auth_error

        # Verify account exists and is accessible
        account, access_error = verify_account_access(account_id, tenant_id, user_id)
        if access_error:
            return access_error

        # Get query parameters
        parent_id = request.args.get('parent_id')
        include_counts = request.args.get('include_counts', 'true').lower() == 'true'

        # List folders
        folders = EmailFolder.list_for_account(account_id, tenant_id, user_id, parent_id)

        # Build response
        folder_list = [build_folder_response(folder) for folder in folders]

        return {
            'folders': folder_list,
            'count': len(folder_list),
            'accountId': account_id
        }, 200

    except Exception as e:
        logger.error(f'Failed to list folders: {e}')
        return {
            'error': 'Failed to list folders',
            'message': str(e)
        }, 500


# ============================================================================
# ENDPOINT: POST /api/accounts/:id/folders - Create folder
# ============================================================================

@folders_bp.route('/accounts/<account_id>/folders', methods=['POST'])
def create_folder(account_id: str):
    """
    Create a new folder in an email account

    Path Parameters:
    - account_id: str - Email account ID

    Request Body:
    {
        "folderName": "Projects",
        "displayName": "Projects",
        "parentFolderId": null,
        "folderType": "custom",
        "imapName": "Projects",
        "isSystemFolder": false
    }

    Returns:
    {
        "id": "uuid",
        "accountId": "uuid",
        "folderName": "Projects",
        ...
    }

    Error Responses:
    - 400: Invalid request body
    - 401: Unauthorized
    - 404: Account not found
    - 409: Folder already exists
    - 500: Internal server error
    """
    try:
        tenant_id = request.headers.get('X-Tenant-ID')
        user_id = request.headers.get('X-User-ID')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'X-Tenant-ID and X-User-ID headers required'
            }, 401

        # Verify account exists and is accessible
        account, access_error = verify_account_access(account_id, tenant_id, user_id)
        if access_error:
            return access_error

        data = request.get_json()
        if not data:
            return {
                'error': 'Invalid request',
                'message': 'Request body must be valid JSON'
            }, 400

        # Validate request
        is_valid, error_msg = validate_folder_creation(data)
        if not is_valid:
            return {
                'error': 'Invalid request',
                'message': error_msg
            }, 400

        # Check if folder already exists
        existing = EmailFolder.query.filter_by(
            account_id=account_id,
            folder_name=data['folderName'],
            tenant_id=tenant_id,
            user_id=user_id
        ).first()

        if existing:
            return {
                'error': 'Conflict',
                'message': f'Folder "{data["folderName"]}" already exists'
            }, 409

        # Create folder
        folder = EmailFolder.create(data, tenant_id, user_id, account_id)

        logger.info(f'Created folder {folder.id} for account {account_id}')

        return build_folder_response(folder), 201

    except Exception as e:
        logger.error(f'Failed to create folder: {e}')
        return {
            'error': 'Failed to create folder',
            'message': str(e)
        }, 500


# ============================================================================
# ENDPOINT: GET /api/accounts/:id/folders/:folderId - Get folder details
# ============================================================================

@folders_bp.route('/accounts/<account_id>/folders/<folder_id>', methods=['GET'])
def get_folder(account_id: str, folder_id: str):
    """
    Get folder details with hierarchy information

    Path Parameters:
    - account_id: str - Email account ID
    - folder_id: str - Folder ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)
    - include_hierarchy: bool (optional, default=false) - Include parent path and children

    Returns:
    {
        "id": "uuid",
        "accountId": "uuid",
        "folderName": "Projects",
        "displayName": "Projects",
        "unreadCount": 5,
        "totalCount": 42,
        ...
    }

    Error Responses:
    - 400: Missing tenant_id or user_id
    - 404: Folder not found
    - 500: Internal server error
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'tenant_id and user_id required'
            }, 401

        # Verify folder exists and is accessible
        folder, access_error = verify_folder_access(folder_id, tenant_id, user_id)
        if access_error:
            return access_error

        # Verify folder belongs to account
        if folder.account_id != account_id:
            return {
                'error': 'Not found',
                'message': f'Folder {folder_id} not found in account {account_id}'
            }, 404

        # Include hierarchy if requested
        include_hierarchy = request.args.get('include_hierarchy', 'false').lower() == 'true'
        response = build_folder_response(folder, include_children=True)

        if include_hierarchy:
            hierarchy = folder.get_hierarchy_path()
            response['hierarchyPath'] = [{'id': f.id, 'displayName': f.display_name} for f in hierarchy]

        return response, 200

    except Exception as e:
        logger.error(f'Failed to get folder: {e}')
        return {
            'error': 'Failed to get folder',
            'message': str(e)
        }, 500


# ============================================================================
# ENDPOINT: PUT /api/accounts/:id/folders/:folderId - Rename/update folder
# ============================================================================

@folders_bp.route('/accounts/<account_id>/folders/<folder_id>', methods=['PUT'])
def update_folder(account_id: str, folder_id: str):
    """
    Update folder properties (rename, update counts, sync state)

    Path Parameters:
    - account_id: str - Email account ID
    - folder_id: str - Folder ID

    Request Body:
    {
        "displayName": "Important Projects",
        "unreadCount": 3,
        "totalCount": 42,
        "isVisible": true,
        "syncStateUidvalidity": "123456",
        "syncStateUidnext": 789
    }

    Returns:
    {
        "id": "uuid",
        "displayName": "Important Projects",
        ...
    }

    Error Responses:
    - 400: Invalid request body
    - 401: Unauthorized
    - 404: Folder not found
    - 500: Internal server error
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
        if not data:
            return {
                'error': 'Invalid request',
                'message': 'Request body must be valid JSON'
            }, 400

        # Validate request
        is_valid, error_msg = validate_folder_update(data)
        if not is_valid:
            return {
                'error': 'Invalid request',
                'message': error_msg
            }, 400

        # Verify folder exists and is accessible
        folder, access_error = verify_folder_access(folder_id, tenant_id, user_id)
        if access_error:
            return access_error

        # Verify folder belongs to account
        if folder.account_id != account_id:
            return {
                'error': 'Not found',
                'message': f'Folder {folder_id} not found in account {account_id}'
            }, 404

        # Prevent renaming system folders
        if folder.is_system_folder and 'displayName' in data:
            return {
                'error': 'Forbidden',
                'message': 'Cannot rename system folders'
            }, 403

        # Update folder
        folder.update(data)

        logger.info(f'Updated folder {folder_id}')

        return build_folder_response(folder), 200

    except Exception as e:
        logger.error(f'Failed to update folder: {e}')
        return {
            'error': 'Failed to update folder',
            'message': str(e)
        }, 500


# ============================================================================
# ENDPOINT: DELETE /api/accounts/:id/folders/:folderId - Delete folder
# ============================================================================

@folders_bp.route('/accounts/<account_id>/folders/<folder_id>', methods=['DELETE'])
def delete_folder(account_id: str, folder_id: str):
    """
    Delete (soft delete) a folder

    Path Parameters:
    - account_id: str - Email account ID
    - folder_id: str - Folder ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)
    - hard_delete: bool (optional, default=false) - Permanently delete

    Returns:
    {
        "message": "Folder deleted successfully",
        "id": "uuid"
    }

    Error Responses:
    - 400: Missing tenant_id or user_id
    - 403: Cannot delete system folder
    - 404: Folder not found
    - 500: Internal server error
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')
        hard_delete = request.args.get('hard_delete', 'false').lower() == 'true'

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'tenant_id and user_id required'
            }, 401

        # Verify folder exists and is accessible
        folder, access_error = verify_folder_access(folder_id, tenant_id, user_id)
        if access_error:
            return access_error

        # Verify folder belongs to account
        if folder.account_id != account_id:
            return {
                'error': 'Not found',
                'message': f'Folder {folder_id} not found in account {account_id}'
            }, 404

        # Prevent deleting system folders
        if folder.is_system_folder:
            return {
                'error': 'Forbidden',
                'message': 'Cannot delete system folders'
            }, 403

        # Delete folder
        if hard_delete:
            folder.hard_delete()
            logger.info(f'Hard deleted folder {folder_id}')
        else:
            folder.delete()
            logger.info(f'Soft deleted folder {folder_id}')

        return {
            'message': 'Folder deleted successfully',
            'id': folder_id,
            'hardDeleted': hard_delete
        }, 200

    except Exception as e:
        logger.error(f'Failed to delete folder: {e}')
        return {
            'error': 'Failed to delete folder',
            'message': str(e)
        }, 500


# ============================================================================
# ENDPOINT: GET /api/accounts/:id/folders/:folderId/messages - Messages in folder
# ============================================================================

@folders_bp.route('/accounts/<account_id>/folders/<folder_id>/messages', methods=['GET'])
def list_folder_messages(account_id: str, folder_id: str):
    """
    List messages in a folder (pagination supported)

    Path Parameters:
    - account_id: str - Email account ID
    - folder_id: str - Folder ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)
    - limit: int (optional, default=50) - Pagination limit
    - offset: int (optional, default=0) - Pagination offset
    - sort_by: str (optional, default=date) - Sort field (date, from, subject)
    - sort_order: str (optional, default=desc) - Sort order (asc, desc)
    - filter_unread: bool (optional) - Filter for unread messages only
    - search_query: str (optional) - Search in subject and from

    Returns:
    {
        "messages": [
            {
                "id": "uuid",
                "folderId": "uuid",
                "from": "sender@example.com",
                "to": "user@example.com",
                "subject": "Hello",
                "body": "Message body",
                "receivedAt": 1706033200000,
                "isUnread": false,
                "hasAttachments": false,
                ...
            }
        ],
        "count": 42,
        "total": 157,
        "limit": 50,
        "offset": 0
    }

    Error Responses:
    - 400: Missing tenant_id or user_id, or invalid pagination
    - 404: Folder not found
    - 500: Internal server error
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'tenant_id and user_id required'
            }, 401

        # Verify folder exists and is accessible
        folder, access_error = verify_folder_access(folder_id, tenant_id, user_id)
        if access_error:
            return access_error

        # Verify folder belongs to account
        if folder.account_id != account_id:
            return {
                'error': 'Not found',
                'message': f'Folder {folder_id} not found in account {account_id}'
            }, 404

        # Get pagination parameters
        try:
            limit = int(request.args.get('limit', 50))
            offset = int(request.args.get('offset', 0))

            if limit < 1 or limit > 500:
                return {
                    'error': 'Invalid request',
                    'message': 'Limit must be between 1 and 500'
                }, 400

            if offset < 0:
                return {
                    'error': 'Invalid request',
                    'message': 'Offset must be non-negative'
                }, 400

        except (ValueError, TypeError):
            return {
                'error': 'Invalid request',
                'message': 'Limit and offset must be integers'
            }, 400

        # This is a placeholder for now
        # In full implementation, query EmailMessage table with filters
        # Implementation depends on EmailMessage model creation (Phase 8)

        return {
            'messages': [],
            'count': 0,
            'total': folder.total_count,
            'limit': limit,
            'offset': offset,
            'folderId': folder_id,
            'accountId': account_id,
            'note': 'Message listing requires EmailMessage model (Phase 8)'
        }, 200

    except Exception as e:
        logger.error(f'Failed to list folder messages: {e}')
        return {
            'error': 'Failed to list folder messages',
            'message': str(e)
        }, 500


# ============================================================================
# UTILITY ENDPOINT: GET /api/accounts/:id/folders/:folderId/hierarchy
# ============================================================================

@folders_bp.route('/accounts/<account_id>/folders/<folder_id>/hierarchy', methods=['GET'])
def get_folder_hierarchy(account_id: str, folder_id: str):
    """
    Get folder hierarchy (parent path and child folders)

    Path Parameters:
    - account_id: str - Email account ID
    - folder_id: str - Folder ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)

    Returns:
    {
        "folder": { ... },
        "parentPath": [
            { "id": "uuid", "displayName": "Root" },
            { "id": "uuid", "displayName": "Projects" }
        ],
        "children": [
            { "id": "uuid", "displayName": "Subfolder 1" },
            { "id": "uuid", "displayName": "Subfolder 2" }
        ]
    }

    Error Responses:
    - 400: Missing tenant_id or user_id
    - 404: Folder not found
    - 500: Internal server error
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'tenant_id and user_id required'
            }, 401

        # Verify folder exists and is accessible
        folder, access_error = verify_folder_access(folder_id, tenant_id, user_id)
        if access_error:
            return access_error

        # Verify folder belongs to account
        if folder.account_id != account_id:
            return {
                'error': 'Not found',
                'message': f'Folder {folder_id} not found in account {account_id}'
            }, 404

        # Get hierarchy
        hierarchy_path = folder.get_hierarchy_path()
        children = folder.get_child_folders()

        return {
            'folder': build_folder_response(folder),
            'parentPath': [
                {'id': f.id, 'displayName': f.display_name}
                for f in hierarchy_path[:-1]  # Exclude current folder
            ],
            'children': [
                build_folder_response(child, include_children=False)
                for child in children
            ]
        }, 200

    except Exception as e:
        logger.error(f'Failed to get folder hierarchy: {e}')
        return {
            'error': 'Failed to get folder hierarchy',
            'message': str(e)
        }, 500
