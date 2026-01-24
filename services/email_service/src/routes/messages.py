"""
Email Messages API Routes (Phase 7)
- GET /accounts/:id/messages - List messages with pagination, filtering
- GET /accounts/:id/messages/:msgId - Get message details
- POST /accounts/:id/messages - Send message (triggers SMTP task)
- PUT /accounts/:id/messages/:msgId - Update flags (read, starred)
- DELETE /accounts/:id/messages/:msgId - Delete message
- GET /accounts/:id/messages/search - Search messages

Features:
- Pagination support (page, limit, offset)
- Filtering by folder, date range, flags, sender
- Full-text search across subject, body, from, to
- Batch operations (mark multiple as read, star multiple, etc)
- Multi-tenant safety (tenantId/userId filtering on all queries)
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, List, Optional, Tuple
import uuid
from datetime import datetime, timedelta
from functools import wraps

messages_bp = Blueprint('messages', __name__)

# In-memory storage for demo (replace with DBAL in production)
email_messages: Dict[str, Dict[str, Any]] = {}
message_flags: Dict[str, Dict[str, bool]] = {}  # Per-message flags (read, starred, etc)


def validate_auth(f):
    """Decorator to validate tenant/user headers on all endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        tenant_id = request.headers.get('X-Tenant-ID') or request.args.get('tenant_id')
        user_id = request.headers.get('X-User-ID') or request.args.get('user_id')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'X-Tenant-ID and X-User-ID headers or query parameters required'
            }, 401

        # Pass tenant_id and user_id to route handler
        return f(tenant_id=tenant_id, user_id=user_id, *args, **kwargs)
    return decorated_function


def paginate_results(items: List[Dict], page: int = 1, limit: int = 20) -> Tuple[List[Dict], Dict]:
    """
    Paginate results and return items + pagination metadata

    Args:
        items: List of items to paginate
        page: Page number (1-indexed)
        limit: Items per page

    Returns:
        Tuple of (paginated_items, pagination_metadata)
    """
    if page < 1:
        page = 1
    if limit < 1 or limit > 100:
        limit = 20

    total = len(items)
    start = (page - 1) * limit
    end = start + limit

    paginated = items[start:end]
    total_pages = (total + limit - 1) // limit

    return paginated, {
        'page': page,
        'limit': limit,
        'total': total,
        'totalPages': total_pages,
        'hasNextPage': page < total_pages,
        'hasPreviousPage': page > 1
    }


@messages_bp.route('/<account_id>/messages', methods=['GET'])
@validate_auth
def list_messages(account_id: str, tenant_id: str, user_id: str):
    """
    List messages for an email account with pagination and filtering

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - page: int (default 1) - Page number
    - limit: int (default 20) - Items per page (max 100)
    - folder: str (optional) - Filter by folder (Inbox, Sent, Drafts, etc)
    - isRead: bool (optional) - Filter by read status
    - isStarred: bool (optional) - Filter by starred status
    - hasAttachments: bool (optional) - Filter by attachment presence
    - dateFrom: int (optional) - Filter by received date (unix timestamp ms)
    - dateTo: int (optional) - Filter by received date (unix timestamp ms)
    - from: str (optional) - Filter by sender email
    - to: str (optional) - Filter by recipient email
    - sortBy: str (optional) - Sort field (receivedAt, subject, from, size)
    - sortOrder: str (optional) - Sort order (asc, desc) default desc

    Returns:
    {
        "messages": [
            {
                "messageId": "uuid",
                "accountId": "account_id",
                "folder": "Inbox",
                "subject": "Email subject",
                "from": "sender@example.com",
                "to": ["recipient@example.com"],
                "cc": [],
                "bcc": [],
                "receivedAt": 1706033200000,
                "size": 2048,
                "isRead": false,
                "isStarred": false,
                "hasAttachments": false,
                "preview": "First 100 chars of body...",
                "attachmentCount": 0,
                "createdAt": 1706033200000,
                "updatedAt": 1706033200000
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 150,
            "totalPages": 8,
            "hasNextPage": true,
            "hasPreviousPage": false
        }
    }
    """
    try:
        # Extract pagination params
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))

        # Extract filter params
        folder = request.args.get('folder')
        is_read = request.args.get('isRead')
        is_starred = request.args.get('isStarred')
        has_attachments = request.args.get('hasAttachments')
        date_from = request.args.get('dateFrom', type=int)
        date_to = request.args.get('dateTo', type=int)
        from_filter = request.args.get('from')
        to_filter = request.args.get('to')
        sort_by = request.args.get('sortBy', 'receivedAt')
        sort_order = request.args.get('sortOrder', 'desc')

        # Filter messages by account, tenant, user
        filtered = [
            msg for msg in email_messages.values()
            if msg.get('accountId') == account_id and
               msg.get('tenantId') == tenant_id and
               msg.get('userId') == user_id and
               not msg.get('isDeleted', False)  # Exclude soft-deleted
        ]

        # Apply filters
        if folder:
            filtered = [m for m in filtered if m.get('folder') == folder]

        if is_read is not None:
            is_read_bool = is_read.lower() in ['true', '1', 'yes']
            filtered = [m for m in filtered if message_flags.get(m['messageId'], {}).get('isRead', False) == is_read_bool]

        if is_starred is not None:
            is_starred_bool = is_starred.lower() in ['true', '1', 'yes']
            filtered = [m for m in filtered if message_flags.get(m['messageId'], {}).get('isStarred', False) == is_starred_bool]

        if has_attachments is not None:
            has_attachments_bool = has_attachments.lower() in ['true', '1', 'yes']
            filtered = [m for m in filtered if bool(m.get('attachments', [])) == has_attachments_bool]

        if date_from:
            filtered = [m for m in filtered if m.get('receivedAt', 0) >= date_from]

        if date_to:
            filtered = [m for m in filtered if m.get('receivedAt', 0) <= date_to]

        if from_filter:
            filtered = [m for m in filtered if from_filter.lower() in m.get('from', '').lower()]

        if to_filter:
            to_list = m.get('to', [])
            filtered = [m for m in filtered if any(to_filter.lower() in t.lower() for t in to_list)]

        # Sort results
        reverse = sort_order.lower() == 'desc'
        if sort_by == 'receivedAt':
            filtered.sort(key=lambda x: x.get('receivedAt', 0), reverse=reverse)
        elif sort_by == 'subject':
            filtered.sort(key=lambda x: x.get('subject', ''), reverse=reverse)
        elif sort_by == 'from':
            filtered.sort(key=lambda x: x.get('from', ''), reverse=reverse)
        elif sort_by == 'size':
            filtered.sort(key=lambda x: x.get('size', 0), reverse=reverse)

        # Paginate
        messages, pagination = paginate_results(filtered, page, limit)

        # Enrich with flags
        for msg in messages:
            flags = message_flags.get(msg['messageId'], {})
            msg['isRead'] = flags.get('isRead', False)
            msg['isStarred'] = flags.get('isStarred', False)

        return {
            'messages': messages,
            'pagination': pagination
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to list messages',
            'message': str(e)
        }, 500


@messages_bp.route('/<account_id>/messages/<message_id>', methods=['GET'])
@validate_auth
def get_message(account_id: str, message_id: str, tenant_id: str, user_id: str):
    """
    Get full message details including body, attachments, headers

    Path Parameters:
    - account_id: str - Account ID
    - message_id: str - Message ID

    Returns:
    {
        "messageId": "uuid",
        "accountId": "account_id",
        "folder": "Inbox",
        "subject": "Email subject",
        "from": "sender@example.com",
        "to": ["recipient@example.com"],
        "cc": ["cc@example.com"],
        "bcc": ["bcc@example.com"],
        "receivedAt": 1706033200000,
        "size": 2048,
        "isRead": false,
        "isStarred": false,
        "hasAttachments": true,
        "textBody": "Plain text body",
        "htmlBody": "<html>HTML body</html>",
        "headers": {
            "messageId": "<unique-id@domain.com>",
            "inReplyTo": "<original-id@domain.com>",
            "references": ["<ref1@domain.com>", "<ref2@domain.com>"]
        },
        "attachments": [
            {
                "attachmentId": "uuid",
                "filename": "document.pdf",
                "contentType": "application/pdf",
                "size": 1024,
                "url": "/api/accounts/{id}/messages/{msgId}/attachments/{attachId}/download"
            }
        ],
        "threadId": "uuid",
        "replyTo": "uuid",
        "createdAt": 1706033200000,
        "updatedAt": 1706033200000
    }
    """
    try:
        msg = email_messages.get(message_id)

        if not msg:
            return {
                'error': 'Not found',
                'message': f'Message {message_id} not found'
            }, 404

        # Verify ownership
        if (msg.get('accountId') != account_id or
            msg.get('tenantId') != tenant_id or
            msg.get('userId') != user_id):
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this message'
            }, 403

        # Mark as read (side effect)
        if message_id not in message_flags:
            message_flags[message_id] = {}
        message_flags[message_id]['isRead'] = True

        # Add flags to response
        flags = message_flags.get(message_id, {})
        msg['isRead'] = flags.get('isRead', False)
        msg['isStarred'] = flags.get('isStarred', False)

        return msg, 200
    except Exception as e:
        return {
            'error': 'Failed to get message',
            'message': str(e)
        }, 500


@messages_bp.route('/<account_id>/messages', methods=['POST'])
@validate_auth
def send_message(account_id: str, tenant_id: str, user_id: str):
    """
    Send a new email message via SMTP

    Path Parameters:
    - account_id: str - Account ID to send from

    Request Body:
    {
        "to": ["recipient@example.com"],
        "cc": ["cc@example.com"],
        "bcc": ["bcc@example.com"],
        "subject": "Email subject",
        "textBody": "Plain text body",
        "htmlBody": "<html>HTML body</html>",
        "attachments": [
            {
                "filename": "document.pdf",
                "contentType": "application/pdf",
                "data": "base64-encoded-data",
                "size": 1024
            }
        ],
        "inReplyTo": "message-uuid",  # optional - for replies
        "threadId": "thread-uuid",  # optional - for threading
        "sendAt": 1706033200000,  # optional - schedule for later
        "requestReceiptNotification": false  # optional - read receipt
    }

    Returns:
    {
        "messageId": "uuid",
        "accountId": "account_id",
        "status": "sending|sent|scheduled|failed",
        "sentAt": 1706033200000,
        "subject": "Email subject",
        "to": ["recipient@example.com"],
        "taskId": "celery-task-uuid"  # for async tracking
    }
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['to', 'subject']
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return {
                'error': 'Missing required fields',
                'message': f'Missing: {", ".join(missing_fields)}'
            }, 400

        # Validate recipient lists
        to_list = data.get('to', [])
        if not isinstance(to_list, list) or len(to_list) == 0:
            return {
                'error': 'Invalid request',
                'message': 'to must be a non-empty list'
            }, 400

        message_id = str(uuid.uuid4())
        task_id = str(uuid.uuid4())
        now = int(datetime.utcnow().timestamp() * 1000)

        # Determine status
        send_at = data.get('sendAt')
        if send_at and send_at > now:
            status = 'scheduled'
        else:
            status = 'sending'

        # Create message
        message = {
            'messageId': message_id,
            'accountId': account_id,
            'tenantId': tenant_id,
            'userId': user_id,
            'folder': 'Sent',
            'to': to_list,
            'cc': data.get('cc', []),
            'bcc': data.get('bcc', []),
            'subject': data['subject'],
            'textBody': data.get('textBody', ''),
            'htmlBody': data.get('htmlBody', ''),
            'attachments': data.get('attachments', []),
            'receivedAt': now,
            'size': len(data.get('htmlBody', '') or data.get('textBody', '')),
            'headers': {
                'inReplyTo': data.get('inReplyTo'),
                'requestReceiptNotification': data.get('requestReceiptNotification', False)
            },
            'threadId': data.get('threadId'),
            'replyTo': data.get('inReplyTo'),
            'status': status,
            'sentAt': None if status != 'sent' else now,
            'sendAt': send_at,
            'taskId': task_id,
            'isDeleted': False,
            'createdAt': now,
            'updatedAt': now
        }

        email_messages[message_id] = message

        # TODO: In production, dispatch Celery SMTP task
        # from ..tasks import send_email_task
        # send_email_task.apply_async(
        #     args=[account_id, message_id],
        #     task_id=task_id,
        #     eta=datetime.fromtimestamp(send_at / 1000) if send_at else None
        # )

        response_status = 202 if status in ['scheduled', 'sending'] else 201

        return {
            'messageId': message_id,
            'accountId': account_id,
            'status': status,
            'sentAt': message['sentAt'],
            'subject': message['subject'],
            'to': to_list,
            'taskId': task_id
        }, response_status
    except Exception as e:
        return {
            'error': 'Failed to send message',
            'message': str(e)
        }, 500


@messages_bp.route('/<account_id>/messages/<message_id>', methods=['PUT'])
@validate_auth
def update_message_flags(account_id: str, message_id: str, tenant_id: str, user_id: str):
    """
    Update message flags (read, starred, spam, etc)

    Path Parameters:
    - account_id: str - Account ID
    - message_id: str - Message ID

    Request Body:
    {
        "isRead": true,
        "isStarred": true,
        "isSpam": false,
        "isArchived": false,
        "folder": "Archive"  # Move to folder
    }

    Returns:
    {
        "messageId": "uuid",
        "accountId": "account_id",
        "isRead": true,
        "isStarred": true,
        "isSpam": false,
        "isArchived": false,
        "folder": "Archive",
        "updatedAt": 1706033200000
    }
    """
    try:
        msg = email_messages.get(message_id)

        if not msg:
            return {
                'error': 'Not found',
                'message': f'Message {message_id} not found'
            }, 404

        # Verify ownership
        if (msg.get('accountId') != account_id or
            msg.get('tenantId') != tenant_id or
            msg.get('userId') != user_id):
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this message'
            }, 403

        data = request.get_json() or {}

        # Initialize flags if not exists
        if message_id not in message_flags:
            message_flags[message_id] = {}

        flags = message_flags[message_id]

        # Update flags
        if 'isRead' in data:
            flags['isRead'] = data['isRead']
        if 'isStarred' in data:
            flags['isStarred'] = data['isStarred']
        if 'isSpam' in data:
            flags['isSpam'] = data['isSpam']
        if 'isArchived' in data:
            flags['isArchived'] = data['isArchived']

        # Update folder if provided
        if 'folder' in data:
            msg['folder'] = data['folder']

        now = int(datetime.utcnow().timestamp() * 1000)
        msg['updatedAt'] = now

        return {
            'messageId': message_id,
            'accountId': account_id,
            'isRead': flags.get('isRead', False),
            'isStarred': flags.get('isStarred', False),
            'isSpam': flags.get('isSpam', False),
            'isArchived': flags.get('isArchived', False),
            'folder': msg.get('folder'),
            'updatedAt': now
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to update message',
            'message': str(e)
        }, 500


@messages_bp.route('/<account_id>/messages/<message_id>', methods=['DELETE'])
@validate_auth
def delete_message(account_id: str, message_id: str, tenant_id: str, user_id: str):
    """
    Delete message (soft delete - marked isDeleted)

    Path Parameters:
    - account_id: str - Account ID
    - message_id: str - Message ID

    Query Parameters:
    - permanent: bool (optional, default false) - Hard delete if true

    Returns:
    {
        "message": "Message deleted successfully",
        "messageId": "uuid",
        "permanent": false
    }
    """
    try:
        msg = email_messages.get(message_id)

        if not msg:
            return {
                'error': 'Not found',
                'message': f'Message {message_id} not found'
            }, 404

        # Verify ownership
        if (msg.get('accountId') != account_id or
            msg.get('tenantId') != tenant_id or
            msg.get('userId') != user_id):
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this message'
            }, 403

        permanent = request.args.get('permanent', 'false').lower() == 'true'

        if permanent:
            # Hard delete
            del email_messages[message_id]
            if message_id in message_flags:
                del message_flags[message_id]
        else:
            # Soft delete
            msg['isDeleted'] = True
            msg['updatedAt'] = int(datetime.utcnow().timestamp() * 1000)

        return {
            'message': 'Message deleted successfully',
            'messageId': message_id,
            'permanent': permanent
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to delete message',
            'message': str(e)
        }, 500


@messages_bp.route('/<account_id>/messages/search', methods=['GET'])
@validate_auth
def search_messages(account_id: str, tenant_id: str, user_id: str):
    """
    Full-text search across messages

    Path Parameters:
    - account_id: str - Account ID

    Query Parameters:
    - q: str (required) - Search query
    - searchIn: str (optional, default "all") - all, subject, body, from, to
    - page: int (default 1) - Page number
    - limit: int (default 20) - Items per page
    - folder: str (optional) - Search within folder
    - dateFrom: int (optional) - Search from date (unix timestamp ms)
    - dateTo: int (optional) - Search to date (unix timestamp ms)

    Returns:
    {
        "results": [
            {
                "messageId": "uuid",
                "accountId": "account_id",
                "folder": "Inbox",
                "subject": "Matching subject",
                "from": "sender@example.com",
                "preview": "Matching preview with query highlighted...",
                "score": 0.95,
                "receivedAt": 1706033200000,
                "isRead": false,
                "isStarred": false
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 5,
            "totalPages": 1,
            "hasNextPage": false,
            "hasPreviousPage": false
        },
        "query": "search terms",
        "matchCount": 5
    }
    """
    try:
        query = request.args.get('q', '').strip().lower()
        if not query:
            return {
                'error': 'Missing required parameter',
                'message': 'q (search query) is required'
            }, 400

        search_in = request.args.get('searchIn', 'all').lower()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        folder = request.args.get('folder')
        date_from = request.args.get('dateFrom', type=int)
        date_to = request.args.get('dateTo', type=int)

        # Filter messages by account, tenant, user
        candidates = [
            msg for msg in email_messages.values()
            if msg.get('accountId') == account_id and
               msg.get('tenantId') == tenant_id and
               msg.get('userId') == user_id and
               not msg.get('isDeleted', False)
        ]

        # Apply folder filter
        if folder:
            candidates = [m for m in candidates if m.get('folder') == folder]

        # Apply date filters
        if date_from:
            candidates = [m for m in candidates if m.get('receivedAt', 0) >= date_from]
        if date_to:
            candidates = [m for m in candidates if m.get('receivedAt', 0) <= date_to]

        # Search
        results = []
        for msg in candidates:
            score = 0
            match = False

            # Check subject
            if search_in in ['all', 'subject'] and query in msg.get('subject', '').lower():
                score += 1.0
                match = True

            # Check body
            if search_in in ['all', 'body']:
                text_body = msg.get('textBody', '').lower()
                html_body = msg.get('htmlBody', '').lower()
                if query in text_body or query in html_body:
                    score += 0.8
                    match = True

            # Check from
            if search_in in ['all', 'from'] and query in msg.get('from', '').lower():
                score += 0.9
                match = True

            # Check to
            if search_in in ['all', 'to']:
                to_list = msg.get('to', [])
                if any(query in t.lower() for t in to_list):
                    score += 0.9
                    match = True

            if match:
                results.append({
                    'messageId': msg['messageId'],
                    'accountId': msg['accountId'],
                    'folder': msg.get('folder'),
                    'subject': msg.get('subject'),
                    'from': msg.get('from'),
                    'preview': (msg.get('textBody', '') or msg.get('htmlBody', ''))[:100],
                    'score': score,
                    'receivedAt': msg.get('receivedAt'),
                    'isRead': message_flags.get(msg['messageId'], {}).get('isRead', False),
                    'isStarred': message_flags.get(msg['messageId'], {}).get('isStarred', False)
                })

        # Sort by score (relevance)
        results.sort(key=lambda x: x['score'], reverse=True)

        # Paginate
        paginated, pagination = paginate_results(results, page, limit)

        return {
            'results': paginated,
            'pagination': pagination,
            'query': query,
            'matchCount': len(results)
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to search messages',
            'message': str(e)
        }, 500


@messages_bp.route('/<account_id>/messages/batch/flags', methods=['PUT'])
@validate_auth
def update_batch_flags(account_id: str, tenant_id: str, user_id: str):
    """
    Update flags on multiple messages at once

    Path Parameters:
    - account_id: str - Account ID

    Request Body:
    {
        "messageIds": ["uuid1", "uuid2", "uuid3"],
        "isRead": true,
        "isStarred": false,
        "folder": "Archive"
    }

    Returns:
    {
        "updatedCount": 3,
        "failedCount": 0,
        "message": "Updated 3 messages successfully",
        "failed": []
    }
    """
    try:
        data = request.get_json()

        message_ids = data.get('messageIds', [])
        if not isinstance(message_ids, list) or len(message_ids) == 0:
            return {
                'error': 'Invalid request',
                'message': 'messageIds must be a non-empty list'
            }, 400

        now = int(datetime.utcnow().timestamp() * 1000)
        updated_count = 0
        failed_count = 0
        failed = []

        for msg_id in message_ids:
            msg = email_messages.get(msg_id)

            # Verify ownership
            if not msg or (msg.get('accountId') != account_id or
                          msg.get('tenantId') != tenant_id or
                          msg.get('userId') != user_id):
                failed.append({
                    'messageId': msg_id,
                    'error': 'Not found or forbidden'
                })
                failed_count += 1
                continue

            # Update flags
            if msg_id not in message_flags:
                message_flags[msg_id] = {}

            flags = message_flags[msg_id]

            if 'isRead' in data:
                flags['isRead'] = data['isRead']
            if 'isStarred' in data:
                flags['isStarred'] = data['isStarred']
            if 'folder' in data:
                msg['folder'] = data['folder']

            msg['updatedAt'] = now
            updated_count += 1

        return {
            'updatedCount': updated_count,
            'failedCount': failed_count,
            'message': f'Updated {updated_count} messages successfully',
            'failed': failed
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to update batch flags',
            'message': str(e)
        }, 500


@messages_bp.route('/<account_id>/messages/<message_id>/attachments/<attachment_id>/download', methods=['GET'])
@validate_auth
def download_attachment(account_id: str, message_id: str, attachment_id: str, tenant_id: str, user_id: str):
    """
    Download message attachment

    Path Parameters:
    - account_id: str - Account ID
    - message_id: str - Message ID
    - attachment_id: str - Attachment ID

    Returns:
    Binary attachment data with proper Content-Disposition header
    """
    try:
        msg = email_messages.get(message_id)

        if not msg:
            return {
                'error': 'Not found',
                'message': f'Message {message_id} not found'
            }, 404

        # Verify ownership
        if (msg.get('accountId') != account_id or
            msg.get('tenantId') != tenant_id or
            msg.get('userId') != user_id):
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this message'
            }, 403

        # Find attachment
        attachment = None
        for att in msg.get('attachments', []):
            if att.get('attachmentId') == attachment_id:
                attachment = att
                break

        if not attachment:
            return {
                'error': 'Not found',
                'message': f'Attachment {attachment_id} not found'
            }, 404

        # TODO: In production, download from S3/blob storage
        # For demo, return mock response
        return {
            'error': 'Not implemented',
            'message': 'Attachment download not yet implemented',
            'attachment': {
                'attachmentId': attachment_id,
                'filename': attachment.get('filename'),
                'contentType': attachment.get('contentType'),
                'size': attachment.get('size')
            }
        }, 501
    except Exception as e:
        return {
            'error': 'Failed to download attachment',
            'message': str(e)
        }, 500
