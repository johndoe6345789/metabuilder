"""
POP3 Protocol Handler
Stateless POP3 email retrieval with connection handling and error recovery
"""
from typing import List, Dict, Any, Optional, Tuple
from poplib import POP3, POP3_SSL
from email.parser import BytesParser
from email.policy import default
from datetime import datetime
import logging
import socket

logger = logging.getLogger(__name__)


class POP3ConnectionError(Exception):
    """POP3 connection error"""
    pass


class POP3AuthenticationError(Exception):
    """POP3 authentication error"""
    pass


class POP3ProtocolHandler:
    """
    POP3 protocol handler for stateless email retrieval

    POP3 limitations:
    - No folder/label support (single mailbox)
    - No flags (read/unread status not preserved)
    - Stateless operation (connect/disconnect for each operation)
    - Limited message metadata
    """

    def __init__(
        self,
        hostname: str,
        port: int,
        username: str,
        password: str,
        encryption: str = 'ssl',
        timeout: int = 30
    ):
        """
        Initialize POP3 protocol handler

        Args:
            hostname: POP3 server hostname (e.g., pop.gmail.com)
            port: POP3 server port (995 for SSL, 110 for plain)
            username: POP3 username
            password: POP3 password
            encryption: 'ssl' (default), 'tls', or 'none'
            timeout: Connection timeout in seconds (default: 30)
        """
        self.hostname = hostname
        self.port = port
        self.username = username
        self.password = password
        self.encryption = encryption
        self.timeout = timeout
        self.client: Optional[POP3] = None
        self._connection_retries = 3
        self._retry_delay = 1  # seconds

    def connect(self) -> bool:
        """
        Connect to POP3 server

        Returns:
            True if connection successful, False otherwise

        Raises:
            POP3ConnectionError: If connection fails after retries
        """
        for attempt in range(self._connection_retries):
            try:
                if self.encryption == 'ssl':
                    self.client = POP3_SSL(
                        self.hostname,
                        self.port,
                        timeout=self.timeout
                    )
                else:
                    self.client = POP3(
                        self.hostname,
                        self.port,
                        timeout=self.timeout
                    )

                logger.info(f'Connected to POP3 server {self.hostname}:{self.port}')
                return True

            except (socket.timeout, socket.gaierror, ConnectionRefusedError) as e:
                logger.warning(
                    f'Connection attempt {attempt + 1}/{self._connection_retries} failed: {e}'
                )
                if attempt == self._connection_retries - 1:
                    raise POP3ConnectionError(
                        f'Failed to connect to {self.hostname}:{self.port} after '
                        f'{self._connection_retries} attempts: {e}'
                    )
                continue

            except Exception as e:
                logger.error(f'Unexpected error connecting to POP3 server: {e}')
                raise POP3ConnectionError(f'Connection failed: {e}')

        return False

    def authenticate(self, username: Optional[str] = None, password: Optional[str] = None) -> bool:
        """
        Authenticate with POP3 server

        Args:
            username: Override default username
            password: Override default password

        Returns:
            True if authentication successful, False otherwise

        Raises:
            POP3AuthenticationError: If authentication fails
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        user = username or self.username
        pwd = password or self.password

        try:
            self.client.user(user)
            self.client.pass_(pwd)
            logger.info(f'Authenticated to POP3 as {user}')
            return True

        except Exception as e:
            logger.error(f'POP3 authentication failed: {e}')
            raise POP3AuthenticationError(f'Authentication failed for {user}: {e}')

    def disconnect(self) -> bool:
        """
        Disconnect from POP3 server

        Returns:
            True if disconnection successful, False otherwise
        """
        if not self.client:
            return True

        try:
            self.client.quit()
            self.client = None
            logger.info('Disconnected from POP3 server')
            return True

        except Exception as e:
            logger.warning(f'Error during POP3 disconnect: {e}')
            # Force close if quit fails
            try:
                self.client.close()
            except Exception:
                pass
            self.client = None
            return False

    def list_messages(self) -> Tuple[List[int], int]:
        """
        List message IDs and get mailbox statistics

        Returns:
            Tuple of (message_ids, total_size_bytes)

        Raises:
            POP3ConnectionError: If not connected
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            response, message_list, octets = self.client.list()
            total_size = octets

            # Parse message IDs from response
            message_ids = []
            for line in message_list:
                parts = line.decode().split()
                if parts:
                    message_ids.append(int(parts[0]))

            logger.info(f'Listed {len(message_ids)} messages, total size: {total_size} bytes')
            return message_ids, total_size

        except Exception as e:
            logger.error(f'Failed to list POP3 messages: {e}')
            raise

    def fetch_message(self, message_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch a single message by ID

        Args:
            message_id: POP3 message ID (1-based index)

        Returns:
            Message dict or None if fetch failed

        Raises:
            POP3ConnectionError: If not connected
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            # Fetch raw message (RETR)
            response, message_lines, octets = self.client.retr(message_id)

            # Combine message lines into bytes
            message_bytes = b'\n'.join(message_lines)

            # Parse email
            parser = BytesParser(policy=default)
            email = parser.parsebytes(message_bytes)

            # Extract headers
            from_header = email.get('From', '')
            to_header = email.get('To', '')
            cc_header = email.get('Cc', '')
            subject = email.get('Subject', '')
            message_id_header = email.get('Message-ID', '')
            date_str = email.get('Date', '')

            # Parse body
            text_body = ''
            html_body = ''
            attachments = []

            if email.is_multipart():
                for part in email.iter_parts():
                    content_type = part.get_content_type()
                    content_disposition = part.get_content_disposition()

                    if content_type == 'text/plain' and content_disposition != 'attachment':
                        text_body = part.get_content()
                    elif content_type == 'text/html' and content_disposition != 'attachment':
                        html_body = part.get_content()
                    elif content_disposition == 'attachment':
                        filename = part.get_filename()
                        if filename:
                            attachments.append({
                                'filename': filename,
                                'contentType': content_type,
                                'size': len(part.get_payload(decode=True))
                            })
            else:
                content_type = email.get_content_type()
                if content_type == 'text/html':
                    html_body = email.get_content()
                else:
                    text_body = email.get_content()

            # Parse recipients
            to_addresses = [addr.strip() for addr in to_header.split(',') if addr.strip()]
            cc_addresses = [addr.strip() for addr in cc_header.split(',') if addr.strip()] if cc_header else []

            return {
                'messageId': message_id,
                'popId': message_id,
                'messageIdHeader': message_id_header,
                'from': from_header,
                'to': to_addresses,
                'cc': cc_addresses,
                'bcc': [],  # POP3 doesn't provide BCC info
                'subject': subject,
                'textBody': text_body,
                'htmlBody': html_body,
                'receivedAt': self._parse_date(date_str),
                'size': octets,
                'attachmentCount': len(attachments),
                'attachments': attachments,
                # POP3 limitations - these are not available
                'isRead': False,  # POP3 has no read/unread flags
                'isStarred': False,
                'isDeleted': False,
                'isSpam': False,
                'isDraft': False,
                'isSent': False
            }

        except Exception as e:
            logger.warning(f'Failed to fetch POP3 message {message_id}: {e}')
            return None

    def fetch_messages(self, message_ids: Optional[List[int]] = None) -> List[Dict[str, Any]]:
        """
        Fetch multiple messages

        Args:
            message_ids: List of message IDs to fetch (None = all)

        Returns:
            List of message dicts
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            if message_ids is None:
                # Fetch all messages
                available_ids, _ = self.list_messages()
                message_ids = available_ids

            messages = []
            for msg_id in message_ids:
                try:
                    message = self.fetch_message(msg_id)
                    if message:
                        messages.append(message)
                except Exception as e:
                    logger.warning(f'Failed to fetch message {msg_id}: {e}')
                    continue

            logger.info(f'Fetched {len(messages)} of {len(message_ids)} messages')
            return messages

        except Exception as e:
            logger.error(f'Failed to fetch multiple POP3 messages: {e}')
            return []

    def delete_message(self, message_id: int) -> bool:
        """
        Delete a message by ID (mark for deletion)

        Note: POP3 marks messages for deletion but they are not permanently
        deleted until the server connection is quit.

        Args:
            message_id: POP3 message ID

        Returns:
            True if successfully marked for deletion, False otherwise

        Raises:
            POP3ConnectionError: If not connected
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            self.client.dele(message_id)
            logger.info(f'Marked POP3 message {message_id} for deletion')
            return True

        except Exception as e:
            logger.error(f'Failed to delete POP3 message {message_id}: {e}')
            return False

    def delete_messages(self, message_ids: List[int]) -> Tuple[int, int]:
        """
        Delete multiple messages

        Args:
            message_ids: List of message IDs to delete

        Returns:
            Tuple of (deleted_count, failed_count)
        """
        deleted_count = 0
        failed_count = 0

        for msg_id in message_ids:
            try:
                if self.delete_message(msg_id):
                    deleted_count += 1
                else:
                    failed_count += 1
            except Exception as e:
                logger.warning(f'Error deleting message {msg_id}: {e}')
                failed_count += 1

        logger.info(f'Deleted {deleted_count} messages, {failed_count} failed')
        return deleted_count, failed_count

    def get_message_size(self, message_id: int) -> int:
        """
        Get size of a message in bytes

        Args:
            message_id: POP3 message ID

        Returns:
            Message size in bytes, -1 if error

        Raises:
            POP3ConnectionError: If not connected
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            response, message_list, octets = self.client.list()
            for line in message_list:
                parts = line.decode().split()
                if int(parts[0]) == message_id:
                    return int(parts[1])
            return -1

        except Exception as e:
            logger.error(f'Failed to get size of message {message_id}: {e}')
            return -1

    def get_mailbox_stat(self) -> Tuple[int, int]:
        """
        Get mailbox statistics

        Returns:
            Tuple of (message_count, total_size_bytes)

        Raises:
            POP3ConnectionError: If not connected
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            num_messages, total_size = self.client.stat()
            return num_messages, total_size

        except Exception as e:
            logger.error(f'Failed to get POP3 mailbox stats: {e}')
            raise

    def reset(self) -> bool:
        """
        Reset mailbox (undo all deletion marks)

        Returns:
            True if successful, False otherwise

        Raises:
            POP3ConnectionError: If not connected
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            self.client.rset()
            logger.info('Reset POP3 mailbox (undo deletions)')
            return True

        except Exception as e:
            logger.error(f'Failed to reset POP3 mailbox: {e}')
            return False

    def get_capabilities(self) -> List[str]:
        """
        Get server capabilities

        Returns:
            List of capability strings

        Raises:
            POP3ConnectionError: If not connected
        """
        if not self.client:
            raise POP3ConnectionError('Not connected to POP3 server')

        try:
            response, caps = self.client.capa()
            capabilities = [cap.decode() if isinstance(cap, bytes) else cap for cap in caps]
            logger.info(f'Server capabilities: {capabilities}')
            return capabilities

        except Exception as e:
            logger.warning(f'Failed to get server capabilities: {e}')
            return []

    def test_connection(self) -> bool:
        """
        Test POP3 connection by fetching server capabilities

        Returns:
            True if connection test successful, False otherwise
        """
        try:
            if not self.client:
                return False

            caps = self.get_capabilities()
            logger.info(f'POP3 connection test successful')
            return len(caps) > 0

        except Exception as e:
            logger.error(f'POP3 connection test failed: {e}')
            return False

    def _parse_date(self, date_str: str) -> int:
        """
        Parse email date string to milliseconds timestamp

        Args:
            date_str: Email Date header value

        Returns:
            Timestamp in milliseconds
        """
        try:
            if not date_str:
                return int(datetime.utcnow().timestamp() * 1000)

            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(date_str)
            return int(dt.timestamp() * 1000)

        except Exception:
            logger.warning(f'Failed to parse date: {date_str}')
            return int(datetime.utcnow().timestamp() * 1000)

    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
        return False


class POP3ConnectionPool:
    """
    Connection pool for POP3 handlers
    Manages multiple connections for concurrent operations
    """

    def __init__(self, hostname: str, port: int, username: str, password: str, pool_size: int = 3):
        """
        Initialize connection pool

        Args:
            hostname: POP3 server hostname
            port: POP3 server port
            username: POP3 username
            password: POP3 password
            pool_size: Number of connections to maintain (default: 3)
        """
        self.hostname = hostname
        self.port = port
        self.username = username
        self.password = password
        self.pool_size = pool_size
        self._connections: List[POP3ProtocolHandler] = []
        self._available: List[POP3ProtocolHandler] = []
        self._in_use: set = set()
        self._initialize_pool()

    def _initialize_pool(self):
        """Initialize connection pool"""
        try:
            for i in range(self.pool_size):
                handler = POP3ProtocolHandler(
                    self.hostname,
                    self.port,
                    self.username,
                    self.password
                )
                self._connections.append(handler)
                self._available.append(handler)
            logger.info(f'Initialized POP3 connection pool with {self.pool_size} connections')
        except Exception as e:
            logger.error(f'Failed to initialize connection pool: {e}')

    def acquire(self) -> Optional[POP3ProtocolHandler]:
        """
        Acquire a connection from the pool

        Returns:
            POP3ProtocolHandler or None if pool exhausted
        """
        if self._available:
            conn = self._available.pop()
            self._in_use.add(id(conn))
            try:
                if not conn.client:
                    conn.connect()
                    conn.authenticate()
            except Exception as e:
                logger.warning(f'Failed to prepare connection: {e}')
                self._in_use.remove(id(conn))
                return None
            return conn
        return None

    def release(self, handler: POP3ProtocolHandler):
        """
        Release a connection back to the pool

        Args:
            handler: POP3ProtocolHandler to release
        """
        if id(handler) in self._in_use:
            self._in_use.remove(id(handler))
            # Reset mailbox before returning to pool
            try:
                handler.reset()
            except Exception as e:
                logger.warning(f'Failed to reset connection: {e}')
            self._available.append(handler)

    def close_all(self):
        """Close all connections in pool"""
        for conn in self._connections:
            try:
                conn.disconnect()
            except Exception as e:
                logger.warning(f'Error closing connection: {e}')
        self._connections.clear()
        self._available.clear()
        self._in_use.clear()
        logger.info('Closed all POP3 connections in pool')
