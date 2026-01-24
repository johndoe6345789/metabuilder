"""
User Preferences Model - Phase 7
Defines UserPreferences entity for email client settings
- Theme (light/dark mode)
- Timezone and locale
- Sync frequency and notification preferences
- Privacy settings (read receipts, signature)
- Default folders and templates
- Storage quota preferences

Multi-tenant support: all queries must filter by tenant_id
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey,
    UniqueConstraint, Index, JSON, BigInteger
)
from sqlalchemy.orm import relationship
from src.db import db
import logging

logger = logging.getLogger(__name__)


def get_uuid():
    """Generate UUID string for SQLAlchemy"""
    return str(uuid.uuid4())


class UserPreferences(db.Model):
    """
    User preferences entity
    Stores email client settings per user per tenant
    Includes theme, timezone, sync settings, privacy options, and more

    Multi-tenant: every query must filter by tenant_id
    Soft delete: isDeleted flag allows recovery without schema changes
    """
    __tablename__ = "user_preferences"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Multi-tenant and user identification
    tenant_id = Column(String(50), nullable=False, index=True)
    user_id = Column(String(50), nullable=False, index=True)

    # ========================================================================
    # THEME & UI SETTINGS
    # ========================================================================

    theme = Column(String(50), nullable=False, default='light')  # light, dark, auto
    accent_color = Column(String(7), nullable=False, default='#1976d2')  # hex color
    compact_mode = Column(Boolean, nullable=False, default=False)
    show_preview_pane = Column(Boolean, nullable=False, default=True)
    message_density = Column(String(50), nullable=False, default='normal')  # compact, normal, spacious

    # ========================================================================
    # LOCALIZATION SETTINGS
    # ========================================================================

    timezone = Column(String(50), nullable=False, default='UTC')  # e.g., America/New_York
    locale = Column(String(10), nullable=False, default='en_US')  # e.g., en_US, fr_FR
    date_format = Column(String(50), nullable=False, default='MMM d, yyyy')  # e.g., MMM d, yyyy
    time_format = Column(String(50), nullable=False, default='h:mm a')  # e.g., h:mm a (12hr) or HH:mm (24hr)
    use_12hr_clock = Column(Boolean, nullable=False, default=True)

    # ========================================================================
    # SYNC & REFRESH SETTINGS
    # ========================================================================

    sync_enabled = Column(Boolean, nullable=False, default=True)
    sync_frequency_minutes = Column(Integer, nullable=False, default=5)  # 1, 5, 10, 15, 30, 60
    background_sync = Column(Boolean, nullable=False, default=True)
    offline_mode_enabled = Column(Boolean, nullable=False, default=False)

    # Sync scope: all, last_n_days
    sync_scope = Column(String(50), nullable=False, default='all')  # all, last_30, last_90, last_180
    sync_days_back = Column(Integer, nullable=False, default=30)  # if scope=last_n_days

    # ========================================================================
    # NOTIFICATION SETTINGS
    # ========================================================================

    notifications_enabled = Column(Boolean, nullable=False, default=True)
    notify_new_mail = Column(Boolean, nullable=False, default=True)
    notify_on_error = Column(Boolean, nullable=False, default=True)
    notify_sound = Column(Boolean, nullable=False, default=True)
    notify_desktop_alerts = Column(Boolean, nullable=False, default=True)

    # Smart notifications
    smart_notifications = Column(Boolean, nullable=False, default=False)  # Only notify VIPs/important
    quiet_hours_enabled = Column(Boolean, nullable=False, default=False)
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM format
    quiet_hours_end = Column(String(5), nullable=True)  # HH:MM format

    # Notification categories (JSON)
    notification_categories = Column(JSON, nullable=False, default={
        'promotions': False,
        'newsletters': False,
        'social': True,
        'important': True
    })

    # ========================================================================
    # PRIVACY SETTINGS
    # ========================================================================

    read_receipts_enabled = Column(Boolean, nullable=False, default=False)
    send_read_receipts = Column(Boolean, nullable=False, default=False)
    mark_as_read_delay_ms = Column(Integer, nullable=False, default=2000)  # auto-mark delay

    # Signature settings
    use_signature = Column(Boolean, nullable=False, default=False)
    signature_text = Column(Text, nullable=True)
    signature_html = Column(Text, nullable=True)
    signature_include_in_replies = Column(Boolean, nullable=False, default=True)
    signature_include_in_forwards = Column(Boolean, nullable=False, default=False)

    # Encryption and security
    pgp_enabled = Column(Boolean, nullable=False, default=False)
    pgp_key_id = Column(String(255), nullable=True)
    s_mime_enabled = Column(Boolean, nullable=False, default=False)
    s_mime_cert_id = Column(String(255), nullable=True)

    # Auto-reply / vacation settings
    vacation_mode_enabled = Column(Boolean, nullable=False, default=False)
    vacation_message = Column(Text, nullable=True)
    vacation_start_date = Column(BigInteger, nullable=True)  # Unix ms
    vacation_end_date = Column(BigInteger, nullable=True)  # Unix ms
    vacation_notify_sender = Column(Boolean, nullable=False, default=True)

    # ========================================================================
    # FOLDER & TEMPLATE DEFAULTS
    # ========================================================================

    default_inbox_folder_id = Column(String(50), nullable=True)  # FK to EmailFolder
    default_sent_folder_id = Column(String(50), nullable=True)
    default_drafts_folder_id = Column(String(50), nullable=True)
    default_trash_folder_id = Column(String(50), nullable=True)

    # Auto-filing rules (JSON array of rules)
    auto_file_rules = Column(JSON, nullable=False, default=[])  # e.g., [{sender: "X", folder_id: "Y"}]

    # Signature templates per account (JSON)
    signature_templates = Column(JSON, nullable=False, default={})  # {account_id: {name, text, html}}

    # Quick reply templates (JSON array)
    quick_reply_templates = Column(JSON, nullable=False, default=[])  # e.g., [{name: "thanks", text: "Thanks!"}]

    # Forwarding rules (JSON array)
    forwarding_rules = Column(JSON, nullable=False, default=[])  # e.g., [{from: "X", to: "Y"}]

    # ========================================================================
    # STORAGE & QUOTA SETTINGS
    # ========================================================================

    storage_quota_bytes = Column(BigInteger, nullable=True)  # Total quota in bytes
    storage_warning_percent = Column(Integer, nullable=False, default=80)  # Warn at 80%
    auto_delete_spam_days = Column(Integer, nullable=True)  # Delete spam older than N days
    auto_delete_trash_days = Column(Integer, nullable=True)  # Delete trash older than N days
    compress_attachments = Column(Boolean, nullable=False, default=False)

    # ========================================================================
    # ACCESSIBILITY SETTINGS
    # ========================================================================

    high_contrast_mode = Column(Boolean, nullable=False, default=False)
    font_size_percent = Column(Integer, nullable=False, default=100)  # 80-150
    reduce_animations = Column(Boolean, nullable=False, default=False)
    screen_reader_enabled = Column(Boolean, nullable=False, default=False)

    # ========================================================================
    # ADVANCED SETTINGS
    # ========================================================================

    enable_ai_features = Column(Boolean, nullable=False, default=True)  # Smart reply, categorization, etc.
    enable_threaded_view = Column(Boolean, nullable=False, default=True)
    enable_conversation_mode = Column(Boolean, nullable=False, default=True)
    conversation_threading_strategy = Column(String(50), nullable=False, default='auto')  # auto, refs, subjects

    # Development/debugging
    debug_mode = Column(Boolean, nullable=False, default=False)
    enable_telemetry = Column(Boolean, nullable=False, default=True)

    # Custom settings (JSON for extensibility)
    custom_settings = Column(JSON, nullable=False, default={})

    # ========================================================================
    # METADATA & VERSIONING
    # ========================================================================

    is_deleted = Column(Boolean, nullable=False, default=False, index=True)
    version = Column(Integer, nullable=False, default=1)  # Optimistic locking

    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000), onupdate=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Indexes
    __table_args__ = (
        Index('idx_user_preferences_tenant', 'tenant_id'),
        Index('idx_user_preferences_user', 'user_id'),
        Index('idx_user_preferences_tenant_user', 'tenant_id', 'user_id'),
        UniqueConstraint('tenant_id', 'user_id', 'is_deleted', name='uq_user_preferences_tenant_user'),
    )

    def __repr__(self):
        return f"<UserPreferences(id={self.id}, user_id={self.user_id}, theme={self.theme})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation for JSON responses"""
        return {
            'id': self.id,
            'tenantId': self.tenant_id,
            'userId': self.user_id,
            'version': self.version,
            'theme': {
                'mode': self.theme,
                'accentColor': self.accent_color,
                'compactMode': self.compact_mode,
                'messageDensity': self.message_density,
                'showPreviewPane': self.show_preview_pane,
                'highContrastMode': self.high_contrast_mode,
                'fontSizePercent': self.font_size_percent,
                'reduceAnimations': self.reduce_animations,
            },
            'localization': {
                'timezone': self.timezone,
                'locale': self.locale,
                'dateFormat': self.date_format,
                'timeFormat': self.time_format,
                'use12hrClock': self.use_12hr_clock,
            },
            'sync': {
                'enabled': self.sync_enabled,
                'frequencyMinutes': self.sync_frequency_minutes,
                'backgroundSyncEnabled': self.background_sync,
                'offlineModeEnabled': self.offline_mode_enabled,
                'scope': self.sync_scope,
                'daysBack': self.sync_days_back,
            },
            'notifications': {
                'enabled': self.notifications_enabled,
                'newMail': self.notify_new_mail,
                'onError': self.notify_on_error,
                'soundEnabled': self.notify_sound,
                'desktopAlertsEnabled': self.notify_desktop_alerts,
                'smartNotifications': self.smart_notifications,
                'quietHoursEnabled': self.quiet_hours_enabled,
                'quietHoursStart': self.quiet_hours_start,
                'quietHoursEnd': self.quiet_hours_end,
                'categories': self.notification_categories or {},
            },
            'privacy': {
                'readReceiptsEnabled': self.read_receipts_enabled,
                'sendReadReceipts': self.send_read_receipts,
                'markAsReadDelayMs': self.mark_as_read_delay_ms,
                'pgpEnabled': self.pgp_enabled,
                'pgpKeyId': self.pgp_key_id,
                'smimeEnabled': self.s_mime_enabled,
                'smimeCertId': self.s_mime_cert_id,
                'vacationModeEnabled': self.vacation_mode_enabled,
                'vacationMessage': self.vacation_message,
                'vacationStartDate': self.vacation_start_date,
                'vacationEndDate': self.vacation_end_date,
                'vacationNotifySender': self.vacation_notify_sender,
            },
            'signature': {
                'enabled': self.use_signature,
                'text': self.signature_text,
                'html': self.signature_html,
                'includeInReplies': self.signature_include_in_replies,
                'includeInForwards': self.signature_include_in_forwards,
            },
            'folders': {
                'defaultInboxFolderId': self.default_inbox_folder_id,
                'defaultSentFolderId': self.default_sent_folder_id,
                'defaultDraftsFolderId': self.default_drafts_folder_id,
                'defaultTrashFolderId': self.default_trash_folder_id,
                'autoFileRules': self.auto_file_rules or [],
            },
            'templates': {
                'signatureTemplates': self.signature_templates or {},
                'quickReplyTemplates': self.quick_reply_templates or [],
                'forwardingRules': self.forwarding_rules or [],
            },
            'storage': {
                'quotaBytes': self.storage_quota_bytes,
                'warningPercent': self.storage_warning_percent,
                'autoDeleteSpamDays': self.auto_delete_spam_days,
                'autoDeleteTrashDays': self.auto_delete_trash_days,
                'compressAttachments': self.compress_attachments,
            },
            'accessibility': {
                'screenReaderEnabled': self.screen_reader_enabled,
            },
            'advanced': {
                'enableAiFeatures': self.enable_ai_features,
                'enableThreadedView': self.enable_threaded_view,
                'enableConversationMode': self.enable_conversation_mode,
                'conversationThreadingStrategy': self.conversation_threading_strategy,
                'debugMode': self.debug_mode,
                'enableTelemetry': self.enable_telemetry,
                'customSettings': self.custom_settings or {},
            },
            'isDeleted': self.is_deleted,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def get_by_user(user_id: str, tenant_id: str) -> Optional['UserPreferences']:
        """Get user preferences by user ID with multi-tenant verification"""
        return UserPreferences.query.filter_by(
            user_id=user_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).first()

    @staticmethod
    def get_or_create(user_id: str, tenant_id: str) -> 'UserPreferences':
        """Get existing preferences or create new with defaults"""
        prefs = UserPreferences.get_by_user(user_id, tenant_id)
        if prefs:
            return prefs

        prefs = UserPreferences(
            user_id=user_id,
            tenant_id=tenant_id,
            theme='light',
            timezone='UTC',
            locale='en_US',
            sync_frequency_minutes=5,
        )
        db.session.add(prefs)
        db.session.commit()
        return prefs

    def update_from_dict(self, data: Dict[str, Any]) -> None:
        """Update preferences from dictionary, handling nested objects"""
        if not data:
            return

        # Theme settings
        if 'theme' in data:
            theme_data = data['theme']
            if isinstance(theme_data, dict):
                self.theme = theme_data.get('mode', self.theme)
                self.accent_color = theme_data.get('accentColor', self.accent_color)
                self.compact_mode = theme_data.get('compactMode', self.compact_mode)
                self.message_density = theme_data.get('messageDensity', self.message_density)
                self.show_preview_pane = theme_data.get('showPreviewPane', self.show_preview_pane)
                self.high_contrast_mode = theme_data.get('highContrastMode', self.high_contrast_mode)
                self.font_size_percent = theme_data.get('fontSizePercent', self.font_size_percent)
                self.reduce_animations = theme_data.get('reduceAnimations', self.reduce_animations)

        # Localization settings
        if 'localization' in data:
            loc_data = data['localization']
            if isinstance(loc_data, dict):
                self.timezone = loc_data.get('timezone', self.timezone)
                self.locale = loc_data.get('locale', self.locale)
                self.date_format = loc_data.get('dateFormat', self.date_format)
                self.time_format = loc_data.get('timeFormat', self.time_format)
                self.use_12hr_clock = loc_data.get('use12hrClock', self.use_12hr_clock)

        # Sync settings
        if 'sync' in data:
            sync_data = data['sync']
            if isinstance(sync_data, dict):
                self.sync_enabled = sync_data.get('enabled', self.sync_enabled)
                self.sync_frequency_minutes = sync_data.get('frequencyMinutes', self.sync_frequency_minutes)
                self.background_sync = sync_data.get('backgroundSyncEnabled', self.background_sync)
                self.offline_mode_enabled = sync_data.get('offlineModeEnabled', self.offline_mode_enabled)
                self.sync_scope = sync_data.get('scope', self.sync_scope)
                self.sync_days_back = sync_data.get('daysBack', self.sync_days_back)

        # Notification settings
        if 'notifications' in data:
            notif_data = data['notifications']
            if isinstance(notif_data, dict):
                self.notifications_enabled = notif_data.get('enabled', self.notifications_enabled)
                self.notify_new_mail = notif_data.get('newMail', self.notify_new_mail)
                self.notify_on_error = notif_data.get('onError', self.notify_on_error)
                self.notify_sound = notif_data.get('soundEnabled', self.notify_sound)
                self.notify_desktop_alerts = notif_data.get('desktopAlertsEnabled', self.notify_desktop_alerts)
                self.smart_notifications = notif_data.get('smartNotifications', self.smart_notifications)
                self.quiet_hours_enabled = notif_data.get('quietHoursEnabled', self.quiet_hours_enabled)
                self.quiet_hours_start = notif_data.get('quietHoursStart', self.quiet_hours_start)
                self.quiet_hours_end = notif_data.get('quietHoursEnd', self.quiet_hours_end)
                if 'categories' in notif_data:
                    self.notification_categories = notif_data['categories']

        # Privacy settings
        if 'privacy' in data:
            priv_data = data['privacy']
            if isinstance(priv_data, dict):
                self.read_receipts_enabled = priv_data.get('readReceiptsEnabled', self.read_receipts_enabled)
                self.send_read_receipts = priv_data.get('sendReadReceipts', self.send_read_receipts)
                self.mark_as_read_delay_ms = priv_data.get('markAsReadDelayMs', self.mark_as_read_delay_ms)
                self.pgp_enabled = priv_data.get('pgpEnabled', self.pgp_enabled)
                self.pgp_key_id = priv_data.get('pgpKeyId', self.pgp_key_id)
                self.s_mime_enabled = priv_data.get('smimeEnabled', self.s_mime_enabled)
                self.s_mime_cert_id = priv_data.get('smimeCertId', self.s_mime_cert_id)
                self.vacation_mode_enabled = priv_data.get('vacationModeEnabled', self.vacation_mode_enabled)
                self.vacation_message = priv_data.get('vacationMessage', self.vacation_message)
                self.vacation_start_date = priv_data.get('vacationStartDate', self.vacation_start_date)
                self.vacation_end_date = priv_data.get('vacationEndDate', self.vacation_end_date)
                self.vacation_notify_sender = priv_data.get('vacationNotifySender', self.vacation_notify_sender)

        # Signature settings
        if 'signature' in data:
            sig_data = data['signature']
            if isinstance(sig_data, dict):
                self.use_signature = sig_data.get('enabled', self.use_signature)
                self.signature_text = sig_data.get('text', self.signature_text)
                self.signature_html = sig_data.get('html', self.signature_html)
                self.signature_include_in_replies = sig_data.get('includeInReplies', self.signature_include_in_replies)
                self.signature_include_in_forwards = sig_data.get('includeInForwards', self.signature_include_in_forwards)

        # Folder defaults
        if 'folders' in data:
            folder_data = data['folders']
            if isinstance(folder_data, dict):
                self.default_inbox_folder_id = folder_data.get('defaultInboxFolderId', self.default_inbox_folder_id)
                self.default_sent_folder_id = folder_data.get('defaultSentFolderId', self.default_sent_folder_id)
                self.default_drafts_folder_id = folder_data.get('defaultDraftsFolderId', self.default_drafts_folder_id)
                self.default_trash_folder_id = folder_data.get('defaultTrashFolderId', self.default_trash_folder_id)
                if 'autoFileRules' in folder_data:
                    self.auto_file_rules = folder_data['autoFileRules']

        # Templates
        if 'templates' in data:
            tmpl_data = data['templates']
            if isinstance(tmpl_data, dict):
                if 'signatureTemplates' in tmpl_data:
                    self.signature_templates = tmpl_data['signatureTemplates']
                if 'quickReplyTemplates' in tmpl_data:
                    self.quick_reply_templates = tmpl_data['quickReplyTemplates']
                if 'forwardingRules' in tmpl_data:
                    self.forwarding_rules = tmpl_data['forwardingRules']

        # Storage settings
        if 'storage' in data:
            storage_data = data['storage']
            if isinstance(storage_data, dict):
                self.storage_quota_bytes = storage_data.get('quotaBytes', self.storage_quota_bytes)
                self.storage_warning_percent = storage_data.get('warningPercent', self.storage_warning_percent)
                self.auto_delete_spam_days = storage_data.get('autoDeleteSpamDays', self.auto_delete_spam_days)
                self.auto_delete_trash_days = storage_data.get('autoDeleteTrashDays', self.auto_delete_trash_days)
                self.compress_attachments = storage_data.get('compressAttachments', self.compress_attachments)

        # Accessibility settings
        if 'accessibility' in data:
            acc_data = data['accessibility']
            if isinstance(acc_data, dict):
                self.screen_reader_enabled = acc_data.get('screenReaderEnabled', self.screen_reader_enabled)

        # Advanced settings
        if 'advanced' in data:
            adv_data = data['advanced']
            if isinstance(adv_data, dict):
                self.enable_ai_features = adv_data.get('enableAiFeatures', self.enable_ai_features)
                self.enable_threaded_view = adv_data.get('enableThreadedView', self.enable_threaded_view)
                self.enable_conversation_mode = adv_data.get('enableConversationMode', self.enable_conversation_mode)
                self.conversation_threading_strategy = adv_data.get('conversationThreadingStrategy', self.conversation_threading_strategy)
                self.debug_mode = adv_data.get('debugMode', self.debug_mode)
                self.enable_telemetry = adv_data.get('enableTelemetry', self.enable_telemetry)
                if 'customSettings' in adv_data:
                    self.custom_settings = adv_data['customSettings']

        # Increment version for optimistic locking
        self.version += 1
        self.updated_at = int(datetime.utcnow().timestamp() * 1000)
