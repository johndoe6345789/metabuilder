"""
Flask-SocketIO integration for real-time notifications
Handles WebSocket connections, subscriptions, and event routing
"""
import logging
from typing import Optional
from flask import request
from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect

from src.handlers.websocket import (
    WebSocketConnection, WebSocketEventType, get_ws_manager,
    WebSocketMessage
)
from src.handlers.notification_events import NotificationEventEmitter
from src.models.notification import NotificationPreference

logger = logging.getLogger(__name__)

# Will be initialized by app
socketio: Optional[SocketIO] = None


def init_socketio(app):
    """Initialize Flask-SocketIO with the app"""
    global socketio
    socketio = SocketIO(
        app,
        cors_allowed_origins=['*'],
        async_mode='threading',
        ping_timeout=60,
        ping_interval=25,
    )

    # Register event handlers
    socketio.on_event('connect', on_connect)
    socketio.on_event('disconnect', on_disconnect)
    socketio.on_event('subscribe', on_subscribe)
    socketio.on_event('unsubscribe', on_unsubscribe)
    socketio.on_event('authenticate', on_authenticate)
    socketio.on_event('ping', on_ping)
    socketio.on_event('notification:read', on_notification_read)
    socketio.on_event('notification:archive', on_notification_archive)

    return socketio


# ============================================================================
# CONNECTION HANDLERS
# ============================================================================

def on_connect():
    """Handle WebSocket connection"""
    try:
        sid = request.sid
        logger.info(f"WebSocket client connected: {sid}")

        # Create connection object (not yet authenticated)
        conn = WebSocketConnection(
            sid=sid,
            user_id='anonymous',
            account_id='',
            tenant_id='',
        )

        # Add to manager
        ws_manager = get_ws_manager()
        ws_manager.add_connection(conn)

        # Request authentication
        emit('authenticate_required', {
            'message': 'Please provide authentication credentials'
        })

    except Exception as e:
        logger.error(f"Error in on_connect: {e}")
        disconnect()


def on_disconnect():
    """Handle WebSocket disconnection"""
    try:
        sid = request.sid
        logger.info(f"WebSocket client disconnected: {sid}")

        ws_manager = get_ws_manager()
        ws_manager.remove_connection(sid)

    except Exception as e:
        logger.error(f"Error in on_disconnect: {e}")


# ============================================================================
# AUTHENTICATION
# ============================================================================

def on_authenticate(data):
    """
    Authenticate WebSocket connection
    Expected data: {
        'userId': 'user123',
        'accountId': 'account123',
        'tenantId': 'tenant123',
        'token': 'jwt_token'  # Optional, for security
    }
    """
    try:
        sid = request.sid
        user_id = data.get('userId')
        account_id = data.get('accountId')
        tenant_id = data.get('tenantId')
        token = data.get('token')

        if not user_id or not account_id or not tenant_id:
            emit('authenticate_error', {
                'error': 'Missing required fields',
                'message': 'userId, accountId, and tenantId required'
            })
            return

        # TODO: Verify JWT token if provided

        # Update connection
        ws_manager = get_ws_manager()
        conn = ws_manager.get_connection(sid)

        if not conn:
            emit('authenticate_error', {
                'error': 'Connection not found',
                'message': 'Connection was lost'
            })
            return

        # Update connection with auth info
        conn.user_id = user_id
        conn.account_id = account_id
        conn.tenant_id = tenant_id
        conn.is_authenticated = True

        logger.info(f"WebSocket authenticated: {sid} (user: {user_id})")

        # Send pending messages
        pending = ws_manager.get_pending_messages(user_id)
        for msg in pending:
            emit(msg.event, msg.data)

        emit('authenticated', {
            'message': 'Authentication successful',
            'userId': user_id,
        })

    except Exception as e:
        logger.error(f"Error in on_authenticate: {e}")
        emit('authenticate_error', {
            'error': 'Authentication failed',
            'message': str(e)
        })


# ============================================================================
# SUBSCRIPTION HANDLERS
# ============================================================================

def on_subscribe(data):
    """
    Subscribe to a room/channel
    Expected data: {
        'room': 'user:123:notifications' | 'account:456:sync' | ...
    }
    """
    try:
        sid = request.sid
        room = data.get('room')

        if not room:
            emit('error', {'error': 'room parameter required'})
            return

        ws_manager = get_ws_manager()
        conn = ws_manager.get_connection(sid)

        if not conn or not conn.is_authenticated:
            emit('error', {'error': 'Not authenticated'})
            return

        # Subscribe
        if ws_manager.subscribe_to_room(sid, room):
            join_room(room)
            emit('subscribed', {'room': room})
            logger.info(f"Client {sid} subscribed to {room}")
        else:
            emit('error', {'error': 'Failed to subscribe'})

    except Exception as e:
        logger.error(f"Error in on_subscribe: {e}")
        emit('error', {'error': str(e)})


def on_unsubscribe(data):
    """
    Unsubscribe from a room/channel
    Expected data: { 'room': 'room_name' }
    """
    try:
        sid = request.sid
        room = data.get('room')

        if not room:
            emit('error', {'error': 'room parameter required'})
            return

        ws_manager = get_ws_manager()
        if ws_manager.unsubscribe_from_room(sid, room):
            leave_room(room)
            emit('unsubscribed', {'room': room})
            logger.info(f"Client {sid} unsubscribed from {room}")
        else:
            emit('error', {'error': 'Failed to unsubscribe'})

    except Exception as e:
        logger.error(f"Error in on_unsubscribe: {e}")
        emit('error', {'error': str(e)})


# ============================================================================
# HEARTBEAT
# ============================================================================

def on_ping(data):
    """
    Heartbeat/ping handler
    Expected data: { 'timestamp': 1234567890 }
    """
    try:
        sid = request.sid
        ws_manager = get_ws_manager()
        conn = ws_manager.get_connection(sid)

        if conn:
            conn.update_heartbeat()

        emit('pong', {'timestamp': data.get('timestamp')})

    except Exception as e:
        logger.error(f"Error in on_ping: {e}")


# ============================================================================
# NOTIFICATION HANDLERS
# ============================================================================

def on_notification_read(data):
    """
    Mark notification as read
    Expected data: { 'notificationId': 'notif123' }
    """
    try:
        sid = request.sid
        notification_id = data.get('notificationId')

        if not notification_id:
            emit('error', {'error': 'notificationId parameter required'})
            return

        ws_manager = get_ws_manager()
        conn = ws_manager.get_connection(sid)

        if not conn or not conn.is_authenticated:
            emit('error', {'error': 'Not authenticated'})
            return

        # Mark as read in database
        from src.models.notification import Notification
        notification = Notification.get_by_id(notification_id, conn.tenant_id)

        if not notification:
            emit('error', {'error': 'Notification not found'})
            return

        if notification.user_id != conn.user_id:
            emit('error', {'error': 'Access denied'})
            return

        notification.mark_as_read()

        # Emit to all user connections
        user_room = f'user:{conn.user_id}:notifications'
        socketio.emit('notification:marked_read', {
            'notificationId': notification_id
        }, to=user_room)

        emit('notification:read_ack', {'notificationId': notification_id})

    except Exception as e:
        logger.error(f"Error in on_notification_read: {e}")
        emit('error', {'error': str(e)})


def on_notification_archive(data):
    """
    Archive notification
    Expected data: { 'notificationId': 'notif123' }
    """
    try:
        sid = request.sid
        notification_id = data.get('notificationId')

        if not notification_id:
            emit('error', {'error': 'notificationId parameter required'})
            return

        ws_manager = get_ws_manager()
        conn = ws_manager.get_connection(sid)

        if not conn or not conn.is_authenticated:
            emit('error', {'error': 'Not authenticated'})
            return

        # Archive in database
        from src.models.notification import Notification
        notification = Notification.get_by_id(notification_id, conn.tenant_id)

        if not notification:
            emit('error', {'error': 'Notification not found'})
            return

        if notification.user_id != conn.user_id:
            emit('error', {'error': 'Access denied'})
            return

        notification.archive()

        # Emit to all user connections
        user_room = f'user:{conn.user_id}:notifications'
        socketio.emit('notification:archived', {
            'notificationId': notification_id
        }, to=user_room)

        emit('notification:archive_ack', {'notificationId': notification_id})

    except Exception as e:
        logger.error(f"Error in on_notification_archive: {e}")
        emit('error', {'error': str(e)})


# ============================================================================
# BROADCAST HELPERS (Called from other parts of the app)
# ============================================================================

def broadcast_new_message(user_id: str, tenant_id: str, message_data: dict):
    """
    Broadcast new message notification to all user connections
    Called by email sync service when new message arrives
    """
    try:
        room = f'user:{user_id}:notifications'
        socketio.emit('notification:new_message', message_data, to=room)
        logger.info(f"Broadcasted new_message to {room}")
    except Exception as e:
        logger.error(f"Error broadcasting new_message: {e}")


def broadcast_sync_complete(user_id: str, tenant_id: str, sync_data: dict):
    """Broadcast sync complete notification"""
    try:
        room = f'user:{user_id}:sync'
        socketio.emit('notification:sync_complete', sync_data, to=room)
        logger.info(f"Broadcasted sync_complete to {room}")
    except Exception as e:
        logger.error(f"Error broadcasting sync_complete: {e}")


def broadcast_sync_failed(user_id: str, tenant_id: str, error_data: dict):
    """Broadcast sync failed notification"""
    try:
        room = f'user:{user_id}:sync'
        socketio.emit('notification:sync_failed', error_data, to=room)
        logger.info(f"Broadcasted sync_failed to {room}")
    except Exception as e:
        logger.error(f"Error broadcasting sync_failed: {e}")


def broadcast_error(user_id: str, tenant_id: str, error_data: dict):
    """Broadcast error notification"""
    try:
        room = f'user:{user_id}:notifications'
        socketio.emit('notification:error', error_data, to=room)
        logger.info(f"Broadcasted error to {room}")
    except Exception as e:
        logger.error(f"Error broadcasting error: {e}")
