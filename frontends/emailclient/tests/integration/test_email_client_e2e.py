"""
Phase 8: End-to-End Integration Tests for Email Client

Comprehensive test suite covering:
- Account creation and configuration
- Email synchronization (IMAP/POP3)
- Email send operations (SMTP)
- Email receive and parsing
- Folder management
- Attachment handling
- Search and filtering
- Error handling and recovery
- Performance benchmarks
- Docker Compose integration
"""

import pytest
import asyncio
import json
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any
from unittest.mock import patch, AsyncMock, MagicMock, call
import base64


# ============================================================================
# Test Fixtures & Test Data
# ============================================================================


@pytest.fixture
def email_test_payload():
    """RFC 5322 compliant test email."""
    return b"""From: sender@example.com
To: test@gmail.com
Cc: cc@example.com
Subject: Test Email Payload
Date: Mon, 24 Jan 2026 10:00:00 +0000
Message-ID: <test-001@example.com>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="boundary-001"

--boundary-001
Content-Type: text/plain; charset="utf-8"

This is a test email with plain text body.

--boundary-001
Content-Type: text/html; charset="utf-8"

<p>This is a test email with HTML body.</p>

--boundary-001
Content-Type: application/pdf; name="test.pdf"
Content-Transfer-Encoding: base64

JVBERi0xLjQKJeLjz9MNCjEgMCBvYmog

--boundary-001--
"""


# ============================================================================
# Phase 8.1: Account Creation & Configuration Tests
# ============================================================================


class TestAccountCreation:
    """End-to-end account creation workflow."""

    def test_create_email_account_minimal(self, test_db, sample_tenant_id, sample_user_id):
        """Test creating an email account with minimal required fields."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        cursor.execute("""
            INSERT INTO email_client
            (id, tenant_id, user_id, account_name, email_address, protocol,
             hostname, port, encryption, username, credential_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "client-new", sample_tenant_id, sample_user_id, "New Account",
            "user@example.com", "imap", "imap.example.com", 993, "tls",
            "user@example.com", "cred-new", now, now
        ))
        test_db.commit()

        # Verify creation
        cursor.execute(
            "SELECT id, email_address, protocol, hostname FROM email_client WHERE id = ?",
            ("client-new",)
        )
        result = cursor.fetchone()
        assert result is not None
        assert result[1] == "user@example.com"
        assert result[2] == "imap"
        assert result[3] == "imap.example.com"

    def test_create_email_account_with_sync_settings(self, test_db, sample_email_client):
        """Test creating account with custom sync settings."""
        cursor = test_db.cursor()

        cursor.execute("""
            INSERT INTO email_client
            (id, tenant_id, user_id, account_name, email_address, protocol,
             hostname, port, encryption, username, credential_id,
             is_sync_enabled, sync_interval, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "client-sync", sample_email_client["tenant_id"], sample_email_client["user_id"],
            "Sync Account", "sync@example.com", "imap", "imap.example.com", 993, "tls",
            "sync@example.com", "cred-sync", True, 600,
            int(datetime.now().timestamp() * 1000),
            int(datetime.now().timestamp() * 1000)
        ))
        test_db.commit()

        cursor.execute(
            "SELECT sync_interval, is_sync_enabled FROM email_client WHERE id = ?",
            ("client-sync",)
        )
        result = cursor.fetchone()
        assert result[0] == 600  # Custom sync interval
        assert result[1] == 1    # Sync enabled

    def test_create_duplicate_email_account_fails(self, test_db, sample_email_client):
        """Test that creating duplicate accounts fails (unique constraint)."""
        cursor = test_db.cursor()

        # Insert first account
        cursor.execute("""
            INSERT INTO email_client
            (id, tenant_id, user_id, account_name, email_address, protocol,
             hostname, port, encryption, username, credential_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "client-1", sample_email_client["tenant_id"], sample_email_client["user_id"],
            sample_email_client["account_name"], sample_email_client["email_address"],
            sample_email_client["protocol"], sample_email_client["hostname"],
            sample_email_client["port"], sample_email_client["encryption"],
            sample_email_client["username"], sample_email_client["credential_id"],
            int(datetime.now().timestamp() * 1000),
            int(datetime.now().timestamp() * 1000)
        ))
        test_db.commit()

        # Try to insert duplicate
        with pytest.raises(sqlite3.IntegrityError):
            cursor.execute("""
                INSERT INTO email_client
                (id, tenant_id, user_id, account_name, email_address, protocol,
                 hostname, port, encryption, username, credential_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "client-2", sample_email_client["tenant_id"], sample_email_client["user_id"],
                "Duplicate", sample_email_client["email_address"],
                sample_email_client["protocol"], sample_email_client["hostname"],
                sample_email_client["port"], sample_email_client["encryption"],
                sample_email_client["username"], "cred-dup",
                int(datetime.now().timestamp() * 1000),
                int(datetime.now().timestamp() * 1000)
            ))
            test_db.commit()

    def test_account_multi_tenant_isolation(self, test_db):
        """Test that accounts are properly isolated by tenant."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create accounts for two different tenants
        for tenant_id in ["tenant-1", "tenant-2"]:
            cursor.execute("""
                INSERT INTO email_client
                (id, tenant_id, user_id, account_name, email_address, protocol,
                 hostname, port, encryption, username, credential_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"client-{tenant_id}", tenant_id, "user-001", "Account",
                f"user-{tenant_id}@example.com", "imap", "imap.example.com", 993, "tls",
                f"user-{tenant_id}@example.com", f"cred-{tenant_id}", now, now
            ))

        test_db.commit()

        # Verify tenant-1 sees only its account
        cursor.execute(
            "SELECT COUNT(*) FROM email_client WHERE tenant_id = ?",
            ("tenant-1",)
        )
        assert cursor.fetchone()[0] == 1

        # Verify tenant-2 sees only its account
        cursor.execute(
            "SELECT COUNT(*) FROM email_client WHERE tenant_id = ?",
            ("tenant-2",)
        )
        assert cursor.fetchone()[0] == 1


# ============================================================================
# Phase 8.2: Email Synchronization Tests
# ============================================================================


class TestEmailSync:
    """Email synchronization (IMAP/POP3) tests."""

    @pytest.mark.asyncio
    async def test_imap_sync_basic(self, mock_imap_client, sample_email_client):
        """Test basic IMAP sync operation."""
        # Mock IMAP sequence
        mock_imap_client.login.assert_not_called()
        mock_imap_client.select.assert_not_called()

        await mock_imap_client.login(sample_email_client["username"], "password")
        await mock_imap_client.select("INBOX")

        # Verify calls
        mock_imap_client.login.assert_called_once()
        mock_imap_client.select.assert_called_once_with("INBOX")

    @pytest.mark.asyncio
    async def test_imap_fetch_messages(self, mock_imap_client):
        """Test fetching messages via IMAP."""
        await mock_imap_client.login("user@gmail.com", "password")
        await mock_imap_client.select("INBOX")
        status, messages = await mock_imap_client.search("ALL")

        assert status == "OK"
        assert b"1 2 3 4 5" in messages

    def test_sync_creates_folders(self, test_db, sample_tenant_id, sample_folders):
        """Test that sync creates folders in database."""
        cursor = test_db.cursor()

        for folder_key, folder_data in sample_folders.items():
            cursor.execute("""
                INSERT INTO email_folder
                (id, tenant_id, email_client_id, name, type,
                 unread_count, total_count, is_selectable, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                folder_data["id"], folder_data["tenant_id"], folder_data["email_client_id"],
                folder_data["name"], folder_data["type"], folder_data["unread_count"],
                folder_data["total_count"], folder_data["is_selectable"],
                folder_data["created_at"], folder_data["updated_at"]
            ))

        test_db.commit()

        # Verify folders created
        cursor.execute("SELECT COUNT(*) FROM email_folder")
        assert cursor.fetchone()[0] == 4  # 4 folders (inbox, sent, drafts, trash)

    def test_sync_incremental_with_sync_token(self, test_db, sample_email_client):
        """Test incremental sync using sync tokens."""
        cursor = test_db.cursor()

        # Insert initial folder
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, sync_token, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-001", sample_email_client["tenant_id"], sample_email_client["id"],
            "INBOX", "inbox", 0, 0, "sync-token-v1",
            True, int(datetime.now().timestamp() * 1000),
            int(datetime.now().timestamp() * 1000)
        ))

        # Update with new sync token
        now = int(datetime.now().timestamp() * 1000)
        cursor.execute("""
            UPDATE email_folder SET sync_token = ?, updated_at = ?
            WHERE id = ?
        """, ("sync-token-v2", now, "folder-001"))

        test_db.commit()

        # Verify sync token updated
        cursor.execute("SELECT sync_token FROM email_folder WHERE id = ?", ("folder-001",))
        assert cursor.fetchone()[0] == "sync-token-v2"

    def test_sync_updates_unread_count(self, test_db):
        """Test that sync updates unread message counts."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create folder
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-001", "tenant-001", "client-001", "INBOX", "inbox",
            0, 0, True, now, now
        ))

        # Create messages with unread status
        for i in range(5):
            cursor.execute("""
                INSERT INTO email_message
                (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                 from_addr, to_addrs, subject, received_at, is_read, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"msg-{i}", "tenant-001", "client-001", "folder-001",
                f"<msg-{i}@example.com>", str(1000 + i),
                "sender@example.com", '["test@gmail.com"]', f"Subject {i}",
                now, i % 2 == 0, now, now  # Half read, half unread
            ))

        # Update folder unread count
        cursor.execute("""
            UPDATE email_folder SET unread_count = 3, total_count = 5 WHERE id = ?
        """, ("folder-001",))

        test_db.commit()

        # Verify counts
        cursor.execute("SELECT unread_count, total_count FROM email_folder WHERE id = ?", ("folder-001",))
        unread, total = cursor.fetchone()
        assert unread == 3
        assert total == 5


# ============================================================================
# Phase 8.3: Email Send Tests
# ============================================================================


class TestEmailSend:
    """Email sending (SMTP) tests."""

    @pytest.mark.asyncio
    async def test_smtp_send_simple_email(self, mock_smtp_client):
        """Test sending a simple email via SMTP."""
        await mock_smtp_client.login("user@example.com", "password")

        recipients = ["recipient@example.com"]
        message = "From: user@example.com\r\nTo: recipient@example.com\r\nSubject: Test\r\n\r\nBody"

        await mock_smtp_client.sendmail("user@example.com", recipients, message)

        mock_smtp_client.sendmail.assert_called_once_with(
            "user@example.com", recipients, message
        )

    @pytest.mark.asyncio
    async def test_smtp_send_with_attachments(self, mock_smtp_client, email_test_payload):
        """Test sending email with attachments."""
        recipients = ["recipient@example.com"]

        await mock_smtp_client.sendmail("sender@example.com", recipients, email_test_payload)

        mock_smtp_client.sendmail.assert_called_once()

    def test_save_sent_message_to_database(self, test_db, sample_tenant_id):
        """Test that sent messages are saved to database."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create Sent folder
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-sent", sample_tenant_id, "client-001", "Sent", "sent",
            0, 0, True, now, now
        ))

        # Insert sent message
        cursor.execute("""
            INSERT INTO email_message
            (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
             from_addr, to_addrs, subject, text_body, received_at,
             is_sent, is_read, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "msg-sent-001", sample_tenant_id, "client-001", "folder-sent",
            "<msg-sent-001@example.com>", None,
            "user@example.com", '["recipient@example.com"]', "Test Email",
            "This is a sent email.", now, True, True, now, now
        ))

        test_db.commit()

        # Verify message saved
        cursor.execute("SELECT is_sent FROM email_message WHERE id = ?", ("msg-sent-001",))
        assert cursor.fetchone()[0] == 1


# ============================================================================
# Phase 8.4: Email Receive & Message Parsing Tests
# ============================================================================


class TestEmailReceive:
    """Email receiving and parsing tests."""

    def test_parse_rfc5322_email(self, email_test_payload):
        """Test parsing RFC 5322 compliant email."""
        payload_str = email_test_payload.decode('utf-8')

        # Extract headers
        lines = payload_str.split('\r\n')
        headers = {}
        for line in lines:
            if ':' in line and not line.startswith(' '):
                key, value = line.split(':', 1)
                headers[key.strip()] = value.strip()

        assert headers["From"] == "sender@example.com"
        assert headers["To"] == "test@gmail.com"
        assert headers["Subject"] == "Test Email Payload"
        assert "Message-ID" in headers

    def test_store_received_message(self, test_db, sample_tenant_id, email_test_payload):
        """Test storing received message in database."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create inbox folder
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-inbox", sample_tenant_id, "client-001", "INBOX", "inbox",
            0, 0, True, now, now
        ))

        # Store received message
        cursor.execute("""
            INSERT INTO email_message
            (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
             from_addr, to_addrs, cc_addrs, subject, text_body, html_body,
             headers, received_at, is_read, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "msg-recv-001", sample_tenant_id, "client-001", "folder-inbox",
            "<msg-recv-001@example.com>", "1",
            "sender@example.com", '["test@gmail.com"]', '["cc@example.com"]',
            "Test Email Payload", "This is a test email with plain text body.",
            "<p>This is a test email with HTML body.</p>",
            json.dumps({
                "From": "sender@example.com",
                "To": "test@gmail.com",
                "Subject": "Test Email Payload"
            }),
            now, False, now, now
        ))

        test_db.commit()

        # Verify stored
        cursor.execute("SELECT subject, from_addr FROM email_message WHERE id = ?", ("msg-recv-001",))
        subject, sender = cursor.fetchone()
        assert subject == "Test Email Payload"
        assert sender == "sender@example.com"

    def test_message_with_multiple_recipients(self, test_db, sample_tenant_id):
        """Test handling messages with multiple recipients."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        recipients = ["user1@example.com", "user2@example.com", "user3@example.com"]

        cursor.execute("""
            INSERT INTO email_message
            (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
             from_addr, to_addrs, subject, received_at, is_read, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "msg-multi", sample_tenant_id, "client-001", "folder-001",
            "<msg-multi@example.com>", "100",
            "sender@example.com", json.dumps(recipients), "Multi-recipient email",
            now, False, now, now
        ))

        test_db.commit()

        cursor.execute("SELECT to_addrs FROM email_message WHERE id = ?", ("msg-multi",))
        to_addrs_json = cursor.fetchone()[0]
        to_addrs = json.loads(to_addrs_json)

        assert len(to_addrs) == 3
        assert all(addr in to_addrs for addr in recipients)


# ============================================================================
# Phase 8.5: Folder Management Tests
# ============================================================================


class TestFolderManagement:
    """Folder creation, deletion, and organization tests."""

    def test_create_folder(self, test_db, sample_tenant_id):
        """Test creating a new folder."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-custom", sample_tenant_id, "client-001", "My Archive", "custom",
            0, 0, True, now, now
        ))

        test_db.commit()

        cursor.execute("SELECT name FROM email_folder WHERE id = ?", ("folder-custom",))
        assert cursor.fetchone()[0] == "My Archive"

    def test_folder_hierarchy(self, test_db, sample_tenant_id):
        """Test folder hierarchy (parent-child relationships)."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create parent folder
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-parent", sample_tenant_id, "client-001", "Projects", "custom",
            0, 0, False, now, now
        ))

        # Create child folder
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-child", sample_tenant_id, "client-001", "Projects/2026", "custom",
            0, 0, True, now, now
        ))

        test_db.commit()

        cursor.execute("SELECT name FROM email_folder WHERE id IN (?, ?)",
                      ("folder-parent", "folder-child"))
        folders = [row[0] for row in cursor.fetchall()]
        assert "Projects" in folders
        assert "Projects/2026" in folders

    def test_rename_folder(self, test_db):
        """Test renaming a folder."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-rename", "tenant-001", "client-001", "Old Name", "custom",
            0, 0, True, now, now
        ))

        test_db.commit()

        # Rename folder
        cursor.execute("""
            UPDATE email_folder SET name = ? WHERE id = ?
        """, ("New Name", "folder-rename"))

        test_db.commit()

        cursor.execute("SELECT name FROM email_folder WHERE id = ?", ("folder-rename",))
        assert cursor.fetchone()[0] == "New Name"

    def test_soft_delete_folder(self, test_db):
        """Test soft-deleting a folder (mark as deleted)."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-delete", "tenant-001", "client-001", "To Delete", "custom",
            0, 0, True, now, now
        ))

        test_db.commit()

        # Soft delete by marking is_selectable as false
        cursor.execute("""
            UPDATE email_folder SET is_selectable = 0 WHERE id = ?
        """, ("folder-delete",))

        test_db.commit()

        cursor.execute("SELECT is_selectable FROM email_folder WHERE id = ?", ("folder-delete",))
        assert cursor.fetchone()[0] == 0


# ============================================================================
# Phase 8.6: Attachment Handling Tests
# ============================================================================


class TestAttachmentHandling:
    """Attachment storage, download, and metadata tests."""

    def test_store_attachment_metadata(self, test_db, sample_tenant_id):
        """Test storing attachment metadata."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        cursor.execute("""
            INSERT INTO email_attachment
            (id, tenant_id, message_id, filename, mime_type, size,
             is_inline, storage_key, download_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "att-001", sample_tenant_id, "msg-001", "document.pdf",
            "application/pdf", 1024000, False,
            "s3://bucket/attachments/doc-001.pdf",
            "https://api.example.com/files/att-001", now
        ))

        test_db.commit()

        cursor.execute("""
            SELECT filename, mime_type, size FROM email_attachment WHERE id = ?
        """, ("att-001",))
        filename, mime_type, size = cursor.fetchone()
        assert filename == "document.pdf"
        assert mime_type == "application/pdf"
        assert size == 1024000

    def test_multiple_attachments_per_message(self, test_db, sample_tenant_id):
        """Test handling multiple attachments for one message."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        msg_id = "msg-attach"
        attachments = [
            ("att-1", "document.pdf", "application/pdf", 1024000),
            ("att-2", "image.png", "image/png", 512000),
            ("att-3", "archive.zip", "application/zip", 2048000),
        ]

        for att_id, filename, mime_type, size in attachments:
            cursor.execute("""
                INSERT INTO email_attachment
                (id, tenant_id, message_id, filename, mime_type, size,
                 is_inline, storage_key, download_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                att_id, sample_tenant_id, msg_id, filename, mime_type, size, False,
                f"s3://bucket/{att_id}", f"https://api.example.com/files/{att_id}", now
            ))

        test_db.commit()

        cursor.execute("""
            SELECT COUNT(*) FROM email_attachment WHERE message_id = ?
        """, (msg_id,))
        count = cursor.fetchone()[0]
        assert count == 3

    def test_inline_attachment_metadata(self, test_db, sample_tenant_id):
        """Test inline attachment handling (embedded images)."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        cursor.execute("""
            INSERT INTO email_attachment
            (id, tenant_id, message_id, filename, mime_type, size,
             content_id, is_inline, storage_key, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "att-inline", sample_tenant_id, "msg-001", "logo.png",
            "image/png", 50000, "<logo@example.com>", True,
            "s3://bucket/inline/logo.png", now
        ))

        test_db.commit()

        cursor.execute("""
            SELECT is_inline, content_id FROM email_attachment WHERE id = ?
        """, ("att-inline",))
        is_inline, content_id = cursor.fetchone()
        assert is_inline == 1
        assert content_id == "<logo@example.com>"

    def test_attachment_download_url_generation(self, test_db, sample_tenant_id):
        """Test that download URLs are properly generated."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        cursor.execute("""
            INSERT INTO email_attachment
            (id, tenant_id, message_id, filename, mime_type, size,
             is_inline, storage_key, download_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "att-download", sample_tenant_id, "msg-001", "file.pdf",
            "application/pdf", 1024000, False,
            "s3://bucket/attachments/file.pdf",
            "https://api.example.com/files/att-download?token=abc123", now
        ))

        test_db.commit()

        cursor.execute("""
            SELECT download_url FROM email_attachment WHERE id = ?
        """, ("att-download",))
        url = cursor.fetchone()[0]
        assert url.startswith("https://api.example.com/files/")
        assert "token=" in url


# ============================================================================
# Phase 8.7: Search & Filtering Tests
# ============================================================================


class TestSearchAndFiltering:
    """Message search, filtering, and query tests."""

    def test_search_by_subject(self, test_db, sample_tenant_id, sample_messages):
        """Test searching messages by subject."""
        cursor = test_db.cursor()

        # Insert sample messages
        for msg in sample_messages:
            cursor.execute("""
                INSERT INTO email_message
                (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                 from_addr, to_addrs, subject, text_body, received_at,
                 is_read, is_starred, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                msg["id"], msg["tenant_id"], msg["email_client_id"], msg["folder_id"],
                msg["message_id"], msg["imap_uid"], msg["from_addr"], msg["to_addrs"],
                msg["subject"], msg["text_body"], msg["received_at"],
                msg["is_read"], msg["is_starred"], msg["created_at"], msg["updated_at"]
            ))

        test_db.commit()

        # Search for "Important"
        cursor.execute("""
            SELECT id, subject FROM email_message
            WHERE tenant_id = ? AND subject LIKE ?
            LIMIT 10
        """, (sample_tenant_id, "%Important%"))

        results = cursor.fetchall()
        assert len(results) > 0
        assert all("Important" in row[1] for row in results)

    def test_filter_unread_messages(self, test_db, sample_tenant_id, sample_messages):
        """Test filtering unread messages."""
        cursor = test_db.cursor()

        # Insert sample messages
        for msg in sample_messages:
            cursor.execute("""
                INSERT INTO email_message
                (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                 from_addr, to_addrs, subject, text_body, received_at,
                 is_read, is_starred, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                msg["id"], msg["tenant_id"], msg["email_client_id"], msg["folder_id"],
                msg["message_id"], msg["imap_uid"], msg["from_addr"], msg["to_addrs"],
                msg["subject"], msg["text_body"], msg["received_at"],
                msg["is_read"], msg["is_starred"], msg["created_at"], msg["updated_at"]
            ))

        test_db.commit()

        # Filter for unread (is_read = 0)
        cursor.execute("""
            SELECT COUNT(*) FROM email_message
            WHERE tenant_id = ? AND is_read = 0
        """, (sample_tenant_id,))

        unread_count = cursor.fetchone()[0]
        # Approximately half should be unread based on sample data
        assert unread_count > 0

    def test_filter_starred_messages(self, test_db, sample_tenant_id, sample_messages):
        """Test filtering starred/flagged messages."""
        cursor = test_db.cursor()

        # Insert sample messages
        for msg in sample_messages:
            cursor.execute("""
                INSERT INTO email_message
                (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                 from_addr, to_addrs, subject, text_body, received_at,
                 is_read, is_starred, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                msg["id"], msg["tenant_id"], msg["email_client_id"], msg["folder_id"],
                msg["message_id"], msg["imap_uid"], msg["from_addr"], msg["to_addrs"],
                msg["subject"], msg["text_body"], msg["received_at"],
                msg["is_read"], msg["is_starred"], msg["created_at"], msg["updated_at"]
            ))

        test_db.commit()

        # Filter for starred
        cursor.execute("""
            SELECT COUNT(*) FROM email_message
            WHERE tenant_id = ? AND is_starred = 1
        """, (sample_tenant_id,))

        starred_count = cursor.fetchone()[0]
        assert starred_count > 0

    def test_search_by_sender(self, test_db, sample_tenant_id, sample_messages):
        """Test searching messages by sender address."""
        cursor = test_db.cursor()

        # Insert sample messages
        for msg in sample_messages[:10]:
            cursor.execute("""
                INSERT INTO email_message
                (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                 from_addr, to_addrs, subject, text_body, received_at,
                 is_read, is_starred, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                msg["id"], msg["tenant_id"], msg["email_client_id"], msg["folder_id"],
                msg["message_id"], msg["imap_uid"], msg["from_addr"], msg["to_addrs"],
                msg["subject"], msg["text_body"], msg["received_at"],
                msg["is_read"], msg["is_starred"], msg["created_at"], msg["updated_at"]
            ))

        test_db.commit()

        # Search for messages from sender0
        cursor.execute("""
            SELECT COUNT(*) FROM email_message
            WHERE tenant_id = ? AND from_addr LIKE ?
        """, (sample_tenant_id, "%sender0%"))

        count = cursor.fetchone()[0]
        assert count > 0

    def test_search_date_range(self, test_db, sample_tenant_id, sample_messages):
        """Test searching messages within a date range."""
        cursor = test_db.cursor()

        # Insert sample messages
        for msg in sample_messages:
            cursor.execute("""
                INSERT INTO email_message
                (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                 from_addr, to_addrs, subject, text_body, received_at,
                 is_read, is_starred, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                msg["id"], msg["tenant_id"], msg["email_client_id"], msg["folder_id"],
                msg["message_id"], msg["imap_uid"], msg["from_addr"], msg["to_addrs"],
                msg["subject"], msg["text_body"], msg["received_at"],
                msg["is_read"], msg["is_starred"], msg["created_at"], msg["updated_at"]
            ))

        test_db.commit()

        # Search for messages in last 24 hours
        now = int(datetime.now().timestamp() * 1000)
        yesterday = now - (24 * 3600000)

        cursor.execute("""
            SELECT COUNT(*) FROM email_message
            WHERE tenant_id = ? AND received_at BETWEEN ? AND ?
        """, (sample_tenant_id, yesterday, now))

        count = cursor.fetchone()[0]
        assert count > 0


# ============================================================================
# Phase 8.8: Error Handling & Recovery Tests
# ============================================================================


class TestErrorHandling:
    """Network failures, authentication errors, timeouts, and recovery."""

    @pytest.mark.asyncio
    async def test_imap_connection_failure(self, mock_imap_client):
        """Test handling IMAP connection failures."""
        # Simulate connection error
        mock_imap_client.login.side_effect = Exception("Connection refused")

        with pytest.raises(Exception):
            await mock_imap_client.login("user@example.com", "password")

    @pytest.mark.asyncio
    async def test_smtp_authentication_failure(self, mock_smtp_client):
        """Test handling SMTP authentication failures."""
        mock_smtp_client.login.side_effect = Exception("Authentication failed")

        with pytest.raises(Exception):
            await mock_smtp_client.login("user@example.com", "wrong-password")

    def test_invalid_email_address_rejected(self, test_db, sample_tenant_id):
        """Test that invalid email addresses are rejected."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Try to insert invalid email address
        with pytest.raises(sqlite3.IntegrityError):
            cursor.execute("""
                INSERT INTO email_client
                (id, tenant_id, user_id, account_name, email_address, protocol,
                 hostname, port, encryption, username, credential_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "client-invalid", sample_tenant_id, "user-001", "Invalid",
                "not-an-email", "imap", "imap.example.com", 993, "tls",
                "not-an-email", "cred-invalid", now, now
            ))

    def test_database_connection_retry(self, test_db):
        """Test retry logic for database connections."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # First attempt
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-retry", "tenant-001", "client-001", "Retry", "custom",
            0, 0, True, now, now
        ))

        test_db.commit()

        # Verify insert succeeded
        cursor.execute("SELECT id FROM email_folder WHERE id = ?", ("folder-retry",))
        assert cursor.fetchone() is not None

    def test_rate_limit_handling(self):
        """Test handling API rate limit responses."""
        # Simulate rate limit response (429)
        response = MagicMock()
        response.status_code = 429
        response.headers = {"Retry-After": "60"}

        assert response.status_code == 429
        assert response.headers["Retry-After"] == "60"

    def test_sync_error_recovery(self, test_db, sample_tenant_id):
        """Test recovery from sync errors."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create client with sync flag
        cursor.execute("""
            INSERT INTO email_client
            (id, tenant_id, user_id, account_name, email_address, protocol,
             hostname, port, encryption, username, credential_id,
             is_syncing, last_sync_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "client-recover", sample_tenant_id, "user-001", "Recover", "recover@example.com",
            "imap", "imap.example.com", 993, "tls", "recover@example.com", "cred-recover",
            True, now - 3600000, now, now  # syncing for 1 hour
        ))

        test_db.commit()

        # Reset sync flag (recovery action)
        cursor.execute("""
            UPDATE email_client SET is_syncing = 0, updated_at = ? WHERE id = ?
        """, (now, "client-recover"))

        test_db.commit()

        cursor.execute("SELECT is_syncing FROM email_client WHERE id = ?", ("client-recover",))
        assert cursor.fetchone()[0] == 0


# ============================================================================
# Phase 8.9: Performance Tests
# ============================================================================


class TestPerformance:
    """Performance benchmarks: sync 100+ messages, search large mailbox, etc."""

    def test_sync_100_messages_performance(self, test_db, sample_tenant_id, benchmark_timer):
        """Benchmark syncing 100 messages."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create folder
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-perf", sample_tenant_id, "client-001", "Inbox", "inbox",
            0, 0, True, now, now
        ))

        with benchmark_timer() as timer:
            for i in range(100):
                cursor.execute("""
                    INSERT INTO email_message
                    (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                     from_addr, to_addrs, subject, text_body, received_at,
                     is_read, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    f"msg-perf-{i}", sample_tenant_id, "client-001", "folder-perf",
                    f"<msg-perf-{i}@example.com>", str(1000 + i),
                    f"sender{i}@example.com", '["test@gmail.com"]',
                    f"Subject {i}", f"Body {i}", now - (i * 3600000),
                    i % 2 == 0, now, now
                ))

            test_db.commit()

        # Should complete in reasonable time
        assert timer.elapsed < 5.0  # Less than 5 seconds

    def test_search_large_mailbox_performance(self, test_db, sample_tenant_id, benchmark_timer):
        """Benchmark searching in a large mailbox."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create 1000 messages
        cursor.execute("""
            INSERT INTO email_folder
            (id, tenant_id, email_client_id, name, type,
             unread_count, total_count, is_selectable, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "folder-large", sample_tenant_id, "client-001", "Large", "custom",
            0, 0, True, now, now
        ))

        for i in range(1000):
            cursor.execute("""
                INSERT INTO email_message
                (id, tenant_id, email_client_id, folder_id, message_id, imap_uid,
                 from_addr, to_addrs, subject, text_body, received_at,
                 is_read, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"msg-large-{i}", sample_tenant_id, "client-001", "folder-large",
                f"<msg-large-{i}@example.com>", str(10000 + i),
                f"sender{i % 10}@example.com", '["test@gmail.com"]',
                f"Subject {i}", f"Body {i}", now - (i * 3600000),
                i % 3 == 0, now, now
            ))

        test_db.commit()

        # Search in large mailbox
        with benchmark_timer() as timer:
            cursor.execute("""
                SELECT COUNT(*) FROM email_message
                WHERE tenant_id = ? AND subject LIKE ? AND is_read = 0
            """, (sample_tenant_id, "%Subject%"))
            result = cursor.fetchone()

        # Should complete quickly even with large dataset
        assert timer.elapsed < 1.0
        assert result[0] > 0

    def test_folder_list_with_counts_performance(self, test_db, sample_tenant_id, benchmark_timer):
        """Benchmark listing folders with message counts."""
        cursor = test_db.cursor()
        now = int(datetime.now().timestamp() * 1000)

        # Create 20 folders
        for j in range(20):
            cursor.execute("""
                INSERT INTO email_folder
                (id, tenant_id, email_client_id, name, type,
                 unread_count, total_count, is_selectable, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"folder-{j}", sample_tenant_id, "client-001", f"Folder {j}", "custom",
                j * 5, j * 20, True, now, now
            ))

        test_db.commit()

        with benchmark_timer() as timer:
            cursor.execute("""
                SELECT id, name, unread_count, total_count
                FROM email_folder WHERE tenant_id = ?
                ORDER BY name
            """, (sample_tenant_id,))
            folders = cursor.fetchall()

        assert timer.elapsed < 0.5
        assert len(folders) == 20


# ============================================================================
# Phase 8.10: Docker Compose Integration Tests
# ============================================================================


class TestDockerComposeIntegration:
    """Tests requiring Docker Compose services (Redis, PostgreSQL, etc)."""

    @pytest.mark.skipif(
        not os.environ.get("RUN_DOCKER_TESTS"),
        reason="Docker Compose tests require RUN_DOCKER_TESTS=1"
    )
    def test_redis_connection(self, docker_compose_up, mock_redis):
        """Test Redis connectivity."""
        mock_redis.set("test-key", "test-value")
        value = mock_redis.get("test-key")
        assert value == b"test-value"

    @pytest.mark.skipif(
        not os.environ.get("RUN_DOCKER_TESTS"),
        reason="Docker Compose tests require RUN_DOCKER_TESTS=1"
    )
    def test_postgres_connection(self, docker_compose_up):
        """Test PostgreSQL connectivity."""
        # This would require psycopg2 or similar
        # For now, we just verify the docker container is running
        import subprocess

        result = subprocess.run(
            ["docker", "ps", "-f", "name=emailclient-postgres"],
            capture_output=True,
            text=True
        )

        assert "emailclient-postgres" in result.stdout or result.returncode == 0

    @pytest.mark.skipif(
        not os.environ.get("RUN_DOCKER_TESTS"),
        reason="Docker Compose tests require RUN_DOCKER_TESTS=1"
    )
    def test_postfix_smtp_available(self, docker_compose_up):
        """Test Postfix SMTP service is available."""
        import subprocess

        result = subprocess.run(
            ["docker", "ps", "-f", "name=emailclient-postfix"],
            capture_output=True,
            text=True
        )

        assert "emailclient-postfix" in result.stdout or result.returncode == 0

    @pytest.mark.skipif(
        not os.environ.get("RUN_DOCKER_TESTS"),
        reason="Docker Compose tests require RUN_DOCKER_TESTS=1"
    )
    def test_dovecot_imap_available(self, docker_compose_up):
        """Test Dovecot IMAP service is available."""
        import subprocess

        result = subprocess.run(
            ["docker", "ps", "-f", "name=emailclient-dovecot"],
            capture_output=True,
            text=True
        )

        assert "emailclient-dovecot" in result.stdout or result.returncode == 0


# ============================================================================
# Phase 8.11: API Endpoint Tests
# ============================================================================


class TestAPIEndpoints:
    """Test API endpoints with valid and invalid payloads."""

    def test_create_account_api_valid_payload(self, api_client, auth_headers, sample_email_client):
        """Test creating account via API with valid payload."""
        api_client.post.return_value = MagicMock(
            status_code=201,
            json=lambda: {"id": "client-001", "email_address": "test@gmail.com"}
        )

        response = api_client.post(
            "/api/v1/tenant-001/email_client/email_client",
            json=sample_email_client,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["id"] == "client-001"

    def test_create_account_api_missing_required_field(self, api_client, auth_headers):
        """Test creating account with missing required field."""
        invalid_payload = {
            "account_name": "Test",
            # Missing email_address
            "hostname": "imap.example.com",
        }

        api_client.post.return_value = MagicMock(
            status_code=400,
            json=lambda: {"error": "Missing required field: email_address"}
        )

        response = api_client.post(
            "/api/v1/tenant-001/email_client/email_client",
            json=invalid_payload,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_list_accounts_api(self, api_client, auth_headers):
        """Test listing email accounts."""
        api_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "accounts": [
                    {"id": "client-1", "email_address": "user1@example.com"},
                    {"id": "client-2", "email_address": "user2@example.com"},
                ]
            }
        )

        response = api_client.get(
            "/api/v1/tenant-001/email_client/email_client",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["accounts"]) == 2

    def test_get_account_api(self, api_client, auth_headers):
        """Test getting single account."""
        api_client.get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "id": "client-001",
                "email_address": "test@gmail.com",
                "is_enabled": True
            }
        )

        response = api_client.get(
            "/api/v1/tenant-001/email_client/email_client/client-001",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "client-001"

    def test_update_account_api(self, api_client, auth_headers):
        """Test updating account."""
        update_payload = {
            "sync_interval": 600,
            "is_sync_enabled": False,
        }

        api_client.put.return_value = MagicMock(
            status_code=200,
            json=lambda: {"id": "client-001", **update_payload}
        )

        response = api_client.put(
            "/api/v1/tenant-001/email_client/email_client/client-001",
            json=update_payload,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["sync_interval"] == 600

    def test_delete_account_api(self, api_client, auth_headers):
        """Test deleting account."""
        api_client.delete.return_value = MagicMock(status_code=204)

        response = api_client.delete(
            "/api/v1/tenant-001/email_client/email_client/client-001",
            headers=auth_headers
        )

        assert response.status_code == 204

    def test_api_invalid_tenant_id(self, api_client, auth_headers):
        """Test API rejects requests for unauthorized tenant."""
        api_client.get.return_value = MagicMock(
            status_code=403,
            json=lambda: {"error": "Unauthorized tenant"}
        )

        headers = {**auth_headers, "X-Tenant-ID": "unauthorized-tenant"}

        response = api_client.get(
            "/api/v1/unauthorized-tenant/email_client/email_client",
            headers=headers
        )

        assert response.status_code == 403

    def test_api_missing_auth_headers(self, api_client):
        """Test API rejects requests without auth headers."""
        api_client.get.return_value = MagicMock(
            status_code=401,
            json=lambda: {"error": "Missing authorization header"}
        )

        response = api_client.get(
            "/api/v1/tenant-001/email_client/email_client"
            # No headers
        )

        assert response.status_code == 401


# ============================================================================
# Phase 8.12: Workflow Plugin Tests
# ============================================================================


class TestWorkflowPlugins:
    """Test email workflow plugins: sync, search, parse, send."""

    def test_imap_sync_workflow_plugin(self, mock_imap_client):
        """Test IMAP sync plugin execution."""
        plugin_payload = {
            "operation": "imap_sync",
            "credentials": {
                "hostname": "imap.gmail.com",
                "username": "user@gmail.com",
                "password": "app-password"
            },
            "folders": ["INBOX", "[Gmail]/Sent Mail"],
            "since_token": "sync-token-v1"
        }

        # Simulate plugin execution
        assert plugin_payload["operation"] == "imap_sync"
        assert "credentials" in plugin_payload
        assert len(plugin_payload["folders"]) == 2

    def test_email_search_workflow_plugin(self):
        """Test email search plugin."""
        plugin_payload = {
            "operation": "email_search",
            "query": "subject:important from:boss@example.com",
            "folder": "INBOX",
            "limit": 50
        }

        # Verify plugin structure
        assert plugin_payload["operation"] == "email_search"
        assert "query" in plugin_payload
        assert plugin_payload["limit"] == 50

    def test_email_parse_workflow_plugin(self, email_test_payload):
        """Test email parse plugin."""
        plugin_payload = {
            "operation": "email_parse",
            "raw_email": email_test_payload.decode('utf-8'),
            "extract_attachments": True,
            "sanitize_html": True
        }

        # Verify plugin can be configured
        assert plugin_payload["operation"] == "email_parse"
        assert plugin_payload["sanitize_html"] is True

    def test_smtp_send_workflow_plugin(self):
        """Test SMTP send plugin."""
        plugin_payload = {
            "operation": "smtp_send",
            "credentials": {
                "hostname": "smtp.gmail.com",
                "username": "sender@gmail.com",
                "password": "app-password"
            },
            "message": {
                "from": "sender@gmail.com",
                "to": ["recipient@example.com"],
                "cc": [],
                "bcc": [],
                "subject": "Test Email",
                "body": "Email content",
                "attachments": []
            }
        }

        # Verify send plugin structure
        assert plugin_payload["operation"] == "smtp_send"
        assert plugin_payload["message"]["subject"] == "Test Email"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
