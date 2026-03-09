"""Email sync endpoints - trigger and monitor IMAP sync."""

import os
import logging
from datetime import datetime
from imapclient import IMAPClient

from flask import Blueprint, jsonify, request
from src.extensions import db
from src.models.account import EmailAccount
from src.models.message import EmailMessage

logger = logging.getLogger(__name__)
sync_bp = Blueprint("sync", __name__)


@sync_bp.route("/<int:account_id>", methods=["POST"])
def trigger_sync(account_id):
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    account = EmailAccount.query.filter_by(id=account_id, tenant_id=tenant_id).first()
    if not account:
        return jsonify({"error": "Account not found"}), 404

    if account.sync_status == "syncing":
        return jsonify({"status": "already_syncing"})

    account.sync_status = "syncing"
    db.session.commit()

    imap_host = account.imap_host or os.environ.get("DOVECOT_HOST", "dovecot")
    imap_port = account.imap_port or int(os.environ.get("DOVECOT_IMAP_PORT", 143))
    use_ssl = account.imap_encryption == "tls"

    if use_ssl:
        imap_port = account.imap_port or int(os.environ.get("DOVECOT_IMAP_SSL_PORT", 993))

    try:
        client = IMAPClient(imap_host, port=imap_port, ssl=use_ssl)
        if account.imap_encryption == "starttls":
            client.starttls()
        if account.imap_username and account.imap_password:
            client.login(account.imap_username, account.imap_password)

        client.select_folder("INBOX")
        # Fetch messages since last sync UID
        if account.last_sync_uid and account.last_sync_uid > 0:
            messages = client.search(["UID", f"{account.last_sync_uid + 1}:*"])
        else:
            messages = client.search(["ALL"])

        new_count = 0
        if messages:
            fetched = client.fetch(messages, ["ENVELOPE", "BODY.PEEK[TEXT]", "FLAGS"])
            for uid, data in fetched.items():
                envelope = data.get(b"ENVELOPE")
                if not envelope:
                    continue

                existing = EmailMessage.query.filter_by(
                    account_id=account_id, uid=uid
                ).first()
                if existing:
                    continue

                body_text = data.get(b"BODY[TEXT]", b"")
                if isinstance(body_text, bytes):
                    body_text = body_text.decode("utf-8", errors="replace")

                msg = EmailMessage(
                    account_id=account_id,
                    tenant_id=tenant_id,
                    uid=uid,
                    folder="INBOX",
                    subject=str(envelope.subject or b"", "utf-8", errors="replace")
                    if isinstance(envelope.subject, bytes)
                    else str(envelope.subject or ""),
                    from_address=_format_address(envelope.from_),
                    to_addresses=_format_address(envelope.to),
                    date_sent=envelope.date,
                    date_received=datetime.utcnow(),
                    body_text=body_text,
                    is_read=b"\\Seen" in data.get(b"FLAGS", ()),
                )
                db.session.add(msg)
                new_count += 1

                if uid > (account.last_sync_uid or 0):
                    account.last_sync_uid = uid

        account.sync_status = "idle"
        account.last_sync_at = datetime.utcnow()
        db.session.commit()
        client.logout()

        logger.info("Synced %d new messages for account %s", new_count, account_id)
        return jsonify({"status": "complete", "newMessages": new_count})

    except Exception as e:
        account.sync_status = "error"
        db.session.commit()
        logger.error("Sync failed for account %s: %s", account_id, str(e))
        return jsonify({"error": f"Sync failed: {str(e)}"}), 500


@sync_bp.route("/<int:account_id>/status", methods=["GET"])
def sync_status(account_id):
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    account = EmailAccount.query.filter_by(id=account_id, tenant_id=tenant_id).first()
    if not account:
        return jsonify({"error": "Account not found"}), 404
    return jsonify({
        "status": account.sync_status,
        "lastSyncAt": account.last_sync_at.isoformat() if account.last_sync_at else None,
        "lastSyncUid": account.last_sync_uid,
    })


def _format_address(addr_list):
    if not addr_list:
        return ""
    parts = []
    for a in addr_list:
        mailbox = a.mailbox.decode() if isinstance(a.mailbox, bytes) else str(a.mailbox or "")
        host = a.host.decode() if isinstance(a.host, bytes) else str(a.host or "")
        if mailbox and host:
            parts.append(f"{mailbox}@{host}")
    return ", ".join(parts)
