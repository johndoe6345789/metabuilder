"""Email compose and send endpoints."""

import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import Blueprint, jsonify, request
from src.extensions import db
from src.models.account import EmailAccount
from src.models.message import EmailMessage

logger = logging.getLogger(__name__)
compose_bp = Blueprint("compose", __name__)


@compose_bp.route("/", methods=["POST"])
def send_email():
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    account_id = data.get("accountId")
    if not account_id:
        return jsonify({"error": "accountId required"}), 400

    account = EmailAccount.query.filter_by(id=account_id, tenant_id=tenant_id).first()
    if not account:
        return jsonify({"error": "Account not found"}), 404

    to_addr = data.get("to", "")
    subject = data.get("subject", "")
    body = data.get("body", "")
    body_html = data.get("bodyHtml")

    # Build MIME message
    if body_html:
        msg = MIMEMultipart("alternative")
        msg.attach(MIMEText(body, "plain"))
        msg.attach(MIMEText(body_html, "html"))
    else:
        msg = MIMEText(body, "plain")

    msg["From"] = account.email_address
    msg["To"] = to_addr
    msg["Subject"] = subject
    if data.get("cc"):
        msg["Cc"] = data["cc"]
    if data.get("replyTo"):
        msg["Reply-To"] = data["replyTo"]

    # Send via SMTP
    smtp_host = account.smtp_host or os.environ.get("POSTFIX_HOST", "postfix")
    smtp_port = account.smtp_port or int(os.environ.get("POSTFIX_PORT", 25))

    try:
        if account.smtp_encryption == "ssl":
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=30)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=30)
            if account.smtp_encryption == "tls":
                server.starttls()

        if account.smtp_username and account.smtp_password:
            server.login(account.smtp_username, account.smtp_password)

        recipients = [to_addr]
        if data.get("cc"):
            recipients.extend(data["cc"].split(","))
        if data.get("bcc"):
            recipients.extend(data["bcc"].split(","))

        server.sendmail(account.email_address, recipients, msg.as_string())
        server.quit()
        logger.info("Sent email from %s to %s via %s:%s", account.email_address, to_addr, smtp_host, smtp_port)
        return jsonify({"sent": True, "to": to_addr, "subject": subject})

    except Exception as e:
        logger.error("Failed to send email: %s", str(e))
        return jsonify({"error": f"Send failed: {str(e)}"}), 500


@compose_bp.route("/drafts", methods=["GET"])
def list_drafts():
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    drafts = EmailMessage.query.filter_by(tenant_id=tenant_id, is_draft=True).all()
    return jsonify([d.to_dict() for d in drafts])


@compose_bp.route("/drafts", methods=["POST"])
def save_draft():
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    draft = EmailMessage(
        account_id=data.get("accountId"),
        tenant_id=tenant_id,
        folder="Drafts",
        subject=data.get("subject"),
        from_address=data.get("from"),
        to_addresses=data.get("to"),
        cc_addresses=data.get("cc"),
        body_text=data.get("body"),
        body_html=data.get("bodyHtml"),
        is_draft=True,
    )
    db.session.add(draft)
    db.session.commit()
    return jsonify(draft.to_dict()), 201
