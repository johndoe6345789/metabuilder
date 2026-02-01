"""
SQLAlchemy data models for email service Phase 7
Defines EmailFolder, EmailMessage, and EmailAttachment entities
with multi-tenant support, relationships, cascading deletes, and comprehensive indexes

Note: EmailAccount model is defined in src/models/account.py using Flask-SQLAlchemy
This module provides the related entities (Folder, Message, Attachment)
"""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, Text, ForeignKey,
    UniqueConstraint, Index, JSON, BigInteger
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.db import db
import logging

logger = logging.getLogger(__name__)


def get_uuid():
    """Generate UUID string for SQLAlchemy"""
    return str(uuid.uuid4())


class EmailFolder(db.Model):
    """
    Email folder entity
    Represents mailbox folders (Inbox, Sent, Drafts, etc.)
    Cascade delete: deleting account deletes all folders
    Multi-tenant: every query must filter by tenant_id
    """
    __tablename__ = "email_folders"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign key to EmailAccount
    account_id = Column(String(50), ForeignKey('email_accounts.id', ondelete='CASCADE'), nullable=False, index=True)

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Folder identification
    name = Column(String(255), nullable=False)
    folder_path = Column(String(1024), nullable=False)  # e.g., "[Gmail]/All Mail"

    # Message counts
    unread_count = Column(Integer, nullable=False, default=0)
    message_count = Column(Integer, nullable=False, default=0)

    # Folder flags from IMAP
    flags = Column(JSON, nullable=True, default=list)  # e.g., ["\\All", "\\Drafts"]

    # Metadata (milliseconds since epoch for consistency with other models)
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Relationships
    email_account = relationship("EmailAccount", back_populates="email_folders", foreign_keys=[account_id])
    email_messages = relationship(
        "EmailMessage",
        back_populates="email_folder",
        cascade="all, delete-orphan",
        lazy="select"
    )

    # Indexes
    __table_args__ = (
        Index('idx_email_folder_account', 'account_id'),
        Index('idx_email_folder_tenant', 'tenant_id'),
        Index('idx_email_folder_path', 'account_id', 'folder_path'),
        UniqueConstraint('account_id', 'folder_path', name='uq_email_folder_account_path'),
    )

    def __repr__(self):
        return f"<EmailFolder(id={self.id}, name={self.name}, unread={self.unread_count})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'accountId': self.account_id,
            'tenantId': self.tenant_id,
            'name': self.name,
            'folderPath': self.folder_path,
            'unreadCount': self.unread_count,
            'messageCount': self.message_count,
            'flags': self.flags or [],
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def get_by_id(folder_id: str, tenant_id: str) -> Optional['EmailFolder']:
        """Get folder by ID with multi-tenant verification"""
        return EmailFolder.query.filter_by(id=folder_id, tenant_id=tenant_id).first()

    @staticmethod
    def list_by_account(account_id: str, tenant_id: str) -> List['EmailFolder']:
        """List folders for an account (multi-tenant safe)"""
        return EmailFolder.query.filter_by(account_id=account_id, tenant_id=tenant_id).all()


class EmailMessage(db.Model):
    """
    Email message entity
    Stores individual email messages with full RFC 5322 headers
    Soft delete: messages marked is_deleted instead of purged
    Multi-tenant: every query must filter by tenant_id
    """
    __tablename__ = "email_messages"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign key to EmailFolder
    folder_id = Column(String(50), ForeignKey('email_folders.id', ondelete='CASCADE'), nullable=False, index=True)

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Message identification
    message_id = Column(String(1024), nullable=False, unique=True, index=True)  # RFC 5322 Message-ID

    # Email components
    from_address = Column(String(255), nullable=False, index=True)
    to_addresses = Column(Text, nullable=False)  # JSON encoded or comma-separated
    cc_addresses = Column(Text, nullable=True)
    bcc_addresses = Column(Text, nullable=True)

    # Content
    subject = Column(String(1024), nullable=False)
    body = Column(Text, nullable=True)  # HTML or plaintext
    is_html = Column(Boolean, nullable=False, default=False)

    # Message metadata
    received_at = Column(BigInteger, nullable=False, index=True)  # milliseconds since epoch
    size = Column(Integer, nullable=True)  # bytes

    # Message flags/status
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    is_starred = Column(Boolean, nullable=False, default=False)
    is_deleted = Column(Boolean, nullable=False, default=False, index=True)  # Soft delete

    # IMAP flags
    flags = Column(JSON, nullable=True, default=list)  # e.g., ["\\Seen", "\\Starred"]

    # Full headers for debugging
    headers = Column(JSON, nullable=True)

    # Tracking (milliseconds since epoch)
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Relationships
    email_folder = relationship("EmailFolder", back_populates="email_messages", foreign_keys=[folder_id])
    email_attachments = relationship(
        "EmailAttachment",
        back_populates="email_message",
        cascade="all, delete-orphan",
        lazy="select"
    )

    # Indexes
    __table_args__ = (
        Index('idx_email_message_folder', 'folder_id'),
        Index('idx_email_message_tenant', 'tenant_id'),
        Index('idx_email_message_id', 'message_id'),
        Index('idx_email_message_received', 'received_at'),
        Index('idx_email_message_status', 'is_read', 'is_deleted'),
        Index('idx_email_message_from', 'from_address'),
    )

    def __repr__(self):
        return f"<EmailMessage(id={self.id}, subject={self.subject[:50] if self.subject else 'N/A'}..., from={self.from_address})>"

    def to_dict(self, include_body: bool = True, include_headers: bool = False) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        data = {
            'id': self.id,
            'folderId': self.folder_id,
            'tenantId': self.tenant_id,
            'messageId': self.message_id,
            'fromAddress': self.from_address,
            'toAddresses': self.to_addresses,
            'ccAddresses': self.cc_addresses,
            'bccAddresses': self.bcc_addresses,
            'subject': self.subject,
            'isHtml': self.is_html,
            'receivedAt': self.received_at,
            'size': self.size,
            'isRead': self.is_read,
            'isStarred': self.is_starred,
            'isDeleted': self.is_deleted,
            'flags': self.flags or [],
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }
        if include_body:
            data['body'] = self.body
        if include_headers:
            data['headers'] = self.headers
        return data

    @staticmethod
    def get_by_id(message_id: str, tenant_id: str) -> Optional['EmailMessage']:
        """Get message by ID with multi-tenant verification"""
        return EmailMessage.query.filter_by(id=message_id, tenant_id=tenant_id).first()

    @staticmethod
    def list_by_folder(
        folder_id: str,
        tenant_id: str,
        include_deleted: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List['EmailMessage']:
        """Get messages in a folder with pagination (multi-tenant safe)"""
        query = EmailMessage.query.filter_by(folder_id=folder_id, tenant_id=tenant_id)

        if not include_deleted:
            query = query.filter_by(is_deleted=False)

        return query.order_by(EmailMessage.received_at.desc()).offset(offset).limit(limit).all()

    @staticmethod
    def count_unread(folder_id: str, tenant_id: str) -> int:
        """Count unread messages in a folder (multi-tenant safe)"""
        return EmailMessage.query.filter_by(
            folder_id=folder_id,
            tenant_id=tenant_id,
            is_read=False,
            is_deleted=False
        ).count()


class EmailAttachment(db.Model):
    """
    Email attachment entity
    Stores metadata about message attachments
    Cascade delete: deleting message deletes all attachments
    Multi-tenant: every query must filter by tenant_id
    """
    __tablename__ = "email_attachments"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign key to EmailMessage
    message_id = Column(String(50), ForeignKey('email_messages.id', ondelete='CASCADE'), nullable=False, index=True)

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Attachment metadata
    filename = Column(String(1024), nullable=False)
    mime_type = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)  # bytes

    # Storage
    blob_url = Column(String(1024), nullable=False)  # S3 URL or local path
    blob_key = Column(String(1024), nullable=True)  # S3 key or internal reference

    # Content hash for deduplication
    content_hash = Column(String(64), nullable=True, index=True)  # SHA-256 hash

    # Encoding
    content_encoding = Column(String(255), nullable=True)  # e.g., "base64"

    # Tracking (milliseconds since epoch)
    uploaded_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Relationships
    email_message = relationship("EmailMessage", back_populates="email_attachments", foreign_keys=[message_id])

    # Indexes
    __table_args__ = (
        Index('idx_email_attachment_message', 'message_id'),
        Index('idx_email_attachment_tenant', 'tenant_id'),
        Index('idx_email_attachment_hash', 'content_hash'),
    )

    def __repr__(self):
        return f"<EmailAttachment(id={self.id}, filename={self.filename}, size={self.size})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'messageId': self.message_id,
            'tenantId': self.tenant_id,
            'filename': self.filename,
            'mimeType': self.mime_type,
            'size': self.size,
            'blobUrl': self.blob_url,
            'blobKey': self.blob_key,
            'contentHash': self.content_hash,
            'contentEncoding': self.content_encoding,
            'uploadedAt': self.uploaded_at,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def get_by_id(attachment_id: str, tenant_id: str) -> Optional['EmailAttachment']:
        """Get attachment by ID with multi-tenant verification"""
        return EmailAttachment.query.filter_by(id=attachment_id, tenant_id=tenant_id).first()

    @staticmethod
    def list_by_message(message_id: str, tenant_id: str) -> List['EmailAttachment']:
        """Get all attachments for a message (multi-tenant safe)"""
        return EmailAttachment.query.filter_by(message_id=message_id, tenant_id=tenant_id).all()


class EmailLabel(db.Model):
    """
    Email label entity
    User-defined labels for organizing and categorizing emails
    Multi-tenant: every query must filter by tenant_id
    """
    __tablename__ = "email_labels"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign key to EmailAccount
    account_id = Column(String(50), ForeignKey('email_accounts.id', ondelete='CASCADE'), nullable=False, index=True)

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Label properties
    name = Column(String(255), nullable=False)
    color = Column(String(7), nullable=True, default='#4285F4')  # HEX color code
    description = Column(Text, nullable=True)

    # Display order
    order = Column(Integer, nullable=False, default=0)

    # Tracking (milliseconds since epoch)
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Relationships
    email_account = relationship("EmailAccount", back_populates="email_labels", foreign_keys=[account_id])
    email_filter_labels = relationship(
        "EmailFilter",
        secondary="email_filter_labels",
        back_populates="labels"
    )

    # Indexes
    __table_args__ = (
        Index('idx_email_label_account', 'account_id'),
        Index('idx_email_label_tenant', 'tenant_id'),
        UniqueConstraint('account_id', 'name', name='uq_email_label_account_name'),
    )

    def __repr__(self):
        return f"<EmailLabel(id={self.id}, name={self.name}, color={self.color})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'accountId': self.account_id,
            'tenantId': self.tenant_id,
            'name': self.name,
            'color': self.color,
            'description': self.description,
            'order': self.order,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def get_by_id(label_id: str, tenant_id: str) -> Optional['EmailLabel']:
        """Get label by ID with multi-tenant verification"""
        return EmailLabel.query.filter_by(id=label_id, tenant_id=tenant_id).first()

    @staticmethod
    def list_by_account(account_id: str, tenant_id: str) -> List['EmailLabel']:
        """List labels for an account (multi-tenant safe)"""
        return EmailLabel.query.filter_by(account_id=account_id, tenant_id=tenant_id).order_by(EmailLabel.order).all()


class EmailFilter(db.Model):
    """
    Email filter rule entity
    Defines rules for automatically organizing and managing emails
    Multi-tenant: every query must filter by tenant_id
    """
    __tablename__ = "email_filters"

    # Primary key
    id = Column(String(50), primary_key=True, default=get_uuid, nullable=False)

    # Foreign key to EmailAccount
    account_id = Column(String(50), ForeignKey('email_accounts.id', ondelete='CASCADE'), nullable=False, index=True)

    # Multi-tenant column
    tenant_id = Column(String(50), nullable=False, index=True)

    # Filter properties
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Filter criteria (stored as JSON)
    criteria = Column(JSON, nullable=False)  # Dict with from, to, subject, contains, date_range

    # Filter actions (stored as JSON)
    actions = Column(JSON, nullable=False)  # Dict with move_to_folder, mark_read, apply_labels, delete

    # Execution order (lower = executed first)
    order = Column(Integer, nullable=False, default=0, index=True)

    # Enable/disable flag
    is_enabled = Column(Boolean, nullable=False, default=True, index=True)

    # Apply to new messages
    apply_to_new = Column(Boolean, nullable=False, default=True)

    # Apply retroactively to existing messages
    apply_to_existing = Column(Boolean, nullable=False, default=False)

    # Tracking (milliseconds since epoch)
    created_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))
    updated_at = Column(BigInteger, nullable=False, default=lambda: int(datetime.utcnow().timestamp() * 1000))

    # Relationships
    email_account = relationship("EmailAccount", back_populates="email_filters", foreign_keys=[account_id])
    labels = relationship(
        "EmailLabel",
        secondary="email_filter_labels",
        back_populates="email_filter_labels"
    )

    # Indexes
    __table_args__ = (
        Index('idx_email_filter_account', 'account_id'),
        Index('idx_email_filter_tenant', 'tenant_id'),
        Index('idx_email_filter_enabled', 'is_enabled'),
        UniqueConstraint('account_id', 'name', name='uq_email_filter_account_name'),
    )

    def __repr__(self):
        return f"<EmailFilter(id={self.id}, name={self.name}, order={self.order})>"

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'accountId': self.account_id,
            'tenantId': self.tenant_id,
            'name': self.name,
            'description': self.description,
            'criteria': self.criteria,
            'actions': self.actions,
            'order': self.order,
            'isEnabled': self.is_enabled,
            'applyToNew': self.apply_to_new,
            'applyToExisting': self.apply_to_existing,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def get_by_id(filter_id: str, tenant_id: str) -> Optional['EmailFilter']:
        """Get filter by ID with multi-tenant verification"""
        return EmailFilter.query.filter_by(id=filter_id, tenant_id=tenant_id).first()

    @staticmethod
    def list_by_account(account_id: str, tenant_id: str, enabled_only: bool = False) -> List['EmailFilter']:
        """List filters for an account (multi-tenant safe)"""
        query = EmailFilter.query.filter_by(account_id=account_id, tenant_id=tenant_id)
        if enabled_only:
            query = query.filter_by(is_enabled=True)
        return query.order_by(EmailFilter.order).all()


# Association table for EmailFilter and EmailLabel many-to-many relationship
class EmailFilterLabel(db.Model):
    """
    Association table for EmailFilter and EmailLabel relationship
    """
    __tablename__ = "email_filter_labels"

    # Primary keys (composite)
    filter_id = Column(String(50), ForeignKey('email_filters.id', ondelete='CASCADE'), primary_key=True)
    label_id = Column(String(50), ForeignKey('email_labels.id', ondelete='CASCADE'), primary_key=True)

    # Indexes
    __table_args__ = (
        Index('idx_email_filter_label_filter', 'filter_id'),
        Index('idx_email_filter_label_label', 'label_id'),
    )
