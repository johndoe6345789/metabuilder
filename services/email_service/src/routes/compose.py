"""
Email Compose API Routes
- POST /compose - Send email via SMTP
- GET /drafts - List draft emails
- PUT /drafts/{id} - Update draft
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime

compose_bp = Blueprint('compose', __name__)

# In-memory storage for drafts (replace with DBAL in production)
drafts: Dict[str, Dict[str, Any]] = {}
sent_emails: Dict[str, Dict[str, Any]] = {}

@compose_bp.route('', methods=['POST'])
def send_email():
    """
    Send email via SMTP

    Request Body:
    {
        "accountId": "uuid",
        "to": ["recipient@example.com"],
        "cc": ["cc@example.com"],
        "bcc": ["bcc@example.com"],
        "subject": "Email Subject",
        "textBody": "Plain text body",
        "htmlBody": "<html>HTML body</html>",
        "attachments": [
            {
                "filename": "file.pdf",
                "contentType": "application/pdf",
                "data": "base64-encoded-data"
            }
        ],
        "sendAt": 1706033200000  # optional - schedule for later
    }

    Returns:
    {
        "messageId": "uuid",
        "accountId": "uuid",
        "status": "sending|sent|scheduled",
        "sentAt": 1706033200000,
        "subject": "Email Subject"
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
        required_fields = ['accountId', 'to', 'subject']
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return {
                'error': 'Missing required fields',
                'message': f'Missing: {", ".join(missing_fields)}'
            }, 400

        # Validate recipient lists
        if not isinstance(data['to'], list) or len(data['to']) == 0:
            return {
                'error': 'Invalid request',
                'message': 'to must be a non-empty list'
            }, 400

        message_id = str(uuid.uuid4())
        now = int(datetime.utcnow().timestamp() * 1000)

        # Create email message
        email_message = {
            'messageId': message_id,
            'accountId': data['accountId'],
            'tenantId': tenant_id,
            'userId': user_id,
            'to': data['to'],
            'cc': data.get('cc', []),
            'bcc': data.get('bcc', []),
            'subject': data['subject'],
            'textBody': data.get('textBody', ''),
            'htmlBody': data.get('htmlBody', ''),
            'attachments': data.get('attachments', []),
            'sendAt': data.get('sendAt'),
            'sentAt': None,
            'status': 'scheduled' if data.get('sendAt') else 'sending',
            'createdAt': now,
            'updatedAt': now
        }

        # If send is scheduled
        if data.get('sendAt'):
            sent_emails[message_id] = email_message
            return {
                'messageId': message_id,
                'accountId': data['accountId'],
                'status': 'scheduled',
                'subject': email_message['subject'],
                'sendAt': email_message['sendAt']
            }, 202

        # TODO: In production, send via SMTP and update status
        # from .smtp_send import send_via_smtp
        # send_via_smtp(email_message)

        email_message['sentAt'] = now
        email_message['status'] = 'sent'
        sent_emails[message_id] = email_message

        return {
            'messageId': message_id,
            'accountId': data['accountId'],
            'status': email_message['status'],
            'sentAt': email_message['sentAt'],
            'subject': email_message['subject']
        }, 201
    except Exception as e:
        return {
            'error': 'Failed to send email',
            'message': str(e)
        }, 500

@compose_bp.route('/drafts', methods=['GET'])
def list_drafts():
    """
    List draft emails for user

    Query Parameters:
    - tenant_id: str (required)
    - user_id: str (required)
    - accountId: str (optional) - filter by account

    Returns:
    {
        "drafts": [
            {
                "draftId": "uuid",
                "accountId": "uuid",
                "to": ["recipient@example.com"],
                "cc": [],
                "subject": "Draft Subject",
                "textBody": "...",
                "htmlBody": "...",
                "createdAt": 1706033200000,
                "updatedAt": 1706033200000
            }
        ]
    }
    """
    try:
        tenant_id = request.args.get('tenant_id')
        user_id = request.args.get('user_id')
        account_id = request.args.get('accountId')

        if not tenant_id or not user_id:
            return {
                'error': 'Unauthorized',
                'message': 'tenant_id and user_id required'
            }, 401

        # Filter drafts by tenant_id and user_id
        filtered_drafts = [
            draft for draft in drafts.values()
            if draft.get('tenantId') == tenant_id and draft.get('userId') == user_id
        ]

        # Further filter by account if provided
        if account_id:
            filtered_drafts = [d for d in filtered_drafts if d.get('accountId') == account_id]

        return {
            'drafts': filtered_drafts
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to list drafts',
            'message': str(e)
        }, 500

@compose_bp.route('/drafts/<draft_id>', methods=['PUT'])
def update_draft(draft_id: str):
    """
    Update draft email

    Path Parameters:
    - draft_id: str - Draft ID

    Request Body:
    {
        "to": ["recipient@example.com"],
        "cc": [],
        "subject": "Updated Subject",
        "textBody": "Updated body",
        "htmlBody": "..."
    }

    Returns:
    {
        "draftId": "uuid",
        "accountId": "uuid",
        "to": ["recipient@example.com"],
        "subject": "Updated Subject",
        "updatedAt": 1706033200000
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

        draft = drafts.get(draft_id)
        if not draft:
            return {
                'error': 'Not found',
                'message': f'Draft {draft_id} not found'
            }, 404

        # Verify ownership
        if draft.get('tenantId') != tenant_id or draft.get('userId') != user_id:
            return {
                'error': 'Forbidden',
                'message': 'You do not have access to this draft'
            }, 403

        data = request.get_json()

        # Update draft fields
        if 'to' in data:
            draft['to'] = data['to']
        if 'cc' in data:
            draft['cc'] = data['cc']
        if 'bcc' in data:
            draft['bcc'] = data['bcc']
        if 'subject' in data:
            draft['subject'] = data['subject']
        if 'textBody' in data:
            draft['textBody'] = data['textBody']
        if 'htmlBody' in data:
            draft['htmlBody'] = data['htmlBody']
        if 'attachments' in data:
            draft['attachments'] = data['attachments']

        draft['updatedAt'] = int(datetime.utcnow().timestamp() * 1000)

        return {
            'draftId': draft_id,
            'accountId': draft['accountId'],
            'to': draft['to'],
            'cc': draft['cc'],
            'subject': draft['subject'],
            'updatedAt': draft['updatedAt']
        }, 200
    except Exception as e:
        return {
            'error': 'Failed to update draft',
            'message': str(e)
        }, 500

@compose_bp.route('/drafts', methods=['POST'])
def create_draft():
    """
    Create a new draft email

    Request Body:
    {
        "accountId": "uuid",
        "to": ["recipient@example.com"],
        "cc": [],
        "bcc": [],
        "subject": "Draft Subject",
        "textBody": "Plain text",
        "htmlBody": "HTML"
    }

    Returns:
    {
        "draftId": "uuid",
        "accountId": "uuid",
        "createdAt": 1706033200000
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

        if 'accountId' not in data:
            return {
                'error': 'Missing required fields',
                'message': 'accountId is required'
            }, 400

        draft_id = str(uuid.uuid4())
        now = int(datetime.utcnow().timestamp() * 1000)

        draft = {
            'draftId': draft_id,
            'accountId': data['accountId'],
            'tenantId': tenant_id,
            'userId': user_id,
            'to': data.get('to', []),
            'cc': data.get('cc', []),
            'bcc': data.get('bcc', []),
            'subject': data.get('subject', ''),
            'textBody': data.get('textBody', ''),
            'htmlBody': data.get('htmlBody', ''),
            'attachments': data.get('attachments', []),
            'createdAt': now,
            'updatedAt': now
        }

        drafts[draft_id] = draft

        return {
            'draftId': draft_id,
            'accountId': draft['accountId'],
            'createdAt': draft['createdAt']
        }, 201
    except Exception as e:
        return {
            'error': 'Failed to create draft',
            'message': str(e)
        }, 500
