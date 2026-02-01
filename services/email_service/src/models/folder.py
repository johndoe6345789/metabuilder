"""
Email Folder database model
Represents email folders/mailboxes with hierarchy support
"""
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy import Column, String, Integer, Boolean, BigInteger, DateTime, Index, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db import db
import uuid


class EmailFolder(db.Model):
    """
    Email Folder entity
    Stores folder/mailbox structure with parent-child relationships
    Supports special folders (Inbox, Sent, Drafts, Trash, Spam)
    """
    __tablename__ = 'email_folders'

    # Primary key
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Multi-tenant columns
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Folder configuration
    account_id = Column(String(50), nullable=False, index=True)  # FK to EmailAccount
    folder_name = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)

    # Folder hierarchy (parent folder ID for nested folders)
    parent_folder_id = Column(String(50), nullable=True, index=True)

    # Special folder type
    folder_type = Column(String(50), nullable=False, default='custom')  # inbox, sent, drafts, trash, spam, custom

    # IMAP-specific attributes
    imap_name = Column(String(255), nullable=False)  # Full IMAP path (e.g., "[Gmail]/All Mail")
    is_system_folder = Column(Boolean, nullable=False, default=False)

    # Folder state
    unread_count = Column(Integer, nullable=False, default=0)
    total_count = Column(Integer, nullable=False, default=0)
    is_selectable = Column(Boolean, nullable=False, default=True)  # Can contain messages
    has_children = Column(Boolean, nullable=False, default=False)
    is_visible = Column(Boolean, nullable=False, default=True)

    # Sync tracking
    last_synced_at = Column(BigInteger, nullable=True)  # milliseconds since epoch
    sync_state_uidvalidity = Column(String(255), nullable=True)  # IMAP UIDVALIDITY
    sync_state_uidnext = Column(Integer, nullable=True)  # IMAP UIDNEXT

    # Timestamps
    created_at = Column(BigInteger, nullable=False)  # milliseconds since epoch
    updated_at = Column(BigInteger, nullable=False)  # milliseconds since epoch

    # Indexes for common queries
    __table_args__ = (
        Index('idx_user_tenant', 'user_id', 'tenant_id'),
        Index('idx_account_id', 'account_id', 'tenant_id'),
        Index('idx_folder_type', 'folder_type', 'tenant_id'),
        Index('idx_parent_folder', 'parent_folder_id', 'account_id'),
    )

    def __repr__(self):
        return f'<EmailFolder {self.display_name} ({self.id})>'

    def to_dict(self, include_counts: bool = True) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'tenantId': str(self.tenant_id),
            'userId': str(self.user_id),
            'accountId': self.account_id,
            'folderName': self.folder_name,
            'displayName': self.display_name,
            'parentFolderId': self.parent_folder_id,
            'folderType': self.folder_type,
            'imapName': self.imap_name,
            'isSystemFolder': self.is_system_folder,
            'unreadCount': self.unread_count if include_counts else None,
            'totalCount': self.total_count if include_counts else None,
            'isSelectable': self.is_selectable,
            'hasChildren': self.has_children,
            'isVisible': self.is_visible,
            'lastSyncedAt': self.last_synced_at,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def from_dict(data: Dict[str, Any], tenant_id: str, user_id: str, account_id: str) -> 'EmailFolder':
        """Create EmailFolder from request dictionary"""
        now = int(datetime.utcnow().timestamp() * 1000)

        folder = EmailFolder(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            user_id=user_id,
            account_id=account_id,
            folder_name=data.get('folderName'),
            display_name=data.get('displayName', data.get('folderName')),
            parent_folder_id=data.get('parentFolderId'),
            folder_type=data.get('folderType', 'custom'),
            imap_name=data.get('imapName', data.get('folderName', '')),
            is_system_folder=data.get('isSystemFolder', False),
            unread_count=data.get('unreadCount', 0),
            total_count=data.get('totalCount', 0),
            is_selectable=data.get('isSelectable', True),
            has_children=data.get('hasChildren', False),
            is_visible=data.get('isVisible', True),
            created_at=now,
            updated_at=now,
        )

        return folder

    @staticmethod
    def list_for_account(account_id: str, tenant_id: str, user_id: str, parent_id: Optional[str] = None) -> List['EmailFolder']:
        """
        List email folders for an account

        Args:
            account_id: Account ID
            tenant_id: Tenant ID for verification
            user_id: User ID for verification
            parent_id: Filter by parent folder ID (for hierarchy)

        Returns:
            List of EmailFolder objects
        """
        query = EmailFolder.query.filter_by(
            account_id=account_id,
            tenant_id=tenant_id,
            user_id=user_id,
            is_visible=True
        ).order_by(EmailFolder.display_name.asc())

        if parent_id:
            query = query.filter_by(parent_folder_id=parent_id)

        return query.all()

    @staticmethod
    def get_by_id(folder_id: str, tenant_id: str, user_id: str) -> Optional['EmailFolder']:
        """
        Get email folder by ID with multi-tenant verification

        Args:
            folder_id: Folder ID
            tenant_id: Tenant ID for verification
            user_id: User ID for verification

        Returns:
            EmailFolder if found and authorized, None otherwise
        """
        return EmailFolder.query.filter_by(
            id=folder_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()

    @staticmethod
    def get_system_folder(account_id: str, folder_type: str, tenant_id: str, user_id: str) -> Optional['EmailFolder']:
        """
        Get a system folder (Inbox, Sent, etc.) for an account

        Args:
            account_id: Account ID
            folder_type: Type of folder (inbox, sent, drafts, trash, spam)
            tenant_id: Tenant ID for verification
            user_id: User ID for verification

        Returns:
            EmailFolder if found, None otherwise
        """
        return EmailFolder.query.filter_by(
            account_id=account_id,
            folder_type=folder_type,
            tenant_id=tenant_id,
            user_id=user_id,
            is_system_folder=True
        ).first()

    @staticmethod
    def create(data: Dict[str, Any], tenant_id: str, user_id: str, account_id: str) -> 'EmailFolder':
        """
        Create new email folder

        Args:
            data: Folder data from request
            tenant_id: Tenant ID
            user_id: User ID
            account_id: Account ID

        Returns:
            New EmailFolder instance
        """
        folder = EmailFolder.from_dict(data, tenant_id, user_id, account_id)
        db.session.add(folder)
        db.session.commit()
        return folder

    def update(self, data: Dict[str, Any]) -> None:
        """
        Update email folder

        Args:
            data: Updated fields
        """
        now = int(datetime.utcnow().timestamp() * 1000)

        # Update allowed fields
        for field in ['displayName', 'parentFolderId', 'unreadCount', 'totalCount',
                      'isVisible', 'hasChildren', 'syncStateUidvalidity', 'syncStateUidnext']:
            snake_case = ''.join(['_' + c.lower() if c.isupper() else c for c in field]).lstrip('_')
            if field in data:
                setattr(self, snake_case, data[field])

        # Update sync timestamp if counts changed
        if 'unreadCount' in data or 'totalCount' in data:
            self.last_synced_at = now

        self.updated_at = now
        db.session.commit()

    def increment_message_count(self, is_unread: bool = False) -> None:
        """
        Increment message count (called when new message arrives)

        Args:
            is_unread: If True, increment unread count as well
        """
        self.total_count = (self.total_count or 0) + 1
        if is_unread:
            self.unread_count = (self.unread_count or 0) + 1

        now = int(datetime.utcnow().timestamp() * 1000)
        self.updated_at = now
        db.session.commit()

    def decrement_message_count(self, is_unread: bool = False) -> None:
        """
        Decrement message count (called when message is deleted)

        Args:
            is_unread: If True, decrement unread count as well
        """
        self.total_count = max(0, (self.total_count or 1) - 1)
        if is_unread:
            self.unread_count = max(0, (self.unread_count or 1) - 1)

        now = int(datetime.utcnow().timestamp() * 1000)
        self.updated_at = now
        db.session.commit()

    def delete(self) -> None:
        """Soft delete email folder (mark as invisible)"""
        self.is_visible = False
        now = int(datetime.utcnow().timestamp() * 1000)
        self.updated_at = now
        db.session.commit()

    def hard_delete(self) -> None:
        """Permanently delete email folder (use with caution)"""
        db.session.delete(self)
        db.session.commit()

    def get_child_folders(self) -> List['EmailFolder']:
        """Get all direct child folders"""
        return EmailFolder.query.filter_by(
            parent_folder_id=self.id,
            is_visible=True
        ).order_by(EmailFolder.display_name.asc()).all()

    def get_hierarchy_path(self) -> List['EmailFolder']:
        """Get full folder hierarchy from root to this folder"""
        path = [self]
        current = self

        while current.parent_folder_id:
            parent = EmailFolder.query.filter_by(id=current.parent_folder_id).first()
            if not parent:
                break
            path.insert(0, parent)
            current = parent

        return path
