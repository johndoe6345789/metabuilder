"""
Comprehensive tests for Phase 7 notification service
Tests notification models, routes, WebSocket handling, and event emission
"""
import pytest
import json
from datetime import datetime, timedelta
from src.models.notification import (
    Notification, NotificationPreference, NotificationDigest,
    NotificationType
)
from src.handlers.websocket import (
    WebSocketConnection, WebSocketManager, WebSocketMessage,
    WebSocketEventType
)
from src.handlers.notification_events import NotificationEventEmitter
from src.db import db


# ============================================================================
# NOTIFICATION MODEL TESTS
# ============================================================================

class TestNotificationModel:
    """Test Notification model"""

    def test_create_notification(self, app, tenant_id, user_id, account_id):
        """Test creating a notification"""
        with app.app_context():
            notification = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test notification",
                message="This is a test",
                sender_email="test@example.com",
                sender_name="Test User",
            )

            assert notification.id is not None
            assert notification.user_id == user_id
            assert notification.is_read == False
            assert notification.is_archived == False
            assert notification.created_at is not None

    def test_mark_as_read(self, app, tenant_id, user_id, account_id):
        """Test marking notification as read"""
        with app.app_context():
            notification = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test",
                message="Test message",
            )

            assert notification.is_read == False
            notification.mark_as_read()
            assert notification.is_read == True
            assert notification.read_at is not None

    def test_mark_as_unread(self, app, tenant_id, user_id, account_id):
        """Test marking notification as unread"""
        with app.app_context():
            notification = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test",
                message="Test message",
            )

            notification.mark_as_read()
            notification.mark_as_unread()
            assert notification.is_read == False
            assert notification.read_at is None

    def test_archive_notification(self, app, tenant_id, user_id, account_id):
        """Test archiving notification"""
        with app.app_context():
            notification = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test",
                message="Test message",
            )

            assert notification.is_archived == False
            notification.archive()
            assert notification.is_archived == True
            assert notification.archived_at is not None

    def test_get_user_notifications(self, app, tenant_id, user_id, account_id):
        """Test fetching user notifications"""
        with app.app_context():
            # Create multiple notifications
            for i in range(5):
                Notification.create(
                    user_id=user_id,
                    account_id=account_id,
                    tenant_id=tenant_id,
                    notification_type=NotificationType.NEW_MESSAGE.value,
                    title=f"Notification {i}",
                    message=f"Test message {i}",
                )

            notifications, total = Notification.get_user_notifications(
                user_id=user_id,
                tenant_id=tenant_id,
                limit=10,
                offset=0,
            )

            assert total == 5
            assert len(notifications) == 5

    def test_get_unread_count(self, app, tenant_id, user_id, account_id):
        """Test getting unread notification count"""
        with app.app_context():
            # Create notifications
            notif1 = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test 1",
                message="Test message 1",
            )

            notif2 = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test 2",
                message="Test message 2",
            )

            # Both unread
            assert Notification.get_unread_count(user_id, tenant_id) == 2

            # Mark one as read
            notif1.mark_as_read()
            assert Notification.get_unread_count(user_id, tenant_id) == 1

    def test_notification_expiration(self, app, tenant_id, user_id, account_id):
        """Test notification expiration (30 days)"""
        with app.app_context():
            notification = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test",
                message="Test message",
            )

            # Expires 30 days from creation
            now = int(datetime.utcnow().timestamp() * 1000)
            thirty_days_ms = 30 * 24 * 60 * 60 * 1000
            assert notification.expires_at - notification.created_at == thirty_days_ms

    def test_update_delivery_status(self, app, tenant_id, user_id, account_id):
        """Test updating notification delivery status"""
        with app.app_context():
            notification = Notification.create(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notification_type=NotificationType.NEW_MESSAGE.value,
                title="Test",
                message="Test message",
            )

            notification.update_delivery_status('push', 'sent')
            notification.update_delivery_status('email', 'pending')

            assert notification.delivery_status['push'] == 'sent'
            assert notification.delivery_status['email'] == 'pending'
            assert 'push' in notification.channels_sent


# ============================================================================
# NOTIFICATION PREFERENCE TESTS
# ============================================================================

class TestNotificationPreference:
    """Test NotificationPreference model"""

    def test_create_preference(self, app, tenant_id, user_id, account_id):
        """Test creating notification preference"""
        with app.app_context():
            pref = NotificationPreference(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                notify_new_message=True,
                digest_frequency="daily",
            )
            db.session.add(pref)
            db.session.commit()

            assert pref.id is not None
            assert pref.notify_new_message == True

    def test_get_or_create_preference(self, app, tenant_id, user_id, account_id):
        """Test get_or_create for preferences"""
        with app.app_context():
            # First call creates
            pref1 = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
            assert pref1.id is not None

            # Second call retrieves same
            pref2 = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
            assert pref1.id == pref2.id

    def test_silence_sender(self, app, tenant_id, user_id, account_id):
        """Test silencing sender"""
        with app.app_context():
            pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)

            # Add sender to silence list
            pref.silenced_senders.append("spam@example.com")
            db.session.commit()

            pref = NotificationPreference.get_by_user_account(user_id, account_id, tenant_id)
            assert "spam@example.com" in pref.silenced_senders

    def test_silence_folder(self, app, tenant_id, user_id, account_id):
        """Test silencing folder"""
        with app.app_context():
            pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)

            # Add folder to silence list
            pref.silenced_folders.append("[Gmail]/Promotions")
            db.session.commit()

            pref = NotificationPreference.get_by_user_account(user_id, account_id, tenant_id)
            assert "[Gmail]/Promotions" in pref.silenced_folders

    def test_digest_settings(self, app, tenant_id, user_id, account_id):
        """Test digest settings"""
        with app.app_context():
            pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)

            pref.digest_frequency = "weekly"
            pref.digest_time = "09:00"
            pref.digest_timezone = "America/New_York"
            db.session.commit()

            pref = NotificationPreference.get_by_user_account(user_id, account_id, tenant_id)
            assert pref.digest_frequency == "weekly"
            assert pref.digest_time == "09:00"
            assert pref.digest_timezone == "America/New_York"

    def test_quiet_hours(self, app, tenant_id, user_id, account_id):
        """Test quiet hours settings"""
        with app.app_context():
            pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)

            pref.quiet_hours_enabled = True
            pref.quiet_hours_start = "22:00"
            pref.quiet_hours_end = "08:00"
            db.session.commit()

            pref = NotificationPreference.get_by_user_account(user_id, account_id, tenant_id)
            assert pref.quiet_hours_enabled == True
            assert pref.quiet_hours_start == "22:00"

    def test_push_subscription(self, app, tenant_id, user_id, account_id):
        """Test push notification subscription"""
        with app.app_context():
            pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)

            pref.push_enabled = True
            pref.push_endpoint = "https://fcm.googleapis.com/..."
            pref.push_auth_key = "test_auth_key"
            pref.push_p256dh_key = "test_p256dh_key"
            db.session.commit()

            pref = NotificationPreference.get_by_user_account(user_id, account_id, tenant_id)
            assert pref.push_enabled == True


# ============================================================================
# WEBSOCKET TESTS
# ============================================================================

class TestWebSocketConnection:
    """Test WebSocket connection"""

    def test_create_connection(self):
        """Test creating WebSocket connection"""
        conn = WebSocketConnection(
            sid='test_sid',
            user_id='user123',
            account_id='account123',
            tenant_id='tenant123',
        )

        assert conn.sid == 'test_sid'
        assert conn.user_id == 'user123'
        assert conn.is_authenticated == False

    def test_subscribe_to_room(self):
        """Test subscribing to room"""
        conn = WebSocketConnection(
            sid='test_sid',
            user_id='user123',
            account_id='account123',
            tenant_id='tenant123',
        )

        conn.subscribe('notifications')
        assert 'notifications' in conn.subscriptions

    def test_unsubscribe_from_room(self):
        """Test unsubscribing from room"""
        conn = WebSocketConnection(
            sid='test_sid',
            user_id='user123',
            account_id='account123',
            tenant_id='tenant123',
        )

        conn.subscribe('notifications')
        conn.unsubscribe('notifications')
        assert 'notifications' not in conn.subscriptions


class TestWebSocketManager:
    """Test WebSocket manager"""

    def test_add_connection(self):
        """Test adding connection"""
        manager = WebSocketManager()
        conn = WebSocketConnection(
            sid='test_sid',
            user_id='user123',
            account_id='account123',
            tenant_id='tenant123',
        )

        manager.add_connection(conn)
        assert manager.get_connection('test_sid') == conn

    def test_remove_connection(self):
        """Test removing connection"""
        manager = WebSocketManager()
        conn = WebSocketConnection(
            sid='test_sid',
            user_id='user123',
            account_id='account123',
            tenant_id='tenant123',
        )

        manager.add_connection(conn)
        removed = manager.remove_connection('test_sid')
        assert removed == conn
        assert manager.get_connection('test_sid') is None

    def test_subscribe_to_room(self):
        """Test subscribing connection to room"""
        manager = WebSocketManager()
        conn = WebSocketConnection(
            sid='test_sid',
            user_id='user123',
            account_id='account123',
            tenant_id='tenant123',
        )
        manager.add_connection(conn)

        manager.subscribe_to_room('test_sid', 'notifications')
        assert 'notifications' in conn.subscriptions
        assert 'test_sid' in manager.rooms['notifications']

    def test_get_room_connections(self):
        """Test getting connections in room"""
        manager = WebSocketManager()

        for i in range(3):
            conn = WebSocketConnection(
                sid=f'sid_{i}',
                user_id=f'user_{i}',
                account_id='account123',
                tenant_id='tenant123',
            )
            manager.add_connection(conn)
            manager.subscribe_to_room(f'sid_{i}', 'notifications')

        conns = manager.get_room_connections('notifications')
        assert len(conns) == 3

    def test_queue_message(self):
        """Test queuing message for offline user"""
        manager = WebSocketManager()
        msg = WebSocketMessage(event='test', data={'foo': 'bar'})

        manager.queue_message('user123', msg)
        assert len(manager.pending_messages['user123']) == 1

    def test_get_pending_messages(self):
        """Test retrieving pending messages"""
        manager = WebSocketManager()
        msg1 = WebSocketMessage(event='test1', data={'foo': 'bar'})
        msg2 = WebSocketMessage(event='test2', data={'baz': 'qux'})

        manager.queue_message('user123', msg1)
        manager.queue_message('user123', msg2)

        pending = manager.get_pending_messages('user123')
        assert len(pending) == 2
        assert len(manager.pending_messages['user123']) == 0  # Cleared


class TestWebSocketMessage:
    """Test WebSocket message"""

    def test_create_message(self):
        """Test creating message"""
        msg = WebSocketMessage(event='test', data={'foo': 'bar'})
        assert msg.event == 'test'
        assert msg.data == {'foo': 'bar'}
        assert msg.timestamp is not None

    def test_serialize_message(self):
        """Test serializing message to JSON"""
        msg = WebSocketMessage(event='test', data={'foo': 'bar'})
        json_str = msg.to_json()
        assert isinstance(json_str, str)
        assert 'test' in json_str

    def test_deserialize_message(self):
        """Test deserializing message from JSON"""
        original = WebSocketMessage(event='test', data={'foo': 'bar'})
        json_str = original.to_json()
        deserialized = WebSocketMessage.from_json(json_str)

        assert deserialized.event == 'test'
        assert deserialized.data == {'foo': 'bar'}


# ============================================================================
# EVENT EMITTER TESTS
# ============================================================================

class TestNotificationEventEmitter:
    """Test notification event emitter"""

    def test_emit_new_message(self, app, tenant_id, user_id, account_id):
        """Test emitting new message notification"""
        with app.app_context():
            notification = NotificationEventEmitter.emit_new_message(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                sender_email="test@example.com",
                sender_name="Test User",
                subject="Test Subject",
                folder="Inbox",
                preview="Test preview",
            )

            assert notification is not None
            assert notification.type == NotificationType.NEW_MESSAGE.value
            assert notification.sender_email == "test@example.com"

    def test_emit_new_message_silenced_sender(self, app, tenant_id, user_id, account_id):
        """Test that new message from silenced sender is not emitted"""
        with app.app_context():
            pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
            pref.silenced_senders.append("spam@example.com")
            db.session.commit()

            notification = NotificationEventEmitter.emit_new_message(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                sender_email="spam@example.com",
                sender_name="Spammer",
                subject="Spam",
                folder="Inbox",
            )

            assert notification is None

    def test_emit_sync_complete(self, app, tenant_id, user_id, account_id):
        """Test emitting sync complete notification"""
        with app.app_context():
            notification = NotificationEventEmitter.emit_sync_complete(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                folder="Inbox",
                messages_synced=100,
                new_messages=5,
            )

            assert notification is not None
            assert notification.type == NotificationType.SYNC_COMPLETE.value
            assert notification.data['messagesSynced'] == 100

    def test_emit_error(self, app, tenant_id, user_id, account_id):
        """Test emitting error notification"""
        with app.app_context():
            notification = NotificationEventEmitter.emit_error(
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                error_type="auth_failed",
                error_message="Invalid credentials",
            )

            assert notification is not None
            assert notification.type == NotificationType.ERROR_OCCURRED.value
            assert notification.data['errorType'] == "auth_failed"


# ============================================================================
# NOTIFICATION DIGEST TESTS
# ============================================================================

class TestNotificationDigest:
    """Test notification digest"""

    def test_create_digest(self, app, tenant_id, user_id, account_id):
        """Test creating notification digest"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            start = now - (24 * 60 * 60 * 1000)

            digest = NotificationDigest(
                id='digest123',
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                frequency='daily',
                period_start=start,
                period_end=now,
                notification_ids=['notif1', 'notif2'],
                notification_count=2,
            )
            db.session.add(digest)
            db.session.commit()

            assert digest.id is not None
            assert digest.notification_count == 2

    def test_digest_to_dict(self, app, tenant_id, user_id, account_id):
        """Test digest serialization"""
        with app.app_context():
            now = int(datetime.utcnow().timestamp() * 1000)
            start = now - (24 * 60 * 60 * 1000)

            digest = NotificationDigest(
                id='digest123',
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                frequency='daily',
                period_start=start,
                period_end=now,
                notification_ids=['notif1'],
                notification_count=1,
            )

            data = digest.to_dict()
            assert data['frequency'] == 'daily'
            assert data['notificationCount'] == 1
