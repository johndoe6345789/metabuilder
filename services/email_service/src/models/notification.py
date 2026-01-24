"""
Notification models for Phase 7 notification service
Handles notification persistence, user preferences, and digest management
"""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey,
    UniqueConstraint, Index, JSON, BigInteger, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.db import db
import enum
import logging

logger = logging.getLogger(__name__)


def get_uuid():
    """Generate UUID string for SQLAlchemy"""
    return str(uuid.uuid4())


class NotificationType(enum.Enum):
    """Notification event types"""
    NEW_MESSAGE = "new_message"
    SYNC_COMPLETE = "sync_complete"
    SYNC_FAILED = "sync_failed"
    ERROR_OCCURRED = "error_occurred"
    MESSAGE_SENT = "message_sent"
    ATTACHMENT_DOWNLOADED = "attachment_downloaded"
    QUOTA_WARNING = "quota_warning"


class DigestFrequency(enum.Enum):
    """Email digest frequency options"""
    DISABLED = "disabled"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class NotificationChannel(enum.Enum):
    """Notification delivery channels"""
    IN_APP = "in_app"
    EMAIL = "email"
    PUSH = "push"  # Browser/mobile push notifications
    WEBHOOK = "webhook"


class NotificationPreference(db.Model):
    """
    User notification preferences
    Multi-tenant: every query must filter by tenant_id
    """
    __tablename__ = "notification_preferences"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign key to user/account
    user_id = Column(String(50), nullable=False, index=True)
    account_id = Column(String(50), nullable=False, index=True)

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Notification type settings
    notify_new_message = Column(Boolean, nullable=False, default=True)
    notify_sync_complete = Column(Boolean, nullable=False, default=False)
    notify_sync_failed = Column(Boolean, nullable=False, default=True)
    notify_error = Column(Boolean, nullable=False, default=True)
    notify_message_sent = Column(Boolean, nullable=False, default=False)
    notify_attachment = Column(Boolean, nullable=False, default=True)
    notify_quota_warning = Column(Boolean, nullable=False, default=True)

    # Digest settings
    digest_frequency = Column(String(20), nullable=False, default="disabled")  # daily, weekly, monthly, disabled
    digest_time = Column(String(5), nullable=True)  # HH:MM in user's timezone
    digest_timezone = Column(String(50), nullable=False, default="UTC")

    # Channels
    channels = Column(JSON, nullable=False, default=lambda: ["in_app"])  # List of NotificationChannel values

    # Silence certain senders
    silenced_senders = Column(JSON, nullable=False, default=list)  # List of email addresses to mute
    silenced_folders = Column(JSON, nullable=False, default=list)  # List of folder paths to mute

    # Push notification settings
    push_enabled = Column(Boolean, nullable=False, default=False)
    push_endpoint = Column(Text, nullable=True)  # Subscription endpoint for web push
    push_auth_key = Column(Text, nullable=True)
    push_p256dh_key = Column(Text, nullable=True)

    # Do not disturb
    quiet_hours_enabled = Column(Boolean, nullable=False, default=False)
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM
    quiet_hours_end = Column(String(5), nullable=True)    # HH:MM

    # Metadata
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Indexes
    __table_args__ = (
        Index('idx_notification_pref_user', 'user_id'),
        Index('idx_notification_pref_account', 'account_id'),
        Index('idx_notification_pref_tenant', 'tenant_id'),
        UniqueConstraint('user_id', 'account_id', 'tenant_id', name='uq_notification_pref_user_account'),
    )

    def __repr__(self):
        return f"<NotificationPreference(user={self.user_id}, digest={self.digest_frequency})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'accountId': self.account_id,
            'tenantId': self.tenant_id,
            'notifyNewMessage': self.notify_new_message,
            'notifySyncComplete': self.notify_sync_complete,
            'notifySyncFailed': self.notify_sync_failed,
            'notifyError': self.notify_error,
            'notifyMessageSent': self.notify_message_sent,
            'notifyAttachment': self.notify_attachment,
            'notifyQuotaWarning': self.notify_quota_warning,
            'digestFrequency': self.digest_frequency,
            'digestTime': self.digest_time,
            'digestTimezone': self.digest_timezone,
            'channels': self.channels,
            'silencedSenders': self.silenced_senders,
            'silencedFolders': self.silenced_folders,
            'pushEnabled': self.push_enabled,
            'quietHoursEnabled': self.quiet_hours_enabled,
            'quietHoursStart': self.quiet_hours_start,
            'quietHoursEnd': self.quiet_hours_end,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def get_by_user_account(user_id: str, account_id: str, tenant_id: str) -> Optional['NotificationPreference']:
        """Get preferences for user/account with multi-tenant verification"""
        return NotificationPreference.query.filter_by(
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id
        ).first()

    @staticmethod
    def get_or_create(user_id: str, account_id: str, tenant_id: str) -> 'NotificationPreference':
        """Get or create notification preferences"""
        pref = NotificationPreference.get_by_user_account(user_id, account_id, tenant_id)
        if not pref:
            pref = NotificationPreference(
                id=get_uuid(),
                user_id=user_id,
                account_id=account_id,
                tenant_id=tenant_id,
                channels=["in_app"]
            )
            db.session.add(pref)
            db.session.commit()
        return pref


class Notification(db.Model):
    """
    User notification entity
    Represents a single notification event
    Multi-tenant: every query must filter by tenant_id
    """
    __tablename__ = "notifications"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign keys
    user_id = Column(String(50), nullable=False, index=True)
    account_id = Column(String(50), nullable=False, index=True)
    message_id = Column(String(50), nullable=True, index=True)  # Reference to message if applicable

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Notification details
    type = Column(String(50), nullable=False)  # NotificationType value
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    # Event data (JSON for extensibility)
    data = Column(JSON, nullable=True)  # Event-specific data

    # Sender information (for new_message events)
    sender_email = Column(String(255), nullable=True, index=True)
    sender_name = Column(String(255), nullable=True)

    # Read/unread tracking
    is_read = Column(Boolean, nullable=False, default=False)
    read_at = Column(BigInteger, nullable=True)

    # Archive tracking (notifications older than 30 days)
    is_archived = Column(Boolean, nullable=False, default=False)
    archived_at = Column(BigInteger, nullable=True)

    # Delivery tracking
    channels_sent = Column(JSON, nullable=False, default=list)  # Which channels delivered this
    delivery_status = Column(JSON, nullable=False, default=dict)  # {channel: 'sent'|'failed'|'pending'}

    # Metadata
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    expires_at = Column(BigInteger, nullable=True)  # Auto-delete after 30 days (30 * 24 * 60 * 60 * 1000 ms)

    # Indexes
    __table_args__ = (
        Index('idx_notification_user', 'user_id'),
        Index('idx_notification_account', 'account_id'),
        Index('idx_notification_tenant', 'tenant_id'),
        Index('idx_notification_unread', 'user_id', 'is_read'),
        Index('idx_notification_created', 'created_at'),
        Index('idx_notification_archived', 'is_archived'),
    )

    def __repr__(self):
        return f"<Notification(type={self.type}, user={self.user_id}, read={self.is_read})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'accountId': self.account_id,
            'messageId': self.message_id,
            'tenantId': self.tenant_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'data': self.data,
            'senderEmail': self.sender_email,
            'senderName': self.sender_name,
            'isRead': self.is_read,
            'readAt': self.read_at,
            'isArchived': self.is_archived,
            'archivedAt': self.archived_at,
            'channelsSent': self.channels_sent,
            'deliveryStatus': self.delivery_status,
            'createdAt': self.created_at,
            'expiresAt': self.expires_at,
        }

    @staticmethod
    def create(
        user_id: str,
        account_id: str,
        tenant_id: str,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        sender_email: Optional[str] = None,
        sender_name: Optional[str] = None,
        message_id: Optional[str] = None,
    ) -> 'Notification':
        """Create and persist a new notification"""
        now = int(datetime.utcnow().timestamp() * 1000)
        expires_at = now + (30 * 24 * 60 * 60 * 1000)  # 30 days from now

        notification = Notification(
            id=get_uuid(),
            user_id=user_id,
            account_id=account_id,
            tenant_id=tenant_id,
            type=notification_type,
            title=title,
            message=message,
            data=data or {},
            sender_email=sender_email,
            sender_name=sender_name,
            message_id=message_id,
            created_at=now,
            expires_at=expires_at,
            channels_sent=[],
            delivery_status={},
        )
        db.session.add(notification)
        db.session.commit()
        return notification

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = int(datetime.utcnow().timestamp() * 1000)
            db.session.commit()

    def mark_as_unread(self):
        """Mark notification as unread"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            db.session.commit()

    def archive(self):
        """Archive notification"""
        if not self.is_archived:
            self.is_archived = True
            self.archived_at = int(datetime.utcnow().timestamp() * 1000)
            db.session.commit()

    def update_delivery_status(self, channel: str, status: str):
        """Update delivery status for a specific channel"""
        if not self.delivery_status:
            self.delivery_status = {}
        self.delivery_status[channel] = status
        if channel not in self.channels_sent:
            self.channels_sent.append(channel)
        db.session.commit()

    @staticmethod
    def get_by_id(notification_id: str, tenant_id: str) -> Optional['Notification']:
        """Get notification by ID with multi-tenant verification"""
        return Notification.query.filter_by(id=notification_id, tenant_id=tenant_id).first()

    @staticmethod
    def get_user_notifications(
        user_id: str,
        tenant_id: str,
        limit: int = 50,
        offset: int = 0,
        unread_only: bool = False,
        archived: bool = False,
    ) -> Tuple[List['Notification'], int]:
        """Get paginated notifications for user"""
        query = Notification.query.filter_by(user_id=user_id, tenant_id=tenant_id)

        if unread_only:
            query = query.filter_by(is_read=False)

        query = query.filter_by(is_archived=archived)

        total = query.count()
        notifications = query.order_by(Notification.created_at.desc()).limit(limit).offset(offset).all()

        return notifications, total

    @staticmethod
    def get_unread_count(user_id: str, tenant_id: str) -> int:
        """Get count of unread notifications"""
        return Notification.query.filter_by(
            user_id=user_id,
            tenant_id=tenant_id,
            is_read=False,
            is_archived=False
        ).count()


class NotificationDigest(db.Model):
    """
    Email digest summary (daily/weekly/monthly)
    Tracks which notifications were included in digests
    """
    __tablename__ = "notification_digests"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign keys
    user_id = Column(String(50), nullable=False, index=True)
    account_id = Column(String(50), nullable=False, index=True)

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Digest details
    frequency = Column(String(20), nullable=False)  # daily, weekly, monthly
    period_start = Column(BigInteger, nullable=False)  # Milliseconds since epoch
    period_end = Column(BigInteger, nullable=False)

    # Notification tracking
    notification_ids = Column(JSON, nullable=False, default=list)  # IDs of notifications included
    notification_count = Column(Integer, nullable=False, default=0)

    # Delivery tracking
    email_sent = Column(Boolean, nullable=False, default=False)
    email_sent_at = Column(BigInteger, nullable=True)

    # Metadata
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Indexes
    __table_args__ = (
        Index('idx_digest_user', 'user_id'),
        Index('idx_digest_account', 'account_id'),
        Index('idx_digest_tenant', 'tenant_id'),
        Index('idx_digest_frequency', 'frequency'),
    )

    def __repr__(self):
        return f"<NotificationDigest(user={self.user_id}, freq={self.frequency})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'userId': self.user_id,
            'accountId': self.account_id,
            'tenantId': self.tenant_id,
            'frequency': self.frequency,
            'periodStart': self.period_start,
            'periodEnd': self.period_end,
            'notificationIds': self.notification_ids,
            'notificationCount': self.notification_count,
            'emailSent': self.email_sent,
            'emailSentAt': self.email_sent_at,
            'createdAt': self.created_at,
        }


# Type hints
from typing import Tuple
