"""
User Preferences API Routes - Phase 7
Complete endpoint suite for user preferences/settings management:
- GET /api/v1/users/:id/preferences - Get user settings
- PUT /api/v1/users/:id/preferences - Update settings

Preferences include:
- Theme (light/dark mode, accent color, density)
- Timezone and locale (date/time formats)
- Sync frequency and background sync options
- Notification preferences (new mail, sound, quiet hours)
- Privacy settings (read receipts, signature, vacation)
- Default folders and auto-filing rules
- Signature and template management
- Storage quota and auto-cleanup settings
- Accessibility options (screen reader, high contrast)
- Advanced settings (AI features, threading, telemetry)

All endpoints require tenantId + userId authentication.
Request validation and comprehensive error responses.
"""
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional, Tuple
import logging
from datetime import datetime
from src.models.preferences import UserPreferences
from src.db import db

logger = logging.getLogger(__name__)

preferences_bp = Blueprint('preferences', __name__)

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


def validate_user_id(user_id_param: str, auth_user_id: str, tenant_id: str) -> Tuple[bool, Optional[Tuple[Dict, int]]]:
    """
    Validate that authenticated user can access requested user's preferences
    Multi-tenant: users can only modify their own preferences

    Returns:
        Tuple of (is_valid, error_response)
        If valid, error_response is None
    """
    if user_id_param != auth_user_id:
        return False, ({
            'error': 'Forbidden',
            'message': 'Cannot access other users\' preferences'
        }, 403)

    return True, None


def validate_preferences_update(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate user preferences update payload

    Args:
        data: Request JSON data

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(data, dict):
        return False, 'Request body must be a JSON object'

    # Validate theme settings
    if 'theme' in data:
        theme = data['theme']
        if not isinstance(theme, dict):
            return False, 'theme must be an object'

        if 'mode' in theme and theme['mode'] not in ['light', 'dark', 'auto']:
            return False, 'theme.mode must be "light", "dark", or "auto"'

        if 'accentColor' in theme:
            color = theme['accentColor']
            if not isinstance(color, str) or not color.startswith('#') or len(color) != 7:
                return False, 'theme.accentColor must be hex color (e.g., #1976d2)'

        if 'messageDensity' in theme and theme['messageDensity'] not in ['compact', 'normal', 'spacious']:
            return False, 'theme.messageDensity must be "compact", "normal", or "spacious"'

        if 'fontSizePercent' in theme:
            size = theme['fontSizePercent']
            if not isinstance(size, int) or size < 80 or size > 150:
                return False, 'theme.fontSizePercent must be between 80 and 150'

    # Validate localization
    if 'localization' in data:
        loc = data['localization']
        if not isinstance(loc, dict):
            return False, 'localization must be an object'

        if 'timezone' in loc:
            tz = loc['timezone']
            if not isinstance(tz, str) or len(tz) < 1:
                return False, 'localization.timezone must be a non-empty string'

        if 'locale' in loc:
            locale = loc['locale']
            if not isinstance(locale, str) or len(locale) < 2:
                return False, 'localization.locale must be a valid locale string (e.g., en_US)'

    # Validate sync settings
    if 'sync' in data:
        sync = data['sync']
        if not isinstance(sync, dict):
            return False, 'sync must be an object'

        if 'frequencyMinutes' in sync:
            freq = sync['frequencyMinutes']
            if not isinstance(freq, int) or freq < 1 or freq > 1440:
                return False, 'sync.frequencyMinutes must be between 1 and 1440'

        if 'scope' in sync and sync['scope'] not in ['all', 'last_30', 'last_90', 'last_180']:
            return False, 'sync.scope must be "all", "last_30", "last_90", or "last_180"'

        if 'daysBack' in sync:
            days = sync['daysBack']
            if not isinstance(days, int) or days < 1 or days > 365:
                return False, 'sync.daysBack must be between 1 and 365'

    # Validate notification settings
    if 'notifications' in data:
        notif = data['notifications']
        if not isinstance(notif, dict):
            return False, 'notifications must be an object'

        if 'quietHoursEnabled' in notif and notif['quietHoursEnabled']:
            start = notif.get('quietHoursStart')
            end = notif.get('quietHoursEnd')
            if not start or not end:
                return False, 'quietHoursStart and quietHoursEnd required if quietHoursEnabled'
            if not isinstance(start, str) or not isinstance(end, str):
                return False, 'quietHoursStart and quietHoursEnd must be HH:MM format strings'

        if 'categories' in notif:
            if not isinstance(notif['categories'], dict):
                return False, 'notifications.categories must be an object'

    # Validate signature
    if 'signature' in data:
        sig = data['signature']
        if not isinstance(sig, dict):
            return False, 'signature must be an object'

        if sig.get('enabled'):
            # At least one of text or html should be present
            text = sig.get('text', '').strip()
            html = sig.get('html', '').strip()
            if not text and not html:
                return False, 'signature text or html required when enabled'

    # Validate privacy settings
    if 'privacy' in data:
        priv = data['privacy']
        if not isinstance(priv, dict):
            return False, 'privacy must be an object'

        if priv.get('vacationModeEnabled'):
            msg = priv.get('vacationMessage', '').strip()
            if not msg:
                return False, 'vacationMessage required when vacationModeEnabled'
            start = priv.get('vacationStartDate')
            end = priv.get('vacationEndDate')
            if not start or not end or start >= end:
                return False, 'Valid vacationStartDate and vacationEndDate required when enabled'

    # Validate storage settings
    if 'storage' in data:
        storage = data['storage']
        if not isinstance(storage, dict):
            return False, 'storage must be an object'

        if 'warningPercent' in storage:
            pct = storage['warningPercent']
            if not isinstance(pct, int) or pct < 1 or pct > 99:
                return False, 'storage.warningPercent must be between 1 and 99'

        if 'autoDeleteSpamDays' in storage:
            days = storage['autoDeleteSpamDays']
            if days is not None and (not isinstance(days, int) or days < 1):
                return False, 'storage.autoDeleteSpamDays must be positive integer or null'

        if 'autoDeleteTrashDays' in storage:
            days = storage['autoDeleteTrashDays']
            if days is not None and (not isinstance(days, int) or days < 1):
                return False, 'storage.autoDeleteTrashDays must be positive integer or null'

    # Validate folders
    if 'folders' in data:
        folders = data['folders']
        if not isinstance(folders, dict):
            return False, 'folders must be an object'

        if 'autoFileRules' in folders:
            if not isinstance(folders['autoFileRules'], list):
                return False, 'folders.autoFileRules must be an array'

    # Validate templates
    if 'templates' in data:
        templates = data['templates']
        if not isinstance(templates, dict):
            return False, 'templates must be an object'

        if 'quickReplyTemplates' in templates:
            if not isinstance(templates['quickReplyTemplates'], list):
                return False, 'templates.quickReplyTemplates must be an array'

        if 'forwardingRules' in templates:
            if not isinstance(templates['forwardingRules'], list):
                return False, 'templates.forwardingRules must be an array'

    # Validate advanced settings
    if 'advanced' in data:
        adv = data['advanced']
        if not isinstance(adv, dict):
            return False, 'advanced must be an object'

        if 'conversationThreadingStrategy' in adv:
            strategy = adv['conversationThreadingStrategy']
            if strategy not in ['auto', 'refs', 'subjects']:
                return False, 'advanced.conversationThreadingStrategy must be "auto", "refs", or "subjects"'

    return True, None


# ============================================================================
# ROUTE HANDLERS
# ============================================================================


@preferences_bp.route('/users/<user_id>/preferences', methods=['GET'])
def get_preferences(user_id: str):
    """
    Get user preferences

    GET /api/v1/users/:id/preferences

    Headers:
        X-Tenant-ID: <tenant_id> (required)
        X-User-ID: <authenticated_user_id> (required)

    Returns:
        200: UserPreferences object with all settings
        401: Missing or invalid authentication headers
        403: User attempting to access other user's preferences
        404: Preferences not found (unusual - should have defaults)
        500: Server error

    Example response:
        {
            "id": "pref-123",
            "tenantId": "tenant-1",
            "userId": "user-1",
            "version": 1,
            "theme": {
                "mode": "light",
                "accentColor": "#1976d2",
                ...
            },
            "localization": {...},
            "sync": {...},
            ...
        }
    """
    try:
        # Authenticate
        tenant_id, auth_user_id, error = authenticate_request()
        if error:
            return error[0], error[1]

        # Verify user can access their own preferences
        is_valid, error = validate_user_id(user_id, auth_user_id, tenant_id)
        if not is_valid:
            return error[0], error[1]

        # Get or create preferences
        preferences = UserPreferences.get_or_create(user_id, tenant_id)

        logger.info(f"Retrieved preferences for user {user_id} in tenant {tenant_id}")

        return jsonify({
            'status': 'success',
            'data': preferences.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error getting preferences: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@preferences_bp.route('/users/<user_id>/preferences', methods=['PUT'])
def update_preferences(user_id: str):
    """
    Update user preferences

    PUT /api/v1/users/:id/preferences

    Headers:
        X-Tenant-ID: <tenant_id> (required)
        X-User-ID: <authenticated_user_id> (required)
        Content-Type: application/json

    Body:
        {
            "theme": {
                "mode": "dark",
                "accentColor": "#2196f3",
                ...
            },
            "localization": {
                "timezone": "America/New_York",
                ...
            },
            ...
        }

    Returns:
        200: Updated UserPreferences object
        400: Invalid request payload
        401: Missing or invalid authentication headers
        403: User attempting to access other user's preferences
        404: User preferences not found
        409: Conflict (version mismatch for optimistic locking)
        500: Server error

    Example response:
        {
            "status": "success",
            "data": {
                "id": "pref-123",
                "version": 2,
                ...
            }
        }
    """
    try:
        # Authenticate
        tenant_id, auth_user_id, error = authenticate_request()
        if error:
            return error[0], error[1]

        # Verify user can modify their own preferences
        is_valid, error = validate_user_id(user_id, auth_user_id, tenant_id)
        if not is_valid:
            return error[0], error[1]

        # Get request body
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Bad request',
                'message': 'Request body required'
            }), 400

        # Validate payload
        is_valid, error_msg = validate_preferences_update(data)
        if not is_valid:
            return jsonify({
                'error': 'Bad request',
                'message': error_msg
            }), 400

        # Get existing preferences
        preferences = UserPreferences.get_by_user(user_id, tenant_id)
        if not preferences:
            # Create new preferences with updates
            preferences = UserPreferences(
                user_id=user_id,
                tenant_id=tenant_id
            )
            db.session.add(preferences)

        # Handle optimistic locking if version provided
        if 'version' in data:
            if preferences.version != data['version']:
                return jsonify({
                    'error': 'Conflict',
                    'message': f'Version mismatch: expected {preferences.version}, got {data["version"]}'
                }), 409

        # Update preferences
        preferences.update_from_dict(data)

        # Commit changes
        db.session.commit()

        logger.info(f"Updated preferences for user {user_id} in tenant {tenant_id}, new version {preferences.version}")

        return jsonify({
            'status': 'success',
            'data': preferences.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating preferences: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@preferences_bp.route('/users/<user_id>/preferences/reset', methods=['POST'])
def reset_preferences(user_id: str):
    """
    Reset user preferences to defaults

    POST /api/v1/users/:id/preferences/reset

    Headers:
        X-Tenant-ID: <tenant_id> (required)
        X-User-ID: <authenticated_user_id> (required)

    Returns:
        200: UserPreferences object with all defaults
        401: Missing or invalid authentication headers
        403: User attempting to modify other user's preferences
        404: User not found
        500: Server error

    Example response:
        {
            "status": "success",
            "data": {
                "id": "pref-123",
                "theme": {"mode": "light", ...},
                ...
            }
        }
    """
    try:
        # Authenticate
        tenant_id, auth_user_id, error = authenticate_request()
        if error:
            return error[0], error[1]

        # Verify user can modify their own preferences
        is_valid, error = validate_user_id(user_id, auth_user_id, tenant_id)
        if not is_valid:
            return error[0], error[1]

        # Get existing preferences
        preferences = UserPreferences.get_by_user(user_id, tenant_id)

        if preferences:
            # Mark as deleted (soft delete)
            preferences.is_deleted = True
            db.session.commit()

        # Create new preferences with defaults
        new_preferences = UserPreferences(
            user_id=user_id,
            tenant_id=tenant_id
        )
        db.session.add(new_preferences)
        db.session.commit()

        logger.info(f"Reset preferences for user {user_id} in tenant {tenant_id}")

        return jsonify({
            'status': 'success',
            'data': new_preferences.to_dict(),
            'message': 'Preferences reset to defaults'
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error resetting preferences: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@preferences_bp.route('/users/<user_id>/preferences/validate', methods=['POST'])
def validate_preferences(user_id: str):
    """
    Validate preferences payload without saving

    POST /api/v1/users/:id/preferences/validate

    Headers:
        X-Tenant-ID: <tenant_id> (required)
        X-User-ID: <authenticated_user_id> (required)
        Content-Type: application/json

    Body:
        {
            "theme": {...},
            "localization": {...},
            ...
        }

    Returns:
        200: Validation passed
        400: Validation failed (includes error message)
        401: Missing or invalid authentication headers
        403: User attempting to validate other user's preferences
        500: Server error

    Example response:
        {
            "status": "success",
            "valid": true,
            "message": "Preferences payload is valid"
        }
    """
    try:
        # Authenticate
        tenant_id, auth_user_id, error = authenticate_request()
        if error:
            return error[0], error[1]

        # Verify user can validate their own preferences
        is_valid, error = validate_user_id(user_id, auth_user_id, tenant_id)
        if not is_valid:
            return error[0], error[1]

        # Get request body
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Bad request',
                'message': 'Request body required'
            }), 400

        # Validate payload
        is_valid, error_msg = validate_preferences_update(data)
        if not is_valid:
            return jsonify({
                'status': 'success',
                'valid': False,
                'error': error_msg
            }), 200

        return jsonify({
            'status': 'success',
            'valid': True,
            'message': 'Preferences payload is valid'
        }), 200

    except Exception as e:
        logger.error(f"Error validating preferences: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500
