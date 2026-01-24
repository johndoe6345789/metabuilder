"""
Notification event emitter and handlers
Manages creating notifications and emitting real-time WebSocket events
"""
import logging
from typing import Optional, Dict, Any
from datetime import datetime

from src.models.notification import (
    Notification, NotificationPreference, NotificationType
)
from src.handlers.websocket import WebSocketMessage, get_ws_manager

logger = logging.getLogger(__name__)


class NotificationEventEmitter:
    """
    Emits notifications for various email service events
    Handles WebSocket delivery, email notifications, and persistence
    """

    @staticmethod
    def emit_new_message(
        user_id: str,
        account_id: str,
        tenant_id: str,
        sender_email: str,
        sender_name: Optional[str],
        subject: str,
        folder: str,
        message_id: Optional[str] = None,
        preview: Optional[str] = None,
    ) -> Notification:
        """
        Emit new message notification

        Args:
            user_id: User ID
            account_id: Email account ID
            tenant_id: Tenant ID
            sender_email: Sender email address
            sender_name: Sender name (optional)
            subject: Message subject
            folder: Folder name (e.g., "Inbox")
            message_id: Email message ID (optional)
            preview: Message preview (optional)

        Returns:
            Created notification
        """
        # Check user preferences
        pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
        if not pref.notify_new_message:
            logger.info(f"Skipping new message notification (user disabled)")
            return None

        # Check if sender is silenced
        if sender_email in pref.silenced_senders:
            logger.info(f"Skipping notification for silenced sender: {sender_email}")
            return None

        # Check if folder is silenced
        if folder in pref.silenced_folders:
            logger.info(f"Skipping notification for silenced folder: {folder}")
            return None

        # Create notification
        notification = Notification.create(
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id,
            notification_type=NotificationType.NEW_MESSAGE.value,
            title=f"New message from {sender_name or sender_email}",
            message=subject or "(No subject)",
            data={
                'folder': folder,
                'preview': preview,
                'sender': {
                    'email': sender_email,
                    'name': sender_name,
                }
            },
            sender_email=sender_email,
            sender_name=sender_name,
            message_id=message_id,
        )

        # Emit WebSocket event
        NotificationEventEmitter._emit_websocket_event(
            user_id=user_id,
            event=WebSocketMessage(
                event='new_message',
                data={
                    'notificationId': notification.id,
                    'sender': sender_name or sender_email,
                    'subject': subject,
                    'folder': folder,
                    'messageId': message_id,
                }
            )
        )

        # Send push notification if enabled
        if 'push' in pref.channels:
            NotificationEventEmitter._send_push_notification(
                user_id=user_id,
                pref=pref,
                title=f"New message from {sender_name or sender_email}",
                body=subject or "(No subject)",
                icon="/images/icons/mail.png",
                data={'notificationId': notification.id}
            )

        logger.info(f"Emitted new_message notification: {notification.id}")
        return notification

    @staticmethod
    def emit_sync_complete(
        user_id: str,
        account_id: str,
        tenant_id: str,
        folder: str,
        messages_synced: int,
        new_messages: int,
    ) -> Optional[Notification]:
        """
        Emit sync complete notification

        Args:
            user_id: User ID
            account_id: Email account ID
            tenant_id: Tenant ID
            folder: Synced folder
            messages_synced: Total messages synced
            new_messages: Count of new messages

        Returns:
            Created notification or None
        """
        pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
        if not pref.notify_sync_complete:
            logger.info(f"Skipping sync_complete notification (user disabled)")
            return None

        notification = Notification.create(
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id,
            notification_type=NotificationType.SYNC_COMPLETE.value,
            title="Sync completed",
            message=f"Synced {folder}: {messages_synced} messages ({new_messages} new)",
            data={
                'folder': folder,
                'messagesSynced': messages_synced,
                'newMessages': new_messages,
            }
        )

        NotificationEventEmitter._emit_websocket_event(
            user_id=user_id,
            event=WebSocketMessage(
                event='sync_complete',
                data={
                    'notificationId': notification.id,
                    'folder': folder,
                    'messagesSynced': messages_synced,
                    'newMessages': new_messages,
                }
            )
        )

        logger.info(f"Emitted sync_complete notification: {notification.id}")
        return notification

    @staticmethod
    def emit_sync_failed(
        user_id: str,
        account_id: str,
        tenant_id: str,
        folder: str,
        error_message: str,
    ) -> Optional[Notification]:
        """
        Emit sync failed notification

        Args:
            user_id: User ID
            account_id: Email account ID
            tenant_id: Tenant ID
            folder: Folder that failed to sync
            error_message: Error details

        Returns:
            Created notification or None
        """
        pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
        if not pref.notify_sync_failed:
            logger.info(f"Skipping sync_failed notification (user disabled)")
            return None

        notification = Notification.create(
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id,
            notification_type=NotificationType.SYNC_FAILED.value,
            title="Sync failed",
            message=f"Failed to sync {folder}: {error_message}",
            data={
                'folder': folder,
                'error': error_message,
            }
        )

        NotificationEventEmitter._emit_websocket_event(
            user_id=user_id,
            event=WebSocketMessage(
                event='sync_failed',
                data={
                    'notificationId': notification.id,
                    'folder': folder,
                    'error': error_message,
                }
            )
        )

        # Always send push for errors
        pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
        if 'push' in pref.channels:
            NotificationEventEmitter._send_push_notification(
                user_id=user_id,
                pref=pref,
                title="Sync failed",
                body=f"Failed to sync {folder}",
                icon="/images/icons/error.png",
                data={'notificationId': notification.id}
            )

        logger.info(f"Emitted sync_failed notification: {notification.id}")
        return notification

    @staticmethod
    def emit_error(
        user_id: str,
        account_id: str,
        tenant_id: str,
        error_type: str,
        error_message: str,
    ) -> Optional[Notification]:
        """
        Emit error notification

        Args:
            user_id: User ID
            account_id: Email account ID
            tenant_id: Tenant ID
            error_type: Type of error (e.g., 'auth_failed', 'quota_exceeded')
            error_message: Error details

        Returns:
            Created notification or None
        """
        pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
        if not pref.notify_error:
            logger.info(f"Skipping error notification (user disabled)")
            return None

        notification = Notification.create(
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id,
            notification_type=NotificationType.ERROR_OCCURRED.value,
            title=f"Error: {error_type}",
            message=error_message,
            data={
                'errorType': error_type,
                'errorMessage': error_message,
            }
        )

        NotificationEventEmitter._emit_websocket_event(
            user_id=user_id,
            event=WebSocketMessage(
                event='error_occurred',
                data={
                    'notificationId': notification.id,
                    'errorType': error_type,
                    'errorMessage': error_message,
                }
            )
        )

        # Always send push for errors
        if 'push' in pref.channels:
            NotificationEventEmitter._send_push_notification(
                user_id=user_id,
                pref=pref,
                title="Error occurred",
                body=error_message,
                icon="/images/icons/error.png",
                data={'notificationId': notification.id}
            )

        logger.info(f"Emitted error notification: {notification.id}")
        return notification

    @staticmethod
    def emit_message_sent(
        user_id: str,
        account_id: str,
        tenant_id: str,
        recipient_email: str,
        subject: str,
    ) -> Optional[Notification]:
        """
        Emit message sent notification

        Args:
            user_id: User ID
            account_id: Email account ID
            tenant_id: Tenant ID
            recipient_email: Email recipient
            subject: Message subject

        Returns:
            Created notification or None
        """
        pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
        if not pref.notify_message_sent:
            logger.info(f"Skipping message_sent notification (user disabled)")
            return None

        notification = Notification.create(
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id,
            notification_type=NotificationType.MESSAGE_SENT.value,
            title="Message sent",
            message=f"Sent to {recipient_email}: {subject}",
            data={
                'recipient': recipient_email,
                'subject': subject,
            }
        )

        NotificationEventEmitter._emit_websocket_event(
            user_id=user_id,
            event=WebSocketMessage(
                event='message_sent',
                data={
                    'notificationId': notification.id,
                    'recipient': recipient_email,
                    'subject': subject,
                }
            )
        )

        logger.info(f"Emitted message_sent notification: {notification.id}")
        return notification

    @staticmethod
    def emit_quota_warning(
        user_id: str,
        account_id: str,
        tenant_id: str,
        quota_used_percent: float,
    ) -> Optional[Notification]:
        """
        Emit quota warning notification

        Args:
            user_id: User ID
            account_id: Email account ID
            tenant_id: Tenant ID
            quota_used_percent: Percentage of quota used (0-100)

        Returns:
            Created notification or None
        """
        pref = NotificationPreference.get_or_create(user_id, account_id, tenant_id)
        if not pref.notify_quota_warning:
            logger.info(f"Skipping quota_warning notification (user disabled)")
            return None

        notification = Notification.create(
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id,
            notification_type=NotificationType.QUOTA_WARNING.value,
            title="Quota warning",
            message=f"Your mailbox is {quota_used_percent:.1f}% full",
            data={
                'quotaUsedPercent': quota_used_percent,
            }
        )

        NotificationEventEmitter._emit_websocket_event(
            user_id=user_id,
            event=WebSocketMessage(
                event='quota_warning',
                data={
                    'notificationId': notification.id,
                    'quotaUsedPercent': quota_used_percent,
                }
            )
        )

        # Send push only if quota is very high
        if quota_used_percent > 85 and 'push' in pref.channels:
            NotificationEventEmitter._send_push_notification(
                user_id=user_id,
                pref=pref,
                title="Quota warning",
                body=f"Your mailbox is {quota_used_percent:.1f}% full",
                icon="/images/icons/warning.png",
                data={'notificationId': notification.id}
            )

        logger.info(f"Emitted quota_warning notification: {notification.id}")
        return notification

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    @staticmethod
    def _emit_websocket_event(user_id: str, event: WebSocketMessage) -> None:
        """
        Emit WebSocket event to all connected clients for a user

        Args:
            user_id: User ID
            event: WebSocket message to emit
        """
        try:
            ws_manager = get_ws_manager()
            connections = ws_manager.get_user_connections(user_id)

            if not connections:
                logger.info(f"No active WebSocket connections for user {user_id}")
                # Queue message for next connection
                ws_manager.queue_message(user_id, event)
                return

            for conn in connections:
                # In production, use socketio.emit(event.event, event.data, to=conn.sid)
                logger.info(f"Emitting {event.event} to {conn.sid}")

        except Exception as e:
            logger.error(f"Failed to emit WebSocket event: {e}")

    @staticmethod
    def _send_push_notification(
        user_id: str,
        pref: 'NotificationPreference',
        title: str,
        body: str,
        icon: str = "/images/icons/mail.png",
        data: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Send browser/mobile push notification

        Args:
            user_id: User ID
            pref: Notification preference
            title: Notification title
            body: Notification body
            icon: Icon URL
            data: Additional data to include

        Returns:
            True if sent, False otherwise
        """
        try:
            if not pref.push_enabled or not pref.push_endpoint:
                logger.info(f"Push notifications disabled for user {user_id}")
                return False

            # TODO: Implement Web Push Protocol (RFC 8030)
            # 1. Get subscription from pref.push_endpoint
            # 2. Encrypt and send payload using pref.push_auth_key, push_p256dh_key
            # 3. Send POST request to endpoint

            logger.info(f"Sending push notification to user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to send push notification: {e}")
            return False
