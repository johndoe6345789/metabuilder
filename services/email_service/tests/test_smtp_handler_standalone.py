"""
Standalone tests for SMTP Protocol Handler (Phase 7)
Minimal imports to avoid dependency issues
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
import smtplib
import socket
import base64
from unittest.mock import Mock, MagicMock, patch, PropertyMock
from datetime import datetime, timedelta

from src.handlers.smtp import (
    SMTPProtocolHandler,
    SMTPMessageValidator,
    SMTPConnectionPool,
    SMTPPoolConnection,
    DeliveryResult,
    SMTPDeliveryStatus,
    SMTPEncryption
)


class TestSMTPMessageValidator:
    """Tests for SMTP message validation"""

    def test_validate_email_address_valid(self):
        """Test valid email addresses"""
        valid_emails = [
            'user@example.com',
            'test.user@example.co.uk',
            'user+tag@sub.example.com',
            'test_user@example.com',
            'test-user@example-domain.com'
        ]

        for email in valid_emails:
            is_valid, error = SMTPMessageValidator.validate_email_address(email)
            assert is_valid, f"Should accept valid email: {email}"
            assert error is None

    def test_validate_email_address_invalid(self):
        """Test invalid email addresses"""
        invalid_emails = [
            '',  # Empty
            'no-at-sign',  # Missing @
            '@example.com',  # Missing local part
            'user@',  # Missing domain
            'user@@example.com',  # Double @
            'user@example',  # Missing TLD
            'user name@example.com',  # Space in local part
            'user@exam ple.com',  # Space in domain
        ]

        for email in invalid_emails:
            is_valid, error = SMTPMessageValidator.validate_email_address(email)
            assert not is_valid, f"Should reject invalid email: {email} (got: {error})"
            assert error is not None

    def test_validate_email_address_too_long(self):
        """Test email address length limits"""
        # 255 characters (exceeds 254 limit)
        long_email = 'a' * 250 + '@example.com'
        is_valid, error = SMTPMessageValidator.validate_email_address(long_email)
        assert not is_valid
        assert 'exceeds' in error.lower()

    def test_validate_recipients_empty(self):
        """Test recipients validation with empty list"""
        is_valid, error = SMTPMessageValidator.validate_recipients([])
        assert not is_valid
        assert 'No recipients' in error

    def test_validate_recipients_too_many(self):
        """Test recipients validation with too many recipients"""
        recipients = [f'user{i}@example.com' for i in range(150)]
        is_valid, error = SMTPMessageValidator.validate_recipients(recipients)
        assert not is_valid
        assert 'Too many recipients' in error

    def test_validate_recipients_mixed(self):
        """Test recipients validation with to/cc/bcc"""
        to = ['user1@example.com']
        cc = ['user2@example.com']
        bcc = ['user3@example.com']
        is_valid, error = SMTPMessageValidator.validate_recipients(to, cc, bcc)
        assert is_valid
        assert error is None

    def test_validate_recipients_with_invalid(self):
        """Test recipients validation with invalid email"""
        to = ['user1@example.com', 'invalid-email']
        is_valid, error = SMTPMessageValidator.validate_recipients(to)
        assert not is_valid
        assert 'Invalid recipient' in error

    def test_validate_subject_empty(self):
        """Test subject validation"""
        is_valid, error = SMTPMessageValidator.validate_subject('')
        assert not is_valid
        assert 'empty' in error.lower()

    def test_validate_subject_too_long(self):
        """Test subject length limit"""
        long_subject = 'a' * 1000
        is_valid, error = SMTPMessageValidator.validate_subject(long_subject)
        assert not is_valid
        assert 'exceeds' in error.lower()

    def test_validate_body_empty(self):
        """Test body validation with empty body"""
        is_valid, error = SMTPMessageValidator.validate_body(None, None)
        assert not is_valid
        assert 'empty' in error.lower()

    def test_validate_body_valid(self):
        """Test body validation with valid content"""
        is_valid, error = SMTPMessageValidator.validate_body('Text body', None)
        assert is_valid
        assert error is None

        is_valid, error = SMTPMessageValidator.validate_body(None, '<html>HTML body</html>')
        assert is_valid
        assert error is None

    def test_validate_attachments_empty(self):
        """Test attachment validation with empty list"""
        is_valid, error = SMTPMessageValidator.validate_attachments(None)
        assert is_valid
        assert error is None

        is_valid, error = SMTPMessageValidator.validate_attachments([])
        assert is_valid
        assert error is None

    def test_validate_attachments_no_filename(self):
        """Test attachment validation with missing filename"""
        attachments = [{'data': 'base64data', 'contentType': 'text/plain'}]
        is_valid, error = SMTPMessageValidator.validate_attachments(attachments)
        assert not is_valid
        assert 'filename' in error.lower()

    def test_validate_attachments_no_data(self):
        """Test attachment validation with missing data"""
        attachments = [{'filename': 'test.txt', 'contentType': 'text/plain'}]
        is_valid, error = SMTPMessageValidator.validate_attachments(attachments)
        assert not is_valid
        assert 'data' in error.lower()

    def test_validate_message_complete(self):
        """Test complete message validation"""
        is_valid, error = SMTPMessageValidator.validate_message(
            from_address='sender@example.com',
            to_addresses=['recipient@example.com'],
            subject='Test Subject',
            text_body='Test body',
            cc_addresses=['cc@example.com']
        )
        assert is_valid
        assert error is None

    def test_validate_message_invalid_sender(self):
        """Test message validation with invalid sender"""
        is_valid, error = SMTPMessageValidator.validate_message(
            from_address='invalid-email',
            to_addresses=['recipient@example.com'],
            subject='Test Subject',
            text_body='Test body'
        )
        assert not is_valid
        assert 'Invalid sender' in error


class TestSMTPPoolConnection:
    """Tests for SMTP pool connection wrapper"""

    def test_pool_connection_is_idle(self):
        """Test idle connection detection"""
        conn = SMTPPoolConnection()
        conn.last_used = datetime.utcnow() - timedelta(seconds=400)
        assert conn.is_idle(max_age_seconds=300)

    def test_pool_connection_is_not_idle(self):
        """Test active connection detection"""
        conn = SMTPPoolConnection()
        conn.last_used = datetime.utcnow() - timedelta(seconds=100)
        assert not conn.is_idle(max_age_seconds=300)

    def test_pool_connection_is_stale(self):
        """Test stale connection detection"""
        conn = SMTPPoolConnection()
        conn.created_at = datetime.utcnow() - timedelta(seconds=4000)
        assert conn.is_stale(max_age_seconds=3600)

    def test_pool_connection_is_not_stale(self):
        """Test fresh connection detection"""
        conn = SMTPPoolConnection()
        conn.created_at = datetime.utcnow() - timedelta(seconds=1000)
        assert not conn.is_stale(max_age_seconds=3600)


class TestSMTPConnectionPool:
    """Tests for SMTP connection pool"""

    def test_pool_initialization(self):
        """Test pool initialization"""
        pool = SMTPConnectionPool(max_connections=5, idle_timeout=300)
        assert pool.max_connections == 5
        assert pool.idle_timeout == 300
        assert len(pool.pools) == 0

    @patch('smtplib.SMTP')
    def test_pool_create_connection(self, mock_smtp):
        """Test connection creation"""
        mock_conn = MagicMock()
        mock_smtp.return_value = mock_conn

        pool = SMTPConnectionPool()
        conn = pool._create_connection('smtp.example.com', 587, 'user', 'pass', SMTPEncryption.STARTTLS)

        assert conn is not None
        mock_smtp.assert_called_once()

    @patch('smtplib.SMTP')
    def test_pool_get_connection_new(self, mock_smtp):
        """Test getting new connection from pool"""
        mock_conn = MagicMock()
        mock_smtp.return_value = mock_conn

        pool = SMTPConnectionPool()
        conn = pool.get_connection('smtp.example.com', 587, 'user', 'pass', SMTPEncryption.STARTTLS)

        assert conn is not None
        assert pool.pool_stats['smtp.example.com:587']['created'] == 1

    @patch('smtplib.SMTP')
    def test_pool_release_connection(self, mock_smtp):
        """Test releasing connection back to pool"""
        mock_conn = MagicMock()
        mock_smtp.return_value = mock_conn

        pool = SMTPConnectionPool(max_connections=5)
        conn = pool.get_connection('smtp.example.com', 587, 'user', 'pass', SMTPEncryption.STARTTLS)
        pool.release_connection('smtp.example.com', 587, conn)

        assert len(pool.pools['smtp.example.com:587']) == 1

    @patch('smtplib.SMTP')
    def test_pool_reuse_connection(self, mock_smtp):
        """Test connection reuse from pool"""
        mock_conn = MagicMock()
        mock_conn.noop.return_value = None
        mock_smtp.return_value = mock_conn

        pool = SMTPConnectionPool()

        # Get and release connection
        conn1 = pool.get_connection('smtp.example.com', 587, 'user', 'pass', SMTPEncryption.STARTTLS)
        pool.release_connection('smtp.example.com', 587, conn1)

        # Get again (should reuse)
        conn2 = pool.get_connection('smtp.example.com', 587, 'user', 'pass', SMTPEncryption.STARTTLS)

        assert pool.pool_stats['smtp.example.com:587']['reused'] == 1


class TestSMTPProtocolHandler:
    """Tests for SMTP protocol handler"""

    @pytest.fixture
    def handler(self):
        """Create SMTP handler instance"""
        return SMTPProtocolHandler(
            hostname='smtp.example.com',
            port=587,
            username='user@example.com',
            password='password',
            encryption='tls',
            from_address='sender@example.com'
        )

    def test_handler_initialization(self, handler):
        """Test handler initialization"""
        assert handler.hostname == 'smtp.example.com'
        assert handler.port == 587
        assert handler.username == 'user@example.com'
        assert handler.encryption == SMTPEncryption.STARTTLS
        assert handler.from_address == 'sender@example.com'

    def test_handler_encryption_modes(self):
        """Test different encryption modes"""
        handler_tls = SMTPProtocolHandler('smtp.example.com', 587, 'user', 'pass', 'tls')
        assert handler_tls.encryption == SMTPEncryption.STARTTLS

        handler_ssl = SMTPProtocolHandler('smtp.example.com', 465, 'user', 'pass', 'ssl')
        assert handler_ssl.encryption == SMTPEncryption.IMPLICIT_SSL

        handler_none = SMTPProtocolHandler('smtp.example.com', 25, 'user', 'pass', 'none')
        assert handler_none.encryption == SMTPEncryption.NONE

    @patch('src.handlers.smtp.SMTPConnectionPool.get_connection')
    def test_handler_connect_success(self, mock_get_conn, handler):
        """Test successful connection"""
        mock_conn = MagicMock()
        mock_get_conn.return_value = mock_conn

        result = handler.connect()
        assert result is True

    @patch('src.handlers.smtp.SMTPConnectionPool.get_connection')
    def test_handler_connect_failure(self, mock_get_conn, handler):
        """Test connection failure"""
        mock_get_conn.return_value = None

        result = handler.connect()
        assert result is False

    @patch('src.handlers.smtp.SMTPConnectionPool.get_connection')
    def test_send_message_invalid_message(self, mock_get_conn, handler):
        """Test sending invalid message"""
        result = handler.send_message(
            to_addresses=[],  # Invalid: empty recipients
            subject='Test',
            text_body='Body'
        )

        assert result.status == SMTPDeliveryStatus.INVALID
        assert result.is_retryable is False

    @patch('src.handlers.smtp.SMTPConnectionPool.get_connection')
    def test_send_message_success(self, mock_get_conn, handler):
        """Test successful message send"""
        mock_conn = MagicMock()
        mock_conn.send_message.return_value = None
        mock_get_conn.return_value = mock_conn

        result = handler.send_message(
            to_addresses=['recipient@example.com'],
            subject='Test Subject',
            text_body='Test body'
        )

        assert result.status == SMTPDeliveryStatus.SUCCESS
        assert result.message_id is not None
        assert result.sent_at is not None
        mock_conn.send_message.assert_called_once()

    @patch('src.handlers.smtp.SMTPConnectionPool.get_connection')
    def test_send_message_with_html(self, mock_get_conn, handler):
        """Test sending message with HTML body"""
        mock_conn = MagicMock()
        mock_conn.send_message.return_value = None
        mock_get_conn.return_value = mock_conn

        result = handler.send_message(
            to_addresses=['recipient@example.com'],
            subject='Test Subject',
            text_body='Text body',
            html_body='<html>HTML body</html>'
        )

        assert result.status == SMTPDeliveryStatus.SUCCESS
        mock_conn.send_message.assert_called_once()

    def test_delivery_result_to_dict(self):
        """Test DeliveryResult serialization"""
        result = DeliveryResult(
            status=SMTPDeliveryStatus.SUCCESS,
            message_id='<uuid@example.com>',
            sent_at=datetime(2026, 1, 24, 12, 0, 0),
            retry_count=1
        )

        result_dict = result.to_dict()
        assert result_dict['status'] == 'success'
        assert result_dict['messageId'] == '<uuid@example.com>'
        assert result_dict['sentAt'] is not None
        assert result_dict['retryCount'] == 1

    def test_smtp_delivery_status_enum(self):
        """Test SMTPDeliveryStatus enum values"""
        assert SMTPDeliveryStatus.SUCCESS.value == 'success'
        assert SMTPDeliveryStatus.FAILED.value == 'failed'
        assert SMTPDeliveryStatus.RETRY.value == 'retry'
        assert SMTPDeliveryStatus.INVALID.value == 'invalid'
        assert SMTPDeliveryStatus.REJECTED.value == 'rejected'
        assert SMTPDeliveryStatus.TEMP_FAILED.value == 'temp_failed'

    def test_smtp_encryption_enum(self):
        """Test SMTPEncryption enum values"""
        assert SMTPEncryption.NONE.value == 'none'
        assert SMTPEncryption.STARTTLS.value == 'tls'
        assert SMTPEncryption.IMPLICIT_SSL.value == 'ssl'
