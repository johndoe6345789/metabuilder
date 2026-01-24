"""
Email Filters and Labels API Routes - Phase 7
Complete endpoint suite for email filter and label management:
- POST /api/v1/accounts/{id}/filters - Create filter rule
- GET /api/v1/accounts/{id}/filters - List filters
- PUT /api/v1/accounts/{id}/filters/{id} - Update filter
- DELETE /api/v1/accounts/{id}/filters/{id} - Delete filter
- POST /api/v1/accounts/{id}/labels - Create label
- GET /api/v1/accounts/{id}/labels - List labels
- PUT /api/v1/accounts/{id}/labels/{id} - Update label
- DELETE /api/v1/accounts/{id}/labels/{id} - Delete label
- POST /api/v1/accounts/{id}/filters/{id}/execute - Execute filter on existing messages

All endpoints require tenantId + userId authentication.
Request validation and comprehensive error responses.
Multi-tenant safe with row-level filtering.
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional, Tuple
import uuid
from datetime import datetime
import logging
from src.models import EmailFilter, EmailLabel, EmailFilterLabel, EmailMessage, EmailFolder, EmailAccount
from src.db import db
from src.middleware.auth import require_auth

logger = logging.getLogger(__name__)

filters_bp = Blueprint('filters', __name__)

# ============================================================================
# VALIDATION & HELPER FUNCTIONS
# ============================================================================

def validate_filter_creation(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email filter creation payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ['name', 'criteria', 'actions']
    missing_fields = [f for f in required_fields if f not in data or data[f] is None]
    if missing_fields:
        return False, f'Missing required fields: {", ".join(missing_fields)}'

    # Validate name
    if not isinstance(data.get('name'), str) or len(data['name'].strip()) == 0:
        return False, 'Filter name must be a non-empty string'

    # Validate criteria
    criteria = data.get('criteria')
    if not isinstance(criteria, dict):
        return False, 'Criteria must be a dictionary'

    valid_criteria_keys = {'from', 'to', 'subject', 'contains', 'date_range'}
    if not any(k in criteria for k in valid_criteria_keys):
        return False, f'At least one criteria must be specified: {", ".join(valid_criteria_keys)}'

    # Validate actions
    actions = data.get('actions')
    if not isinstance(actions, dict):
        return False, 'Actions must be a dictionary'

    valid_actions_keys = {'move_to_folder', 'mark_read', 'apply_labels', 'delete'}
    if not any(k in actions for k in valid_actions_keys):
        return False, f'At least one action must be specified: {", ".join(valid_actions_keys)}'

    # Validate specific action formats
    if 'apply_labels' in actions:
        labels = actions['apply_labels']
        if not isinstance(labels, list):
            return False, 'apply_labels must be a list of label IDs'

    if 'move_to_folder' in actions:
        folder = actions['move_to_folder']
        if not isinstance(folder, str) or len(folder) == 0:
            return False, 'move_to_folder must be a non-empty folder ID'

    # Validate order if provided
    if 'order' in data:
        try:
            order = int(data['order'])
            if order < 0:
                return False, 'Order must be a non-negative integer'
        except (ValueError, TypeError):
            return False, 'Order must be a valid integer'

    return True, None


def validate_filter_update(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email filter update payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    # All fields are optional on update, but validate if provided
    if 'name' in data:
        if not isinstance(data['name'], str) or len(data['name'].strip()) == 0:
            return False, 'Filter name must be a non-empty string'

    if 'criteria' in data:
        criteria = data['criteria']
        if not isinstance(criteria, dict):
            return False, 'Criteria must be a dictionary'
        valid_criteria_keys = {'from', 'to', 'subject', 'contains', 'date_range'}
        if not any(k in criteria for k in valid_criteria_keys):
            return False, f'At least one criteria must be specified: {", ".join(valid_criteria_keys)}'

    if 'actions' in data:
        actions = data['actions']
        if not isinstance(actions, dict):
            return False, 'Actions must be a dictionary'
        valid_actions_keys = {'move_to_folder', 'mark_read', 'apply_labels', 'delete'}
        if not any(k in actions for k in valid_actions_keys):
            return False, f'At least one action must be specified: {", ".join(valid_actions_keys)}'

    if 'order' in data:
        try:
            order = int(data['order'])
            if order < 0:
                return False, 'Order must be a non-negative integer'
        except (ValueError, TypeError):
            return False, 'Order must be a valid integer'

    return True, None


def validate_label_creation(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email label creation payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = ['name']
    missing_fields = [f for f in required_fields if f not in data or data[f] is None]
    if missing_fields:
        return False, f'Missing required fields: {", ".join(missing_fields)}'

    # Validate name
    if not isinstance(data.get('name'), str) or len(data['name'].strip()) == 0:
        return False, 'Label name must be a non-empty string'

    # Validate color if provided
    if 'color' in data and data['color']:
        color = data['color']
        if not isinstance(color, str) or not color.startswith('#') or len(color) != 7:
            return False, 'Color must be a hex color code (#RRGGBB)'

    # Validate order if provided
    if 'order' in data:
        try:
            order = int(data['order'])
            if order < 0:
                return False, 'Order must be a non-negative integer'
        except (ValueError, TypeError):
            return False, 'Order must be a valid integer'

    return True, None


def validate_label_update(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate email label update payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    if 'name' in data:
        if not isinstance(data['name'], str) or len(data['name'].strip()) == 0:
            return False, 'Label name must be a non-empty string'

    if 'color' in data and data['color']:
        color = data['color']
        if not isinstance(color, str) or not color.startswith('#') or len(color) != 7:
            return False, 'Color must be a hex color code (#RRGGBB)'

    if 'order' in data:
        try:
            order = int(data['order'])
            if order < 0:
                return False, 'Order must be a non-negative integer'
        except (ValueError, TypeError):
            return False, 'Order must be a valid integer'

    return True, None


def matches_filter_criteria(message: EmailMessage, criteria: Dict[str, Any]) -> bool:
    """
    Check if a message matches filter criteria

    Args:
        message: EmailMessage to check
        criteria: Filter criteria dictionary

    Returns:
        True if message matches all criteria
    """
    # Check 'from' criteria
    if 'from' in criteria:
        from_pattern = criteria['from'].lower()
        if from_pattern not in message.from_address.lower():
            return False

    # Check 'to' criteria
    if 'to' in criteria:
        to_pattern = criteria['to'].lower()
        if to_pattern not in message.to_addresses.lower():
            return False

    # Check 'subject' criteria
    if 'subject' in criteria:
        subject_pattern = criteria['subject'].lower()
        if subject_pattern not in message.subject.lower():
            return False

    # Check 'contains' criteria (body search)
    if 'contains' in criteria:
        search_pattern = criteria['contains'].lower()
        body = (message.body or '').lower()
        if search_pattern not in body:
            return False

    # Check 'date_range' criteria
    if 'date_range' in criteria:
        date_range = criteria['date_range']
        if isinstance(date_range, dict):
            start_ms = date_range.get('start')
            end_ms = date_range.get('end')
            if start_ms and message.received_at < start_ms:
                return False
            if end_ms and message.received_at > end_ms:
                return False

    return True


def apply_filter_actions(message: EmailMessage, filter_rule: EmailFilter, tenant_id: str) -> None:
    """
    Apply filter actions to a message

    Args:
        message: EmailMessage to apply actions to
        filter_rule: EmailFilter with actions to apply
        tenant_id: Tenant ID for multi-tenant safety
    """
    actions = filter_rule.actions

    # Apply mark_read action
    if actions.get('mark_read'):
        message.is_read = True

    # Apply delete action
    if actions.get('delete'):
        message.is_deleted = True

    # Apply move_to_folder action
    if 'move_to_folder' in actions:
        folder_id = actions['move_to_folder']
        target_folder = EmailFolder.query.filter_by(
            id=folder_id,
            tenant_id=tenant_id,
            account_id=message.email_folder.account_id
        ).first()
        if target_folder:
            message.folder_id = folder_id

    # Apply labels action
    if 'apply_labels' in actions:
        label_ids = actions['apply_labels']
        for label_id in label_ids:
            label = EmailLabel.get_by_id(label_id, tenant_id)
            if label and label not in message.labels:
                message.labels.append(label)

    message.updated_at = int(datetime.utcnow().timestamp() * 1000)


# ============================================================================
# FILTER ENDPOINTS
# ============================================================================

@filters_bp.route('/v1/accounts/<account_id>/filters', methods=['POST'])
@require_auth
def create_filter(account_id: str, tenant_id: str, user_id: str):
    """
    Create a new email filter rule

    POST /api/v1/accounts/{id}/filters
    {
        "name": "Work Emails",
        "description": "Filter emails from work",
        "criteria": {
            "from": "@company.com"
        },
        "actions": {
            "move_to_folder": "folder-id",
            "apply_labels": ["label-id-1"]
        },
        "order": 0,
        "isEnabled": true,
        "applyToNew": true,
        "applyToExisting": false
    }

    Returns:
        201: Created filter with ID and timestamps
        400: Invalid input
        404: Account not found
        401: Unauthorized
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Bad request', 'message': 'Request body is required'}), 400

        # Validate input
        is_valid, error_msg = validate_filter_creation(data)
        if not is_valid:
            return jsonify({'error': 'Bad request', 'message': error_msg}), 400

        # Verify account exists and belongs to tenant
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        now = int(datetime.utcnow().timestamp() * 1000)

        # Create filter
        filter_rule = EmailFilter(
            id=str(uuid.uuid4()),
            account_id=account_id,
            tenant_id=tenant_id,
            name=data['name'].strip(),
            description=data.get('description', '').strip(),
            criteria=data['criteria'],
            actions=data['actions'],
            order=data.get('order', 0),
            is_enabled=data.get('isEnabled', True),
            apply_to_new=data.get('applyToNew', True),
            apply_to_existing=data.get('applyToExisting', False),
            created_at=now,
            updated_at=now,
        )

        db.session.add(filter_rule)
        db.session.commit()

        logger.info(f'Created filter {filter_rule.id} for account {account_id}')

        return jsonify({
            'id': filter_rule.id,
            'accountId': filter_rule.account_id,
            'name': filter_rule.name,
            'description': filter_rule.description,
            'criteria': filter_rule.criteria,
            'actions': filter_rule.actions,
            'order': filter_rule.order,
            'isEnabled': filter_rule.is_enabled,
            'applyToNew': filter_rule.apply_to_new,
            'applyToExisting': filter_rule.apply_to_existing,
            'createdAt': filter_rule.created_at,
            'updatedAt': filter_rule.updated_at,
        }), 201

    except Exception as e:
        logger.error(f'Error creating filter: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/filters', methods=['GET'])
@require_auth
def list_filters(account_id: str, tenant_id: str, user_id: str):
    """
    List all email filters for an account

    GET /api/v1/accounts/{id}/filters?enabled=true

    Query parameters:
        enabled (optional): Filter by enabled status (true/false)

    Returns:
        200: List of filters
        404: Account not found
        401: Unauthorized
    """
    try:
        # Verify account exists and belongs to tenant
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        # Get enabled parameter
        enabled_param = request.args.get('enabled')
        enabled_only = enabled_param and enabled_param.lower() == 'true'

        filters = EmailFilter.list_by_account(account_id, tenant_id, enabled_only=enabled_only)

        return jsonify({
            'filters': [f.to_dict() for f in filters],
            'total': len(filters),
        }), 200

    except Exception as e:
        logger.error(f'Error listing filters: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/filters/<filter_id>', methods=['GET'])
@require_auth
def get_filter(account_id: str, filter_id: str, tenant_id: str, user_id: str):
    """
    Get a specific email filter

    GET /api/v1/accounts/{id}/filters/{filter_id}

    Returns:
        200: Filter details
        404: Filter not found
        401: Unauthorized
    """
    try:
        # Verify account exists
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        filter_rule = EmailFilter.query.filter_by(
            id=filter_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()
        if not filter_rule:
            return jsonify({'error': 'Not found', 'message': 'Filter not found'}), 404

        return jsonify(filter_rule.to_dict()), 200

    except Exception as e:
        logger.error(f'Error getting filter: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/filters/<filter_id>', methods=['PUT'])
@require_auth
def update_filter(account_id: str, filter_id: str, tenant_id: str, user_id: str):
    """
    Update an email filter

    PUT /api/v1/accounts/{id}/filters/{filter_id}
    {
        "name": "Updated Filter Name",
        "criteria": { ... },
        "actions": { ... },
        "isEnabled": false,
        "order": 1
    }

    Returns:
        200: Updated filter
        400: Invalid input
        404: Filter not found
        401: Unauthorized
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Bad request', 'message': 'Request body is required'}), 400

        # Validate input
        is_valid, error_msg = validate_filter_update(data)
        if not is_valid:
            return jsonify({'error': 'Bad request', 'message': error_msg}), 400

        # Verify account exists
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        filter_rule = EmailFilter.query.filter_by(
            id=filter_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()
        if not filter_rule:
            return jsonify({'error': 'Not found', 'message': 'Filter not found'}), 404

        # Update fields
        if 'name' in data:
            filter_rule.name = data['name'].strip()
        if 'description' in data:
            filter_rule.description = data['description'].strip()
        if 'criteria' in data:
            filter_rule.criteria = data['criteria']
        if 'actions' in data:
            filter_rule.actions = data['actions']
        if 'order' in data:
            filter_rule.order = data['order']
        if 'isEnabled' in data:
            filter_rule.is_enabled = data['isEnabled']
        if 'applyToNew' in data:
            filter_rule.apply_to_new = data['applyToNew']
        if 'applyToExisting' in data:
            filter_rule.apply_to_existing = data['applyToExisting']

        filter_rule.updated_at = int(datetime.utcnow().timestamp() * 1000)
        db.session.commit()

        logger.info(f'Updated filter {filter_id}')

        return jsonify(filter_rule.to_dict()), 200

    except Exception as e:
        logger.error(f'Error updating filter: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/filters/<filter_id>', methods=['DELETE'])
@require_auth
def delete_filter(account_id: str, filter_id: str, tenant_id: str, user_id: str):
    """
    Delete an email filter

    DELETE /api/v1/accounts/{id}/filters/{filter_id}

    Returns:
        204: No content (successful deletion)
        404: Filter not found
        401: Unauthorized
    """
    try:
        # Verify account exists
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        filter_rule = EmailFilter.query.filter_by(
            id=filter_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()
        if not filter_rule:
            return jsonify({'error': 'Not found', 'message': 'Filter not found'}), 404

        db.session.delete(filter_rule)
        db.session.commit()

        logger.info(f'Deleted filter {filter_id}')

        return '', 204

    except Exception as e:
        logger.error(f'Error deleting filter: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/filters/<filter_id>/execute', methods=['POST'])
@require_auth
def execute_filter(account_id: str, filter_id: str, tenant_id: str, user_id: str):
    """
    Execute a filter rule on existing messages

    POST /api/v1/accounts/{id}/filters/{filter_id}/execute
    {
        "folderIds": ["folder-id-1", "folder-id-2"],  # Optional: specific folders
        "dryRun": false  # Optional: simulate without applying
    }

    Returns:
        200: Execution results
        404: Filter not found
        401: Unauthorized
    """
    try:
        data = request.get_json() or {}

        # Verify account exists
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        filter_rule = EmailFilter.query.filter_by(
            id=filter_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()
        if not filter_rule:
            return jsonify({'error': 'Not found', 'message': 'Filter not found'}), 404

        # Get folder IDs to process
        folder_ids = data.get('folderIds', [])
        dry_run = data.get('dryRun', False)

        # Get all folders if none specified
        if not folder_ids:
            folders = EmailFolder.list_by_account(account_id, tenant_id)
            folder_ids = [f.id for f in folders]

        matched_count = 0
        applied_count = 0

        # Process messages in folders
        for folder_id in folder_ids:
            folder = EmailFolder.query.filter_by(
                id=folder_id,
                account_id=account_id,
                tenant_id=tenant_id
            ).first()
            if not folder:
                continue

            messages = EmailMessage.list_by_folder(
                folder_id,
                tenant_id,
                include_deleted=False,
                limit=10000  # Process up to 10k messages
            )

            for message in messages:
                if matches_filter_criteria(message, filter_rule.criteria):
                    matched_count += 1
                    if not dry_run:
                        apply_filter_actions(message, filter_rule, tenant_id)
                        applied_count += 1

        # Commit if not dry run
        if not dry_run and applied_count > 0:
            db.session.commit()
            logger.info(f'Applied filter {filter_id} to {applied_count} messages')

        return jsonify({
            'filterId': filter_id,
            'matchedCount': matched_count,
            'appliedCount': applied_count,
            'dryRun': dry_run,
        }), 200

    except Exception as e:
        logger.error(f'Error executing filter: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


# ============================================================================
# LABEL ENDPOINTS
# ============================================================================

@filters_bp.route('/v1/accounts/<account_id>/labels', methods=['POST'])
@require_auth
def create_label(account_id: str, tenant_id: str, user_id: str):
    """
    Create a new email label

    POST /api/v1/accounts/{id}/labels
    {
        "name": "Important",
        "color": "#FF0000",
        "description": "Important emails",
        "order": 0
    }

    Returns:
        201: Created label with ID and timestamps
        400: Invalid input
        404: Account not found
        401: Unauthorized
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Bad request', 'message': 'Request body is required'}), 400

        # Validate input
        is_valid, error_msg = validate_label_creation(data)
        if not is_valid:
            return jsonify({'error': 'Bad request', 'message': error_msg}), 400

        # Verify account exists and belongs to tenant
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        # Check for duplicate name
        existing = EmailLabel.query.filter_by(
            account_id=account_id,
            tenant_id=tenant_id,
            name=data['name'].strip()
        ).first()
        if existing:
            return jsonify({'error': 'Bad request', 'message': 'Label with this name already exists'}), 400

        now = int(datetime.utcnow().timestamp() * 1000)

        # Create label
        label = EmailLabel(
            id=str(uuid.uuid4()),
            account_id=account_id,
            tenant_id=tenant_id,
            name=data['name'].strip(),
            color=data.get('color', '#4285F4'),
            description=data.get('description', '').strip(),
            order=data.get('order', 0),
            created_at=now,
            updated_at=now,
        )

        db.session.add(label)
        db.session.commit()

        logger.info(f'Created label {label.id} for account {account_id}')

        return jsonify(label.to_dict()), 201

    except Exception as e:
        logger.error(f'Error creating label: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/labels', methods=['GET'])
@require_auth
def list_labels(account_id: str, tenant_id: str, user_id: str):
    """
    List all email labels for an account

    GET /api/v1/accounts/{id}/labels

    Returns:
        200: List of labels
        404: Account not found
        401: Unauthorized
    """
    try:
        # Verify account exists and belongs to tenant
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        labels = EmailLabel.list_by_account(account_id, tenant_id)

        return jsonify({
            'labels': [l.to_dict() for l in labels],
            'total': len(labels),
        }), 200

    except Exception as e:
        logger.error(f'Error listing labels: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/labels/<label_id>', methods=['GET'])
@require_auth
def get_label(account_id: str, label_id: str, tenant_id: str, user_id: str):
    """
    Get a specific email label

    GET /api/v1/accounts/{id}/labels/{label_id}

    Returns:
        200: Label details
        404: Label not found
        401: Unauthorized
    """
    try:
        # Verify account exists
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        label = EmailLabel.query.filter_by(
            id=label_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()
        if not label:
            return jsonify({'error': 'Not found', 'message': 'Label not found'}), 404

        return jsonify(label.to_dict()), 200

    except Exception as e:
        logger.error(f'Error getting label: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/labels/<label_id>', methods=['PUT'])
@require_auth
def update_label(account_id: str, label_id: str, tenant_id: str, user_id: str):
    """
    Update an email label

    PUT /api/v1/accounts/{id}/labels/{label_id}
    {
        "name": "Important",
        "color": "#FF0000",
        "description": "Important emails",
        "order": 0
    }

    Returns:
        200: Updated label
        400: Invalid input or duplicate name
        404: Label not found
        401: Unauthorized
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Bad request', 'message': 'Request body is required'}), 400

        # Validate input
        is_valid, error_msg = validate_label_update(data)
        if not is_valid:
            return jsonify({'error': 'Bad request', 'message': error_msg}), 400

        # Verify account exists
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        label = EmailLabel.query.filter_by(
            id=label_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()
        if not label:
            return jsonify({'error': 'Not found', 'message': 'Label not found'}), 404

        # Check for duplicate name if updating name
        if 'name' in data and data['name'] != label.name:
            existing = EmailLabel.query.filter_by(
                account_id=account_id,
                tenant_id=tenant_id,
                name=data['name'].strip()
            ).first()
            if existing:
                return jsonify({'error': 'Bad request', 'message': 'Label with this name already exists'}), 400

        # Update fields
        if 'name' in data:
            label.name = data['name'].strip()
        if 'color' in data:
            label.color = data['color']
        if 'description' in data:
            label.description = data['description'].strip()
        if 'order' in data:
            label.order = data['order']

        label.updated_at = int(datetime.utcnow().timestamp() * 1000)
        db.session.commit()

        logger.info(f'Updated label {label_id}')

        return jsonify(label.to_dict()), 200

    except Exception as e:
        logger.error(f'Error updating label: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


@filters_bp.route('/v1/accounts/<account_id>/labels/<label_id>', methods=['DELETE'])
@require_auth
def delete_label(account_id: str, label_id: str, tenant_id: str, user_id: str):
    """
    Delete an email label

    DELETE /api/v1/accounts/{id}/labels/{label_id}

    Returns:
        204: No content (successful deletion)
        404: Label not found
        401: Unauthorized
    """
    try:
        # Verify account exists
        account = EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()
        if not account:
            return jsonify({'error': 'Not found', 'message': 'Account not found'}), 404

        label = EmailLabel.query.filter_by(
            id=label_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()
        if not label:
            return jsonify({'error': 'Not found', 'message': 'Label not found'}), 404

        db.session.delete(label)
        db.session.commit()

        logger.info(f'Deleted label {label_id}')

        return '', 204

    except Exception as e:
        logger.error(f'Error deleting label: {e}', exc_info=True)
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500
