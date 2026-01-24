"""
Email Account database model
Represents email client configuration (IMAP/POP3)
"""
from datetime import datetime
from typing import Dict, Any, Optional, List
from sqlalchemy import Column, String, Integer, Boolean, BigInteger, DateTime, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db import db
import uuid


class EmailAccount(db.Model):
    """
    Email Account entity
    Stores email client configuration with encrypted credentials
    """
    __tablename__ = 'email_accounts'

    # Primary key
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Multi-tenant columns
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Account configuration
    account_name = Column(String(255), nullable=False)
    email_address = Column(String(255), nullable=False)
    protocol = Column(String(20), nullable=False, default='imap')  # imap, pop3
    hostname = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    encryption = Column(String(20), nullable=False, default='tls')  # none, tls, starttls
    username = Column(String(255), nullable=False)

    # Credential reference (encrypted in separate credential store)
    credential_id = Column(String(50), nullable=False)

    # Sync configuration
    is_sync_enabled = Column(Boolean, nullable=False, default=True)
    sync_interval = Column(Integer, nullable=False, default=300)  # seconds
    last_sync_at = Column(BigInteger, nullable=True)  # milliseconds since epoch
    is_syncing = Column(Boolean, nullable=False, default=False)
    is_enabled = Column(Boolean, nullable=False, default=True)

    # Timestamps
    created_at = Column(BigInteger, nullable=False)  # milliseconds since epoch
    updated_at = Column(BigInteger, nullable=False)  # milliseconds since epoch

    # Relationships
    email_folders = relationship(
        "EmailFolder",
        back_populates="email_account",
        cascade="all, delete-orphan",
        lazy="select",
        foreign_keys="EmailFolder.account_id"
    )
    email_filters = relationship(
        "EmailFilter",
        back_populates="email_account",
        cascade="all, delete-orphan",
        lazy="select",
        foreign_keys="EmailFilter.account_id"
    )
    email_labels = relationship(
        "EmailLabel",
        back_populates="email_account",
        cascade="all, delete-orphan",
        lazy="select",
        foreign_keys="EmailLabel.account_id"
    )

    # Indexes for common queries
    __table_args__ = (
        Index('idx_user_tenant', 'user_id', 'tenant_id'),
        Index('idx_email_tenant', 'email_address', 'tenant_id'),
        Index('idx_tenant_enabled', 'tenant_id', 'is_enabled'),
    )

    def __repr__(self):
        return f'<EmailAccount {self.email_address} ({self.id})>'

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'tenantId': str(self.tenant_id),
            'userId': str(self.user_id),
            'accountName': self.account_name,
            'emailAddress': self.email_address,
            'protocol': self.protocol,
            'hostname': self.hostname,
            'port': self.port,
            'encryption': self.encryption,
            'username': self.username,
            'credentialId': self.credential_id,
            'isSyncEnabled': self.is_sync_enabled,
            'syncInterval': self.sync_interval,
            'lastSyncAt': self.last_sync_at,
            'isSyncing': self.is_syncing,
            'isEnabled': self.is_enabled,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
        }

    @staticmethod
    def from_dict(data: Dict[str, Any], tenant_id: str, user_id: str) -> 'EmailAccount':
        """Create EmailAccount from request dictionary"""
        now = int(datetime.utcnow().timestamp() * 1000)

        account = EmailAccount(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            user_id=user_id,
            account_name=data.get('accountName'),
            email_address=data.get('emailAddress'),
            protocol=data.get('protocol', 'imap'),
            hostname=data.get('hostname'),
            port=data.get('port'),
            encryption=data.get('encryption', 'tls'),
            username=data.get('username'),
            credential_id=data.get('credentialId'),
            is_sync_enabled=data.get('isSyncEnabled', True),
            sync_interval=data.get('syncInterval', 300),
            is_enabled=True,
            created_at=now,
            updated_at=now,
        )

        return account

    @staticmethod
    def list_for_user(tenant_id: str, user_id: str, limit: int = 100, offset: int = 0) -> tuple:
        """
        List email accounts for a specific user and tenant

        Args:
            tenant_id: Tenant ID for multi-tenant filtering
            user_id: User ID for row-level access control
            limit: Maximum number of results (pagination)
            offset: Number of results to skip (pagination)

        Returns:
            Tuple of (accounts list, total count)
        """
        query = EmailAccount.query.filter_by(
            tenant_id=tenant_id,
            user_id=user_id
        ).order_by(EmailAccount.created_at.desc())

        total = query.count()
        accounts = query.limit(limit).offset(offset).all()

        return accounts, total

    @staticmethod
    def get_by_id(account_id: str, tenant_id: str, user_id: str) -> Optional['EmailAccount']:
        """
        Get email account by ID with multi-tenant verification

        Args:
            account_id: Account ID
            tenant_id: Tenant ID for verification
            user_id: User ID for verification

        Returns:
            EmailAccount if found and authorized, None otherwise
        """
        return EmailAccount.query.filter_by(
            id=account_id,
            tenant_id=tenant_id,
            user_id=user_id
        ).first()

    @staticmethod
    def create(data: Dict[str, Any], tenant_id: str, user_id: str) -> 'EmailAccount':
        """
        Create new email account

        Args:
            data: Account data from request
            tenant_id: Tenant ID
            user_id: User ID

        Returns:
            New EmailAccount instance
        """
        account = EmailAccount.from_dict(data, tenant_id, user_id)
        db.session.add(account)
        db.session.commit()
        return account

    def update(self, data: Dict[str, Any]) -> None:
        """
        Update email account

        Args:
            data: Updated fields
        """
        now = int(datetime.utcnow().timestamp() * 1000)

        # Update allowed fields
        for field in ['accountName', 'hostname', 'port', 'encryption', 'username',
                      'isSyncEnabled', 'syncInterval', 'isEnabled']:
            snake_case = ''.join(['_' + c.lower() if c.isupper() else c for c in field]).lstrip('_')
            if field in data:
                setattr(self, snake_case, data[field])

        self.updated_at = now
        db.session.commit()

    def delete(self) -> None:
        """Soft delete email account"""
        self.is_enabled = False
        now = int(datetime.utcnow().timestamp() * 1000)
        self.updated_at = now
        db.session.commit()

    def hard_delete(self) -> None:
        """Permanently delete email account (use with caution)"""
        db.session.delete(self)
        db.session.commit()
