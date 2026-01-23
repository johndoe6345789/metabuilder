"""
Email Sync API Routes
- POST /sync/{accountId} - Trigger IMAP sync
- GET /sync/{accountId}/status - Get sync status
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

sync_bp = Blueprint('sync', __name__)

# In-memory sync status tracking (replace with DBAL in production)
sync_status: Dict[str, Dict[str, Any]] = {}

@sync_bp.route('/<account_id>', methods=['POST'])
def trigger_sync(account_id: str):
    """
    Trigger IMAP sync for an email account

    Path Parameters:
    - account_id: str - Account ID

    Request Body:
    {
        "forceFullSync": false,
        "folderIds": ["folder1", "folder2"]  # optional - sync specific folders
    }

    Returns:
    {
        "syncId": "uuid",
        "accountId": "account_id",
        "status": "started",
        "startedAt": 1706033200000,
        "estimatedCompletionAt": 1706033300000,
        "progressMessage": "Starting sync..."
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

        data = request.get_json() or {}

        sync_id = str(uuid.uuid4())
        now = int(datetime.utcnow().timestamp() * 1000)

        # Create sync task
        sync_task = {
            'syncId': sync_id,
            'accountId': account_id,
            'tenantId': tenant_id,
            'userId': user_id,
            'status': 'started',
            'startedAt': now,
            'estimatedCompletionAt': now + 60000,  # 1 minute estimate
            'progressMessage': 'Starting sync...',
            'forceFullSync': data.get('forceFullSync', False),
            'folderIds': data.get('folderIds', []),
            'messagesProcessed': 0,
            'totalMessages': 0,
            'errorCount': 0,
            'errorMessages': []
        }

        sync_status[sync_id] = sync_task

        # TODO: In production, dispatch Celery task here
        # from .tasks import sync_email_account
        # sync_email_account.delay(account_id, tenant_id, user_id, sync_id)

        return {
            'syncId': sync_id,
            'accountId': account_id,
            'status': sync_task['status'],
            'startedAt': sync_task['startedAt'],
            'estimatedCompletionAt': sync_task['estimatedCompletionAt'],
            'progressMessage': sync_task['progressMessage']
        }, 202
    except Exception as e:
        return {
            'error': 'Failed to trigger sync',
            'message': str(e)
        }, 500

@sync_bp.route('/<account_id>/status', methods=['GET'])
def get_sync_status(account_id: str):
    """
    Get sync status for an email account

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)
    - syncId: str (optional) - specific sync to get status for

    Returns:
    {
        "currentSync": {
            "syncId": "uuid",
            "accountId": "account_id",
            "status": "syncing|completed|failed|idle",
            "startedAt": 1706033200000,
            "completedAt": null,
            "estimatedCompletionAt": 1706033300000,
            "progressMessage": "Syncing folder Inbox... 45/100 messages",
            "progressPercentage": 45,
            "messagesProcessed": 45,
            "totalMessages": 100,
            "errorCount": 0,
            "errorMessages": []
        },
        "lastSyncAt": 1706032200000,
        "totalMessagesInAccount": 1234
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

        sync_id = request.args.get('syncId')

        # Get current sync status
        current_sync = None
        if sync_id:
            current_sync = sync_status.get(sync_id)
        else:
            # Get most recent sync for account
            account_syncs = [
                s for s in sync_status.values()
                if s.get('accountId') == account_id and
                   s.get('tenantId') == tenant_id and
                   s.get('userId') == user_id
            ]
            if account_syncs:
                current_sync = sorted(account_syncs, key=lambda x: x['startedAt'], reverse=True)[0]

        response = {
            'currentSync': current_sync,
            'lastSyncAt': None,
            'totalMessagesInAccount': 0
        }

        # TODO: Get last sync timestamp and total message count from DBAL
        # In production:
        # - Query EmailClient.lastSyncAt
        # - Query count(EmailMessage) WHERE emailClientId = account_id

        return response, 200
    except Exception as e:
        return {
            'error': 'Failed to get sync status',
            'message': str(e)
        }, 500

@sync_bp.route('/<account_id>/cancel', methods=['POST'])
def cancel_sync(account_id: str):
    """
    Cancel ongoing sync for an email account

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)
    - syncId: str (required) - sync ID to cancel

    Returns:
    {
        "message": "Sync cancelled successfully",
        "syncId": "uuid"
    }
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')
        sync_id = request.args.get('syncId')

        if not tenant_id or not user_id or not sync_id:
            return {
                'error': 'Missing required parameters',
                'message': 'tenant_id, user_id, and syncId are required'
            }, 400

        sync_task = sync_status.get(sync_id)
        if not sync_task:
            return {
                'error': 'Not found',
                'message': f'Sync {sync_id} not found'
            }, 404

        # Verify ownership
        if sync_task.get('tenantId') != tenant_id or sync_task.get('userId') != user_id:
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this sync'
            }, 403

        if sync_task.get('status') not in ['started', 'syncing']:
            return {
                'error': 'Bad request',
                'message': f'Cannot cancel sync in {sync_task.get("status")} state'
            }, 400

        # Cancel sync
        sync_task['status'] = 'cancelled'
        sync_task['completedAt'] = int(datetime.utcnow().timestamp() * 1000)
        sync_task['progressMessage'] = 'Sync cancelled by user'

        return {
            'message': 'Sync cancelled successfully',
            'syncId': sync_id
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to cancel sync',
            'message': str(e)
        }, 500
