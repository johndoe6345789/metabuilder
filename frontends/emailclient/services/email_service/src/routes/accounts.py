"""Email account management endpoints."""

import logging
from flask import Blueprint, jsonify, request
from src.extensions import db
from src.models.account import EmailAccount

logger = logging.getLogger(__name__)
accounts_bp = Blueprint("accounts", __name__)


@accounts_bp.route("/", methods=["GET"])
def list_accounts():
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    accounts = EmailAccount.query.filter_by(tenant_id=tenant_id).all()
    return jsonify([a.to_dict() for a in accounts])


@accounts_bp.route("/", methods=["POST"])
def create_account():
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    account = EmailAccount(
        tenant_id=tenant_id,
        account_name=data.get("accountName", ""),
        email_address=data.get("emailAddress", ""),
        imap_host=data.get("imapHost"),
        imap_port=data.get("imapPort", 993),
        imap_encryption=data.get("imapEncryption", "tls"),
        imap_username=data.get("imapUsername"),
        imap_password=data.get("imapPassword"),
        smtp_host=data.get("smtpHost"),
        smtp_port=data.get("smtpPort", 587),
        smtp_encryption=data.get("smtpEncryption", "tls"),
        smtp_username=data.get("smtpUsername"),
        smtp_password=data.get("smtpPassword"),
    )
    db.session.add(account)
    db.session.commit()
    logger.info("Created account %s for tenant %s", account.id, tenant_id)
    return jsonify(account.to_dict()), 201


@accounts_bp.route("/<int:account_id>", methods=["GET"])
def get_account(account_id):
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    account = EmailAccount.query.filter_by(id=account_id, tenant_id=tenant_id).first()
    if not account:
        return jsonify({"error": "Account not found"}), 404
    return jsonify(account.to_dict())


@accounts_bp.route("/<int:account_id>", methods=["DELETE"])
def delete_account(account_id):
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    account = EmailAccount.query.filter_by(id=account_id, tenant_id=tenant_id).first()
    if not account:
        return jsonify({"error": "Account not found"}), 404
    db.session.delete(account)
    db.session.commit()
    logger.info("Deleted account %s for tenant %s", account_id, tenant_id)
    return jsonify({"deleted": True})
