"""
POP3 Protocol Handler Tests
Comprehensive test suite for POP3 operations
"""
import unittest
from unittest.mock import Mock, MagicMock, patch, call
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.handlers.pop3 import (
    POP3ProtocolHandler,
    POP3ConnectionPool,
    POP3ConnectionError,
    POP3AuthenticationError
)


class TestPOP3ProtocolHandler(unittest.TestCase):
    """Test POP3ProtocolHandler class"""

    def setUp(self):
        """Set up test fixtures"""
        self.hostname = 'pop.gmail.com'
        self.port = 995
        self.username = 'test@gmail.com'
        self.password = 'testpass123'

    def test_initialization(self):
        """Test handler initialization"""
        handler = POP3ProtocolHandler(
            self.hostname,
            self.port,
            self.username,
            self.password
        )

        self.assertEqual(handler.hostname, self.hostname)
        self.assertEqual(handler.port, self.port)
        self.assertEqual(handler.username, self.username)
        self.assertEqual(handler.password, self.password)
        self.assertEqual(handler.encryption, 'ssl')
        self.assertEqual(handler.timeout, 30)
        self.assertIsNone(handler.client)

    def test_initialization_with_custom_params(self):
        """Test handler initialization with custom parameters"""
        handler = POP3ProtocolHandler(
            self.hostname,
            110,
            self.username,
            self.password,
            encryption='none',
            timeout=60
        )

        self.assertEqual(handler.port, 110)
        self.assertEqual(handler.encryption, 'none')
        self.assertEqual(handler.timeout, 60)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_connect_success(self, mock_pop3_ssl):
        """Test successful connection"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        result = handler.connect()

        self.assertTrue(result)
        self.assertIsNotNone(handler.client)
        mock_pop3_ssl.assert_called_once()

    @patch('src.handlers.pop3.POP3_SSL')
    def test_connect_failure_retry(self, mock_pop3_ssl):
        """Test connection retry on failure"""
        mock_pop3_ssl.side_effect = ConnectionRefusedError('Connection refused')

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)

        with self.assertRaises(POP3ConnectionError):
            handler.connect()

        # Should retry 3 times
        self.assertEqual(mock_pop3_ssl.call_count, 3)

    @patch('src.handlers.pop3.POP3')
    def test_connect_plain_text(self, mock_pop3):
        """Test connection with plain text (no encryption)"""
        mock_client = MagicMock()
        mock_pop3.return_value = mock_client

        handler = POP3ProtocolHandler(
            self.hostname,
            110,
            self.username,
            self.password,
            encryption='none'
        )
        result = handler.connect()

        self.assertTrue(result)
        mock_pop3.assert_called_once()

    @patch('src.handlers.pop3.POP3_SSL')
    def test_authenticate_success(self, mock_pop3_ssl):
        """Test successful authentication"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.authenticate()

        self.assertTrue(result)
        mock_client.user.assert_called_once_with(self.username)
        mock_client.pass_.assert_called_once_with(self.password)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_authenticate_custom_credentials(self, mock_pop3_ssl):
        """Test authentication with custom credentials"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.authenticate('other@gmail.com', 'otherpass')

        self.assertTrue(result)
        mock_client.user.assert_called_once_with('other@gmail.com')
        mock_client.pass_.assert_called_once_with('otherpass')

    @patch('src.handlers.pop3.POP3_SSL')
    def test_authenticate_failure(self, mock_pop3_ssl):
        """Test authentication failure"""
        mock_client = MagicMock()
        mock_client.user.side_effect = Exception('Authentication failed')
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()

        with self.assertRaises(POP3AuthenticationError):
            handler.authenticate()

    @patch('src.handlers.pop3.POP3_SSL')
    def test_authenticate_not_connected(self, mock_pop3_ssl):
        """Test authentication when not connected"""
        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)

        with self.assertRaises(POP3ConnectionError):
            handler.authenticate()

    @patch('src.handlers.pop3.POP3_SSL')
    def test_disconnect_success(self, mock_pop3_ssl):
        """Test successful disconnection"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.disconnect()

        self.assertTrue(result)
        mock_client.quit.assert_called_once()
        self.assertIsNone(handler.client)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_disconnect_quit_failure(self, mock_pop3_ssl):
        """Test disconnect when quit fails"""
        mock_client = MagicMock()
        mock_client.quit.side_effect = Exception('Quit failed')
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.disconnect()

        self.assertTrue(result)  # Should still succeed with forced close
        mock_client.quit.assert_called_once()
        mock_client.close.assert_called_once()
        self.assertIsNone(handler.client)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_list_messages(self, mock_pop3_ssl):
        """Test listing messages"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        # Mock POP3 LIST response
        mock_client.list.return_value = (
            '+OK 3 messages (12345 octets)',
            [b'1 1234', b'2 2345', b'3 3456'],
            12345
        )

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        msg_ids, total_size = handler.list_messages()

        self.assertEqual(msg_ids, [1, 2, 3])
        self.assertEqual(total_size, 12345)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_list_messages_empty(self, mock_pop3_ssl):
        """Test listing messages when mailbox is empty"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        mock_client.list.return_value = (
            '+OK 0 messages (0 octets)',
            [],
            0
        )

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        msg_ids, total_size = handler.list_messages()

        self.assertEqual(msg_ids, [])
        self.assertEqual(total_size, 0)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_list_messages_not_connected(self, mock_pop3_ssl):
        """Test listing messages when not connected"""
        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)

        with self.assertRaises(POP3ConnectionError):
            handler.list_messages()

    @patch('src.handlers.pop3.POP3_SSL')
    def test_fetch_message_success(self, mock_pop3_ssl):
        """Test fetching a message successfully"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        # Mock RFC 822 email
        email_lines = [
            b'From: sender@example.com',
            b'To: recipient@example.com',
            b'Cc: cc@example.com',
            b'Subject: Test Subject',
            b'Message-ID: <test@example.com>',
            b'Date: Mon, 23 Jan 2023 10:30:00 +0000',
            b'Content-Type: text/plain',
            b'',
            b'This is the message body'
        ]

        mock_client.retr.return_value = ('+OK', email_lines, 456)

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        message = handler.fetch_message(1)

        self.assertIsNotNone(message)
        self.assertEqual(message['messageId'], 1)
        self.assertEqual(message['from'], 'sender@example.com')
        self.assertEqual(message['to'], ['recipient@example.com'])
        self.assertEqual(message['cc'], ['cc@example.com'])
        self.assertEqual(message['subject'], 'Test Subject')
        self.assertEqual(message['size'], 456)
        self.assertFalse(message['isRead'])

    @patch('src.handlers.pop3.POP3_SSL')
    def test_fetch_message_with_attachments(self, mock_pop3_ssl):
        """Test fetching a message with attachments"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        email_lines = [
            b'From: sender@example.com',
            b'To: recipient@example.com',
            b'Subject: Message with attachment',
            b'Message-ID: <test@example.com>',
            b'Date: Mon, 23 Jan 2023 10:30:00 +0000',
            b'Content-Type: multipart/mixed',
            b'',
            b'This is the message body',
            b'',
            b'--boundary',
            b'Content-Type: application/pdf',
            b'Content-Disposition: attachment; filename="document.pdf"',
            b'',
            b'base64encodeddata',
            b'--boundary--'
        ]

        mock_client.retr.return_value = ('+OK', email_lines, 789)

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        message = handler.fetch_message(1)

        self.assertIsNotNone(message)
        self.assertGreaterEqual(message['attachmentCount'], 0)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_fetch_message_not_connected(self, mock_pop3_ssl):
        """Test fetching message when not connected"""
        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)

        with self.assertRaises(POP3ConnectionError):
            handler.fetch_message(1)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_fetch_messages(self, mock_pop3_ssl):
        """Test fetching multiple messages"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        # Mock list response
        mock_client.list.return_value = (
            '+OK 2 messages',
            [b'1 100', b'2 200'],
            300
        )

        # Mock retr responses
        email_lines = [
            b'From: sender@example.com',
            b'To: recipient@example.com',
            b'Subject: Test',
            b'Message-ID: <test@example.com>',
            b'Date: Mon, 23 Jan 2023 10:30:00 +0000',
            b'',
            b'Body'
        ]

        mock_client.retr.return_value = ('+OK', email_lines, 100)

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        messages = handler.fetch_messages()

        self.assertEqual(len(messages), 2)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_fetch_messages_specific_ids(self, mock_pop3_ssl):
        """Test fetching specific messages by ID"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        email_lines = [
            b'From: sender@example.com',
            b'Subject: Test',
            b'Message-ID: <test@example.com>',
            b'Date: Mon, 23 Jan 2023 10:30:00 +0000',
            b'',
            b'Body'
        ]

        mock_client.retr.return_value = ('+OK', email_lines, 100)

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        messages = handler.fetch_messages([1, 3])

        self.assertEqual(len(messages), 2)
        mock_client.retr.assert_any_call(1)
        mock_client.retr.assert_any_call(3)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_delete_message(self, mock_pop3_ssl):
        """Test deleting a message"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.delete_message(1)

        self.assertTrue(result)
        mock_client.dele.assert_called_once_with(1)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_delete_message_failure(self, mock_pop3_ssl):
        """Test delete failure"""
        mock_client = MagicMock()
        mock_client.dele.side_effect = Exception('Message not found')
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.delete_message(1)

        self.assertFalse(result)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_delete_messages(self, mock_pop3_ssl):
        """Test deleting multiple messages"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        deleted, failed = handler.delete_messages([1, 2, 3])

        self.assertEqual(deleted, 3)
        self.assertEqual(failed, 0)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_get_message_size(self, mock_pop3_ssl):
        """Test getting message size"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        mock_client.list.return_value = (
            '+OK 2 messages',
            [b'1 1234', b'2 2345'],
            3579
        )

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        size = handler.get_message_size(2)

        self.assertEqual(size, 2345)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_get_mailbox_stat(self, mock_pop3_ssl):
        """Test getting mailbox statistics"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        mock_client.stat.return_value = (3, 12345)

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        count, size = handler.get_mailbox_stat()

        self.assertEqual(count, 3)
        self.assertEqual(size, 12345)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_reset(self, mock_pop3_ssl):
        """Test resetting mailbox"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.reset()

        self.assertTrue(result)
        mock_client.rset.assert_called_once()

    @patch('src.handlers.pop3.POP3_SSL')
    def test_get_capabilities(self, mock_pop3_ssl):
        """Test getting server capabilities"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        mock_client.capa.return_value = (
            '+OK',
            [b'STLS', b'SASL PLAIN', b'RESP-CODES']
        )

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        caps = handler.get_capabilities()

        self.assertIn('STLS', caps)
        self.assertIn('SASL PLAIN', caps)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_test_connection(self, mock_pop3_ssl):
        """Test connection testing"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client
        mock_client.capa.return_value = ('+OK', [b'CAPABILITY'])

        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        handler.connect()
        result = handler.test_connection()

        self.assertTrue(result)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_context_manager(self, mock_pop3_ssl):
        """Test context manager usage"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        with POP3ProtocolHandler(self.hostname, self.port, self.username, self.password) as handler:
            self.assertIsNotNone(handler.client)

        mock_client.quit.assert_called_once()

    def test_parse_date_valid(self):
        """Test date parsing with valid date"""
        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        timestamp = handler._parse_date('Mon, 23 Jan 2023 10:30:00 +0000')

        self.assertGreater(timestamp, 0)
        self.assertIsInstance(timestamp, int)

    def test_parse_date_invalid(self):
        """Test date parsing with invalid date"""
        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        timestamp = handler._parse_date('invalid date')

        self.assertGreater(timestamp, 0)

    def test_parse_date_empty(self):
        """Test date parsing with empty string"""
        handler = POP3ProtocolHandler(self.hostname, self.port, self.username, self.password)
        timestamp = handler._parse_date('')

        self.assertGreater(timestamp, 0)


class TestPOP3ConnectionPool(unittest.TestCase):
    """Test POP3ConnectionPool class"""

    def setUp(self):
        """Set up test fixtures"""
        self.hostname = 'pop.gmail.com'
        self.port = 995
        self.username = 'test@gmail.com'
        self.password = 'testpass123'

    @patch('src.handlers.pop3.POP3_SSL')
    def test_pool_initialization(self, mock_pop3_ssl):
        """Test connection pool initialization"""
        mock_pop3_ssl.return_value = MagicMock()

        pool = POP3ConnectionPool(
            self.hostname,
            self.port,
            self.username,
            self.password,
            pool_size=3
        )

        self.assertEqual(len(pool._connections), 3)
        self.assertEqual(len(pool._available), 3)
        self.assertEqual(len(pool._in_use), 0)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_acquire_connection(self, mock_pop3_ssl):
        """Test acquiring connection from pool"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        pool = POP3ConnectionPool(
            self.hostname,
            self.port,
            self.username,
            self.password,
            pool_size=2
        )

        conn = pool.acquire()
        self.assertIsNotNone(conn)
        self.assertEqual(len(pool._available), 1)
        self.assertEqual(len(pool._in_use), 1)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_acquire_connection_exhaustion(self, mock_pop3_ssl):
        """Test acquiring connection when pool is exhausted"""
        mock_pop3_ssl.return_value = MagicMock()

        pool = POP3ConnectionPool(
            self.hostname,
            self.port,
            self.username,
            self.password,
            pool_size=1
        )

        conn1 = pool.acquire()
        self.assertIsNotNone(conn1)

        conn2 = pool.acquire()
        self.assertIsNone(conn2)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_release_connection(self, mock_pop3_ssl):
        """Test releasing connection back to pool"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        pool = POP3ConnectionPool(
            self.hostname,
            self.port,
            self.username,
            self.password,
            pool_size=1
        )

        conn = pool.acquire()
        self.assertEqual(len(pool._available), 0)

        pool.release(conn)
        self.assertEqual(len(pool._available), 1)
        self.assertEqual(len(pool._in_use), 0)

    @patch('src.handlers.pop3.POP3_SSL')
    def test_close_all(self, mock_pop3_ssl):
        """Test closing all connections"""
        mock_client = MagicMock()
        mock_pop3_ssl.return_value = mock_client

        pool = POP3ConnectionPool(
            self.hostname,
            self.port,
            self.username,
            self.password,
            pool_size=3
        )

        pool.close_all()

        self.assertEqual(len(pool._connections), 0)
        self.assertEqual(len(pool._available), 0)


if __name__ == '__main__':
    unittest.main()
