"""
Tests for Phase 7 IMAP Protocol Handler
Comprehensive test suite with mocking and integration tests
"""
import pytest
import threading
import time
from unittest.mock import Mock, MagicMock, patch, call
from datetime import datetime
import imaplib

from src.handlers.imap import (
    IMAPProtocolHandler,
    IMAPConnectionPool,
    IMAPConnection,
    IMAPConnectionConfig,
    IMAPConnectionState,
    IMAPFolder,
    IMAPMessage,
)


class TestIMAPConnectionConfig:
    """Test IMAP connection configuration"""

    def test_config_creation(self):
        """Test creating connection config"""
        config = IMAPConnectionConfig(
            hostname="imap.gmail.com",
            port=993,
            username="user@gmail.com",
            password="password",
            encryption="tls",
        )

        assert config.hostname == "imap.gmail.com"
        assert config.port == 993
        assert config.username == "user@gmail.com"
        assert config.password == "password"
        assert config.encryption == "tls"
        assert config.timeout == 30
        assert config.max_retries == 3

    def test_config_custom_timeout(self):
        """Test config with custom timeout"""
        config = IMAPConnectionConfig(
            hostname="imap.example.com",
            port=993,
            username="user",
            password="pass",
            timeout=60,
        )

        assert config.timeout == 60


class TestIMAPConnection:
    """Test single IMAP connection"""

    @pytest.fixture
    def config(self):
        """Create test config"""
        return IMAPConnectionConfig(
            hostname="imap.gmail.com",
            port=993,
            username="user@gmail.com",
            password="password",
        )

    def test_connection_initialization(self, config):
        """Test connection initializes in disconnected state"""
        conn = IMAPConnection(config)

        assert conn.state == IMAPConnectionState.DISCONNECTED
        assert conn.connection is None
        assert conn.current_folder is None
        assert len(conn.uid_validity) == 0

    @patch("imaplib.IMAP4_SSL")
    def test_connect_success(self, mock_imap, config):
        """Test successful connection"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        result = conn.connect()

        assert result is True
        assert conn.state == IMAPConnectionState.AUTHENTICATED
        mock_imap.assert_called_once()
        mock_instance.login.assert_called_once_with(config.username, config.password)

    @patch("imaplib.IMAP4_SSL")
    def test_connect_authentication_failure(self, mock_imap, config):
        """Test connection with authentication failure"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("NO", [b"Authentication failed"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        result = conn.connect()

        assert result is False
        assert conn.state == IMAPConnectionState.ERROR

    @patch("imaplib.IMAP4_SSL")
    def test_connect_timeout_retry(self, mock_imap, config):
        """Test connection retry on timeout"""
        import socket

        mock_imap.side_effect = socket.timeout("Connection timeout")

        conn = IMAPConnection(config)
        result = conn.connect()

        assert result is False
        assert conn.state == IMAPConnectionState.ERROR
        assert mock_imap.call_count == config.max_retries

    @patch("imaplib.IMAP4_SSL")
    def test_disconnect(self, mock_imap, config):
        """Test disconnect"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        conn.disconnect()

        assert conn.state == IMAPConnectionState.DISCONNECTED
        assert conn.connection is None
        mock_instance.close.assert_called_once()
        mock_instance.logout.assert_called_once()

    @patch("imaplib.IMAP4_SSL")
    def test_select_folder(self, mock_imap, config):
        """Test selecting a folder"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"42"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        success, count = conn.select_folder("INBOX")

        assert success is True
        assert count == 42
        assert conn.current_folder == "INBOX"
        assert conn.state == IMAPConnectionState.SELECTED

    @patch("imaplib.IMAP4_SSL")
    def test_select_folder_failure(self, mock_imap, config):
        """Test selecting non-existent folder"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("NO", [b"Folder not found"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        success, count = conn.select_folder("NonExistent")

        assert success is False
        assert count is None

    @patch("imaplib.IMAP4_SSL")
    def test_list_folders(self, mock_imap, config):
        """Test listing folders"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.list.return_value = (
            "OK",
            [
                b'(\\HasNoChildren) "/" "INBOX"',
                b'(\\HasChildren \\Noselect) "/" "[Gmail]"',
                b'(\\HasNoChildren \\Sent) "/" "[Gmail]/Sent Mail"',
                b'(\\HasNoChildren \\Drafts) "/" "[Gmail]/Drafts"',
            ],
        )
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        folders = conn.list_folders()

        assert len(folders) > 0
        assert any(f.name == "INBOX" for f in folders)
        assert all(isinstance(f, IMAPFolder) for f in folders)

    @patch("imaplib.IMAP4_SSL")
    def test_list_folders_empty(self, mock_imap, config):
        """Test listing folders when none available"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.list.return_value = ("NO", None)
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        folders = conn.list_folders()

        assert len(folders) == 0

    @patch("imaplib.IMAP4_SSL")
    def test_search_criteria(self, mock_imap, config):
        """Test searching for messages"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.uid.return_value = ("OK", [b"1 2 3 4 5"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        uids = conn.search("INBOX", "UNSEEN")

        assert uids == [1, 2, 3, 4, 5]
        mock_instance.uid.assert_called()

    @patch("imaplib.IMAP4_SSL")
    def test_search_empty_result(self, mock_imap, config):
        """Test search with no results"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.uid.return_value = ("OK", [b""])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        uids = conn.search("INBOX", "UNSEEN")

        assert uids == []

    @patch("imaplib.IMAP4_SSL")
    def test_set_flags(self, mock_imap, config):
        """Test setting message flags"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.uid.return_value = ("OK", [b""])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        success = conn.set_flags(1, [r"\Seen"], "INBOX")

        assert success is True
        mock_instance.uid.assert_called()

    @patch("imaplib.IMAP4_SSL")
    def test_start_idle(self, mock_imap, config):
        """Test starting IDLE mode"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.idle.return_value = ("OK", [b""])
        mock_instance.idle_check.side_effect = [
            [b"1 EXISTS"],
            Exception("Stop idle"),
        ]
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        result = conn.start_idle()

        assert result is True
        assert conn.state == IMAPConnectionState.IDLE

        # Clean up
        conn.stop_idle()

    @patch("imaplib.IMAP4_SSL")
    def test_get_uid_validity(self, mock_imap, config):
        """Test getting UID validity"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.status.return_value = ("OK", [b"UIDVALIDITY 1234567890"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        validity = conn.get_uid_validity("INBOX")

        assert validity == 1234567890

    @patch("imaplib.IMAP4_SSL")
    def test_thread_safety(self, mock_imap, config):
        """Test thread-safe connection operations"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        results = []

        def select_folder(folder_name):
            success, count = conn.select_folder(folder_name)
            results.append((folder_name, success, count))

        threads = [
            threading.Thread(target=select_folder, args=("INBOX",)),
            threading.Thread(target=select_folder, args=("Sent",)),
            threading.Thread(target=select_folder, args=("Drafts",)),
        ]

        for t in threads:
            t.start()

        for t in threads:
            t.join()

        assert len(results) == 3


class TestIMAPConnectionPool:
    """Test connection pooling"""

    @pytest.fixture
    def config(self):
        """Create test config"""
        return IMAPConnectionConfig(
            hostname="imap.gmail.com",
            port=993,
            username="user@gmail.com",
            password="password",
        )

    def test_pool_creation(self):
        """Test creating connection pool"""
        pool = IMAPConnectionPool(max_connections_per_account=3)

        assert pool.max_connections_per_account == 3
        assert len(pool.pools) == 0

    @patch("imaplib.IMAP4_SSL")
    def test_get_connection(self, mock_imap, config):
        """Test getting connection from pool"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        pool = IMAPConnectionPool()
        conn = pool.get_connection(config)

        assert conn is not None
        assert conn.state == IMAPConnectionState.AUTHENTICATED

    @patch("imaplib.IMAP4_SSL")
    def test_pool_reuses_connection(self, mock_imap, config):
        """Test connection reuse from pool"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        pool = IMAPConnectionPool()
        conn1 = pool.get_connection(config)
        pool.release_connection(conn1)

        # Mark connection as recently active
        conn1.last_activity = time.time()

        conn2 = pool.get_connection(config)

        assert conn1 is conn2

    @patch("imaplib.IMAP4_SSL")
    def test_pool_max_connections(self, mock_imap, config):
        """Test pool respects max connections limit"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        pool = IMAPConnectionPool(max_connections_per_account=2)
        account_id = f"{config.hostname}:{config.username}"

        conn1 = pool.get_connection(config)
        pool.release_connection(conn1)

        conn2 = pool.get_connection(config)
        pool.release_connection(conn2)

        # Reset last activity to prevent reuse
        conn1.last_activity = time.time() - 600
        conn2.last_activity = time.time() - 600

        conn3 = pool.get_connection(config)

        # Third connection should be reused from pool
        assert len(pool.pools[account_id]) <= pool.max_connections_per_account

    def test_pool_clear(self):
        """Test clearing pool"""
        pool = IMAPConnectionPool()
        account_id = "imap.gmail.com:user@gmail.com"

        # Create mock connection
        mock_conn = MagicMock(spec=IMAPConnection)
        mock_conn.disconnect = MagicMock()

        pool.pools[account_id] = [mock_conn]

        pool.clear_pool(account_id)

        assert account_id not in pool.pools
        mock_conn.disconnect.assert_called_once()

    def test_pool_clear_all(self):
        """Test clearing entire pool"""
        pool = IMAPConnectionPool()

        # Create mock connections
        mock_conn1 = MagicMock(spec=IMAPConnection)
        mock_conn1.disconnect = MagicMock()
        mock_conn2 = MagicMock(spec=IMAPConnection)
        mock_conn2.disconnect = MagicMock()

        pool.pools["account1"] = [mock_conn1]
        pool.pools["account2"] = [mock_conn2]

        pool.clear_pool()

        assert len(pool.pools) == 0
        mock_conn1.disconnect.assert_called_once()
        mock_conn2.disconnect.assert_called_once()

    @patch("imaplib.IMAP4_SSL")
    def test_pooled_connection_context_manager(self, mock_imap, config):
        """Test pooled connection context manager"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        pool = IMAPConnectionPool()

        with pool.pooled_connection(config) as conn:
            assert conn is not None
            assert conn.state == IMAPConnectionState.AUTHENTICATED


class TestIMAPProtocolHandler:
    """Test high-level IMAP protocol handler"""

    @pytest.fixture
    def handler(self):
        """Create protocol handler"""
        return IMAPProtocolHandler()

    @pytest.fixture
    def config(self):
        """Create test config"""
        return IMAPConnectionConfig(
            hostname="imap.gmail.com",
            port=993,
            username="user@gmail.com",
            password="password",
        )

    @patch("imaplib.IMAP4_SSL")
    def test_connect(self, mock_imap, handler, config):
        """Test connecting"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        result = handler.connect(
            config.hostname,
            config.port,
            config.username,
            config.password,
        )

        assert result is True

    @patch("imaplib.IMAP4_SSL")
    def test_authenticate(self, mock_imap, handler, config):
        """Test authentication"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        result = handler.authenticate(config)

        assert result is True

    @patch("imaplib.IMAP4_SSL")
    def test_list_folders(self, mock_imap, handler, config):
        """Test listing folders"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.list.return_value = (
            "OK",
            [b'(\\HasNoChildren) "/" "INBOX"'],
        )
        mock_imap.return_value = mock_instance

        folders = handler.list_folders(config)

        assert len(folders) > 0
        assert all(isinstance(f, IMAPFolder) for f in folders)

    @patch("imaplib.IMAP4_SSL")
    def test_search(self, mock_imap, handler, config):
        """Test searching"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.uid.return_value = ("OK", [b"1 2 3"])
        mock_imap.return_value = mock_instance

        uids = handler.search(config, "INBOX", "UNSEEN")

        assert uids == [1, 2, 3]

    @patch("imaplib.IMAP4_SSL")
    def test_mark_as_read(self, mock_imap, handler, config):
        """Test marking as read"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.uid.return_value = ("OK", [b""])
        mock_imap.return_value = mock_instance

        result = handler.mark_as_read(config, 1)

        assert result is True

    @patch("imaplib.IMAP4_SSL")
    def test_add_star(self, mock_imap, handler, config):
        """Test adding star"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.uid.return_value = ("OK", [b""])
        mock_imap.return_value = mock_instance

        result = handler.add_star(config, 1)

        assert result is True

    @patch("imaplib.IMAP4_SSL")
    def test_disconnect(self, mock_imap, handler, config):
        """Test disconnect"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_imap.return_value = mock_instance

        handler.connect(
            config.hostname,
            config.port,
            config.username,
            config.password,
        )

        handler.disconnect()

        # Pool should be cleared
        assert len(handler.pool.pools) == 0


class TestIMAPDataStructures:
    """Test data structure classes"""

    def test_imap_folder_creation(self):
        """Test creating IMAPFolder"""
        folder = IMAPFolder(
            name="INBOX",
            display_name="Inbox",
            folder_type="inbox",
            flags=["\\HasNoChildren"],
            is_selectable=True,
            delimiter="/",
        )

        assert folder.name == "INBOX"
        assert folder.display_name == "Inbox"
        assert folder.folder_type == "inbox"
        assert folder.is_selectable is True
        assert folder.delimiter == "/"

    def test_imap_message_creation(self):
        """Test creating IMAPMessage"""
        message = IMAPMessage(
            uid=1,
            folder="INBOX",
            message_id="<abc@example.com>",
            from_addr="sender@example.com",
            to_addrs=["recipient@example.com"],
            cc_addrs=[],
            bcc_addrs=[],
            subject="Test Subject",
            text_body="Test body",
            html_body="<p>Test body</p>",
            received_at=1706033200000,
            is_read=False,
            is_starred=False,
            is_deleted=False,
            is_spam=False,
            is_draft=False,
            is_sent=False,
            attachment_count=0,
            size=1024,
        )

        assert message.uid == 1
        assert message.subject == "Test Subject"
        assert message.from_addr == "sender@example.com"
        assert message.attachment_count == 0


class TestIMAPErrorHandling:
    """Test error handling"""

    @pytest.fixture
    def config(self):
        """Create test config"""
        return IMAPConnectionConfig(
            hostname="imap.gmail.com",
            port=993,
            username="user@gmail.com",
            password="password",
        )

    @patch("imaplib.IMAP4_SSL")
    def test_connection_error_handling(self, mock_imap, config):
        """Test handling connection errors"""
        mock_imap.side_effect = Exception("Connection refused")

        conn = IMAPConnection(config)
        result = conn.connect()

        assert result is False
        assert conn.state == IMAPConnectionState.ERROR

    @patch("imaplib.IMAP4_SSL")
    def test_folder_list_error_handling(self, mock_imap, config):
        """Test handling folder listing errors"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.list.side_effect = Exception("Folder list failed")
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        folders = conn.list_folders()

        assert folders == []

    @patch("imaplib.IMAP4_SSL")
    def test_search_error_handling(self, mock_imap, config):
        """Test handling search errors"""
        mock_instance = MagicMock()
        mock_instance.login.return_value = ("OK", [b"Logged in"])
        mock_instance.select.return_value = ("OK", [b"100"])
        mock_instance.uid.side_effect = Exception("Search failed")
        mock_imap.return_value = mock_instance

        conn = IMAPConnection(config)
        conn.connect()

        uids = conn.search("INBOX")

        assert uids == []


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
