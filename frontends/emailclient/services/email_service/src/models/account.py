"""Email account model."""

from datetime import datetime
from src.extensions import db


class EmailAccount(db.Model):
    __tablename__ = "email_accounts"

    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.String(64), nullable=False, index=True)
    account_name = db.Column(db.String(255), nullable=False)
    email_address = db.Column(db.String(255), nullable=False)

    # IMAP settings
    imap_host = db.Column(db.String(255))
    imap_port = db.Column(db.Integer, default=993)
    imap_encryption = db.Column(db.String(16), default="tls")
    imap_username = db.Column(db.String(255))
    imap_password = db.Column(db.String(512))

    # SMTP settings
    smtp_host = db.Column(db.String(255))
    smtp_port = db.Column(db.Integer, default=587)
    smtp_encryption = db.Column(db.String(16), default="tls")
    smtp_username = db.Column(db.String(255))
    smtp_password = db.Column(db.String(512))

    # Sync state
    last_sync_at = db.Column(db.DateTime)
    last_sync_uid = db.Column(db.Integer, default=0)
    sync_status = db.Column(db.String(32), default="idle")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenantId": self.tenant_id,
            "accountName": self.account_name,
            "emailAddress": self.email_address,
            "imapHost": self.imap_host,
            "imapPort": self.imap_port,
            "imapEncryption": self.imap_encryption,
            "smtpHost": self.smtp_host,
            "smtpPort": self.smtp_port,
            "smtpEncryption": self.smtp_encryption,
            "lastSyncAt": self.last_sync_at.isoformat() if self.last_sync_at else None,
            "syncStatus": self.sync_status,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
        }
