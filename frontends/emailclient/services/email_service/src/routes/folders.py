"""Email folder management endpoints."""

import os
import logging
from imapclient import IMAPClient

from flask import Blueprint, jsonify, request
from src.models.account import EmailAccount

logger = logging.getLogger(__name__)
folders_bp = Blueprint("folders", __name__)


@folders_bp.route("/<int:account_id>", methods=["GET"])
def list_folders(account_id):
    tenant_id = request.headers.get("X-Tenant-Id", "default")
    account = EmailAccount.query.filter_by(id=account_id, tenant_id=tenant_id).first()
    if not account:
        return jsonify({"error": "Account not found"}), 404

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

        raw_folders = client.list_folders()
        client.logout()

        folders = []
        for flags, delimiter, name in raw_folders:
            flag_strs = [f.decode() if isinstance(f, bytes) else str(f) for f in flags]
            folders.append({
                "name": name,
                "delimiter": delimiter.decode() if isinstance(delimiter, bytes) else delimiter,
                "flags": flag_strs,
            })

        return jsonify(folders)

    except Exception as e:
        logger.error("Failed to list folders for account %s: %s", account_id, str(e))
        return jsonify({"error": f"IMAP error: {str(e)}"}), 500
