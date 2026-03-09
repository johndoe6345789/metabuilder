"""Email message model."""

from datetime import datetime
from src.extensions import db


class EmailMessage(db.Model):
    __tablename__ = "email_messages"

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("email_accounts.id"), nullable=False)
    tenant_id = db.Column(db.String(64), nullable=False, index=True)
    message_id = db.Column(db.String(512), unique=True)
    uid = db.Column(db.Integer)
    folder = db.Column(db.String(255), default="INBOX")

    subject = db.Column(db.String(1024))
    from_address = db.Column(db.String(512))
    to_addresses = db.Column(db.Text)
    cc_addresses = db.Column(db.Text)
    bcc_addresses = db.Column(db.Text)
    reply_to = db.Column(db.String(512))

    body_text = db.Column(db.Text)
    body_html = db.Column(db.Text)
    has_attachments = db.Column(db.Boolean, default=False)

    is_read = db.Column(db.Boolean, default=False)
    is_starred = db.Column(db.Boolean, default=False)
    is_draft = db.Column(db.Boolean, default=False)

    date_sent = db.Column(db.DateTime)
    date_received = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "accountId": self.account_id,
            "messageId": self.message_id,
            "uid": self.uid,
            "folder": self.folder,
            "subject": self.subject,
            "from": self.from_address,
            "to": self.to_addresses,
            "cc": self.cc_addresses,
            "bcc": self.bcc_addresses,
            "bodyText": self.body_text,
            "bodyHtml": self.body_html,
            "hasAttachments": self.has_attachments,
            "isRead": self.is_read,
            "isStarred": self.is_starred,
            "isDraft": self.is_draft,
            "dateSent": self.date_sent.isoformat() if self.date_sent else None,
            "dateReceived": self.date_received.isoformat() if self.date_received else None,
        }
