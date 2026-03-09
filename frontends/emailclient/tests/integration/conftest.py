"""
Pytest configuration and fixtures for email client integration tests.

Phase 8: Integration Testing Suite
Provides test environment setup, database fixtures, mock email servers, and sample data.
"""

import os
import json
import pytest
import asyncio
from typing import Generator, AsyncGenerator, Dict, Any
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
import tempfile
import sqlite3

# Database fixtures
@pytest.fixture(scope="session")
def db_url():
    """In-memory SQLite database URL for testing."""
    return "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db():
    """Create an in-memory test database."""
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

    # Create tables matching DBAL schema
    cursor.execute("""
        CREATE TABLE email_client (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            account_name TEXT NOT NULL,
            email_address TEXT UNIQUE NOT NULL,
            protocol TEXT DEFAULT 'imap',
            hostname TEXT NOT NULL,
            port INTEGER NOT NULL,
            encryption TEXT DEFAULT 'tls',
            username TEXT NOT NULL,
            credential_id TEXT NOT NULL,
            is_sync_enabled BOOLEAN DEFAULT 1,
            sync_interval INTEGER DEFAULT 300,
            last_sync_at INTEGER,
            is_syncing BOOLEAN DEFAULT 0,
            is_enabled BOOLEAN DEFAULT 1,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE email_folder (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            email_client_id TEXT NOT NULL,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'custom',
            unread_count INTEGER DEFAULT 0,
            total_count INTEGER DEFAULT 0,
            sync_token TEXT,
            is_selectable BOOLEAN DEFAULT 1,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (email_client_id) REFERENCES email_client(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE email_message (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            email_client_id TEXT NOT NULL,
            folder_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            imap_uid TEXT,
            from_addr TEXT NOT NULL,
            to_addrs TEXT NOT NULL,
            cc_addrs TEXT,
            bcc_addrs TEXT,
            reply_to TEXT,
            subject TEXT NOT NULL,
            text_body TEXT,
            html_body TEXT,
            headers TEXT,
            received_at INTEGER NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            is_starred BOOLEAN DEFAULT 0,
            is_spam BOOLEAN DEFAULT 0,
            is_draft BOOLEAN DEFAULT 0,
            is_sent BOOLEAN DEFAULT 0,
            is_deleted BOOLEAN DEFAULT 0,
            attachment_count INTEGER DEFAULT 0,
            conversation_id TEXT,
            labels TEXT,
            size INTEGER,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY (email_client_id) REFERENCES email_client(id),
            FOREIGN KEY (folder_id) REFERENCES email_folder(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE email_attachment (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            message_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            size INTEGER NOT NULL,
            content_id TEXT,
            is_inline BOOLEAN DEFAULT 0,
            storage_key TEXT UNIQUE NOT NULL,
            download_url TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (message_id) REFERENCES email_message(id)
        )
    """)

    conn.commit()
    yield conn
    conn.close()


# Sample data fixtures
@pytest.fixture
def sample_tenant_id():
    """Sample tenant ID for multi-tenant testing."""
    return "tenant-001"


@pytest.fixture
def sample_user_id():
    """Sample user ID for testing."""
    return "user-001"


@pytest.fixture
def sample_email_client(sample_tenant_id, sample_user_id):
    """Sample email client configuration."""
    return {
        "id": "client-001",
        "tenant_id": sample_tenant_id,
        "user_id": sample_user_id,
        "account_name": "Test Gmail",
        "email_address": "test@gmail.com",
        "protocol": "imap",
        "hostname": "imap.gmail.com",
        "port": 993,
        "encryption": "tls",
        "username": "test@gmail.com",
        "credential_id": "cred-001",
        "is_sync_enabled": True,
        "sync_interval": 300,
        "is_enabled": True,
        "created_at": int(datetime.now().timestamp() * 1000),
        "updated_at": int(datetime.now().timestamp() * 1000),
    }


@pytest.fixture
def sample_folders(sample_tenant_id):
    """Sample email folders."""
    now = int(datetime.now().timestamp() * 1000)
    return {
        "inbox": {
            "id": "folder-inbox",
            "tenant_id": sample_tenant_id,
            "email_client_id": "client-001",
            "name": "INBOX",
            "type": "inbox",
            "unread_count": 5,
            "total_count": 42,
            "is_selectable": True,
            "created_at": now,
            "updated_at": now,
        },
        "sent": {
            "id": "folder-sent",
            "tenant_id": sample_tenant_id,
            "email_client_id": "client-001",
            "name": "[Gmail]/Sent Mail",
            "type": "sent",
            "unread_count": 0,
            "total_count": 156,
            "is_selectable": True,
            "created_at": now,
            "updated_at": now,
        },
        "drafts": {
            "id": "folder-drafts",
            "tenant_id": sample_tenant_id,
            "email_client_id": "client-001",
            "name": "[Gmail]/Drafts",
            "type": "drafts",
            "unread_count": 0,
            "total_count": 3,
            "is_selectable": True,
            "created_at": now,
            "updated_at": now,
        },
        "trash": {
            "id": "folder-trash",
            "tenant_id": sample_tenant_id,
            "email_client_id": "client-001",
            "name": "[Gmail]/Trash",
            "type": "trash",
            "unread_count": 0,
            "total_count": 12,
            "is_selectable": True,
            "created_at": now,
            "updated_at": now,
        },
    }


@pytest.fixture
def sample_messages(sample_tenant_id):
    """Sample email messages for testing."""
    now = int(datetime.now().timestamp() * 1000)
    return [
        {
            "id": f"msg-{i:03d}",
            "tenant_id": sample_tenant_id,
            "email_client_id": "client-001",
            "folder_id": "folder-inbox",
            "message_id": f"<msg-{i}@example.com>",
            "imap_uid": str(1000 + i),
            "from_addr": f"sender{i}@example.com",
            "to_addrs": json.dumps(["test@gmail.com"]),
            "cc_addrs": None,
            "bcc_addrs": None,
            "reply_to": f"sender{i}@example.com",
            "subject": f"Test Email {i}: Important Update",
            "text_body": f"This is a test email #{i} with important content.",
            "html_body": f"<p>This is a test email #{i} with important content.</p>",
            "headers": json.dumps({"From": f"sender{i}@example.com", "Subject": f"Test Email {i}"}),
            "received_at": now - (i * 3600000),  # 1 hour apart
            "is_read": i % 3 == 0,
            "is_starred": i % 5 == 0,
            "is_spam": False,
            "is_draft": False,
            "is_sent": False,
            "is_deleted": False,
            "attachment_count": 1 if i % 4 == 0 else 0,
            "conversation_id": f"conv-{i // 5}",
            "labels": json.dumps(["important", "work"]) if i % 2 == 0 else None,
            "size": 2048 + (i * 512),
            "created_at": now - (i * 3600000),
            "updated_at": now - (i * 3600000),
        }
        for i in range(100)  # 100 sample messages
    ]


@pytest.fixture
def sample_attachments(sample_tenant_id):
    """Sample email attachments."""
    now = int(datetime.now().timestamp() * 1000)
    return [
        {
            "id": f"att-{i:03d}",
            "tenant_id": sample_tenant_id,
            "message_id": f"msg-{i * 4:03d}",  # Attach to every 4th message
            "filename": f"document_{i}.pdf",
            "mime_type": "application/pdf",
            "size": 1024000 + (i * 10000),
            "content_id": None,
            "is_inline": False,
            "storage_key": f"s3://bucket/attachments/doc-{i}.pdf",
            "download_url": f"https://api.example.com/files/att-{i:03d}",
            "created_at": now,
        }
        for i in range(25)
    ]


# Mock email server fixtures
@pytest.fixture
def mock_imap_client():
    """Mock IMAP client for testing."""
    client = AsyncMock()
    client.login = AsyncMock(return_value=("OK", [b"Login successful"]))
    client.logout = AsyncMock(return_value=("OK", []))
    client.list = AsyncMock(return_value=("OK", [
        b'(\\HasNoChildren) "/" "INBOX"',
        b'(\\Noselect \\HasChildren) "/" "[Gmail]"',
        b'(\\HasNoChildren \\All) "/" "[Gmail]/All Mail"',
        b'(\\HasNoChildren \\Drafts) "/" "[Gmail]/Drafts"',
        b'(\\HasNoChildren \\Sent) "/" "[Gmail]/Sent Mail"',
        b'(\\HasNoChildren \\Trash) "/" "[Gmail]/Trash"',
    ]))
    client.select = AsyncMock(return_value=("OK", [b"42"]))  # 42 messages in INBOX
    client.search = AsyncMock(return_value=("OK", [b"1 2 3 4 5"]))
    client.fetch = AsyncMock(return_value=("OK", [
        (b"1", b"From: sender@example.com\r\nSubject: Test\r\n\r\nBody"),
    ]))
    client.store = AsyncMock(return_value=("OK", [b""]))
    return client


@pytest.fixture
def mock_smtp_client():
    """Mock SMTP client for testing."""
    client = AsyncMock()
    client.login = AsyncMock(return_value=(235, b"Auth successful"))
    client.sendmail = AsyncMock(return_value={})
    client.quit = AsyncMock(return_value=(221, b"Bye"))
    return client


# API request fixtures
@pytest.fixture
def api_client():
    """Mock HTTP client for API testing."""
    from unittest.mock import AsyncMock

    client = AsyncMock()
    client.post = AsyncMock()
    client.get = AsyncMock()
    client.put = AsyncMock()
    client.delete = AsyncMock()
    return client


@pytest.fixture
def auth_headers(sample_tenant_id, sample_user_id):
    """Sample authorization headers."""
    return {
        "Authorization": f"Bearer test-token",
        "X-Tenant-ID": sample_tenant_id,
        "X-User-ID": sample_user_id,
        "Content-Type": "application/json",
    }


# Redis/Celery fixtures
@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    client = AsyncMock()
    client.set = AsyncMock(return_value=True)
    client.get = AsyncMock(return_value=b"cached-value")
    client.delete = AsyncMock(return_value=1)
    client.exists = AsyncMock(return_value=1)
    client.lpush = AsyncMock(return_value=1)
    client.lpop = AsyncMock(return_value=b"item")
    return client


@pytest.fixture
def mock_celery_task():
    """Mock Celery task for testing."""
    task = AsyncMock()
    task.delay = MagicMock(return_value=MagicMock(id="task-001"))
    task.apply_async = AsyncMock(return_value=MagicMock(id="task-001"))
    return task


# Event loop fixture
@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# Benchmark fixtures
@pytest.fixture
def benchmark_timer():
    """Simple timer for benchmarking."""
    class Timer:
        def __init__(self):
            self.start_time = None
            self.elapsed = 0

        def __enter__(self):
            self.start_time = datetime.now()
            return self

        def __exit__(self, *args):
            self.elapsed = (datetime.now() - self.start_time).total_seconds()

    return Timer


# Docker compose fixtures
@pytest.fixture(scope="session")
def docker_compose_up():
    """Start Docker Compose services for integration tests."""
    import subprocess

    try:
        subprocess.run(
            ["docker-compose", "up", "-d"],
            cwd="/Users/rmac/Documents/metabuilder/emailclient",
            capture_output=True,
            timeout=60
        )
        yield
        subprocess.run(
            ["docker-compose", "down"],
            cwd="/Users/rmac/Documents/metabuilder/emailclient",
            capture_output=True,
        )
    except Exception as e:
        pytest.skip(f"Docker Compose not available: {e}")


# Cleanup fixtures
@pytest.fixture(autouse=True)
def cleanup(test_db):
    """Clean up database after each test."""
    yield
    cursor = test_db.cursor()
    cursor.execute("DELETE FROM email_attachment")
    cursor.execute("DELETE FROM email_message")
    cursor.execute("DELETE FROM email_folder")
    cursor.execute("DELETE FROM email_client")
    test_db.commit()
