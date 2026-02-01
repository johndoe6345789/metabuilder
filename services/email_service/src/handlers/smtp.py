"""
Phase 7: SMTP Protocol Handler
Comprehensive SMTP protocol handler with connection pooling, TLS/SSL support,
error handling, retry logic, and message validation.
"""
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import smtplib
import base64
import logging
import re
import socket
import time
from threading import Lock, RLock
from collections import defaultdict
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.audio import MIMEAudio
from email import encoders
from email.utils import formatdate, parseaddr
from email.parser import Parser

logger = logging.getLogger(__name__)


class SMTPEncryption(Enum):
    """SMTP encryption modes"""
    NONE = "none"
    STARTTLS = "tls"
    IMPLICIT_SSL = "ssl"


class SMTPDeliveryStatus(Enum):
    """Email delivery status codes"""
    SUCCESS = "success"
    FAILED = "failed"
    RETRY = "retry"
    INVALID = "invalid"
    REJECTED = "rejected"
    TEMP_FAILED = "temp_failed"


@dataclass
class DeliveryResult:
    """SMTP message delivery result"""
    status: SMTPDeliveryStatus
    message_id: Optional[str] = None
    smtp_code: Optional[int] = None
    smtp_error: Optional[str] = None
    recipient_failures: Dict[str, str] = field(default_factory=dict)
    sent_at: Optional[datetime] = None
    retry_count: int = 0
    is_retryable: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'status': self.status.value,
            'messageId': self.message_id,
            'smtpCode': self.smtp_code,
            'smtpError': self.smtp_error,
            'recipientFailures': self.recipient_failures,
            'sentAt': int(self.sent_at.timestamp() * 1000) if self.sent_at else None,
            'retryCount': self.retry_count,
            'isRetryable': self.is_retryable
        }


@dataclass
class SMTPPoolConnection:
    """Pooled SMTP connection with metadata"""
    client: Optional[smtplib.SMTP] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    last_used: datetime = field(default_factory=datetime.utcnow)
    use_count: int = 0
    is_valid: bool = True

    def is_idle(self, max_age_seconds: int = 300) -> bool:
        """Check if connection is idle"""
        idle_time = datetime.utcnow() - self.last_used
        return idle_time.total_seconds() > max_age_seconds

    def is_stale(self, max_age_seconds: int = 3600) -> bool:
        """Check if connection is too old"""
        age = datetime.utcnow() - self.created_at
        return age.total_seconds() > max_age_seconds


class SMTPMessageValidator:
    """Validates email messages before sending"""

    # RFC 5321 email regex (simplified for practical use)
    EMAIL_REGEX = re.compile(
        r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',
        re.IGNORECASE
    )

    # Limits
    MAX_EMAIL_ADDRESS_LENGTH = 254
    MAX_SUBJECT_LENGTH = 998
    MAX_BODY_LENGTH = 100 * 1024 * 1024  # 100MB
    MAX_RECIPIENTS = 100
    MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024  # 25MB per attachment
    MAX_TOTAL_ATTACHMENT_SIZE = 100 * 1024 * 1024  # 100MB total

    @classmethod
    def validate_email_address(cls, email: str) -> Tuple[bool, Optional[str]]:
        """
        Validate email address format

        Args:
            email: Email address to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        email = email.strip()

        if not email:
            return False, "Email address is empty"

        if len(email) > cls.MAX_EMAIL_ADDRESS_LENGTH:
            return False, f"Email address exceeds {cls.MAX_EMAIL_ADDRESS_LENGTH} characters"

        if not cls.EMAIL_REGEX.match(email):
            return False, "Invalid email address format"

        # Check for multiple @ signs
        if email.count('@') != 1:
            return False, "Email address must contain exactly one @ symbol"

        # Check domain
        local_part, domain = email.split('@')
        if not local_part or not domain:
            return False, "Local part or domain is empty"

        if len(local_part) > 64:
            return False, "Local part exceeds 64 characters"

        # Check domain has at least one dot (requires TLD)
        if '.' not in domain:
            return False, "Domain must include a top-level domain (e.g., example.com)"

        return True, None

    @classmethod
    def validate_recipients(cls, to_addresses: List[str], cc_addresses: Optional[List[str]] = None,
                           bcc_addresses: Optional[List[str]] = None) -> Tuple[bool, Optional[str]]:
        """
        Validate all recipient lists

        Args:
            to_addresses: List of To recipients
            cc_addresses: List of CC recipients
            bcc_addresses: List of BCC recipients

        Returns:
            Tuple of (is_valid, error_message)
        """
        all_recipients = to_addresses.copy() if to_addresses else []
        if cc_addresses:
            all_recipients.extend(cc_addresses)
        if bcc_addresses:
            all_recipients.extend(bcc_addresses)

        if not all_recipients:
            return False, "No recipients specified"

        if len(all_recipients) > cls.MAX_RECIPIENTS:
            return False, f"Too many recipients (max {cls.MAX_RECIPIENTS})"

        for email in all_recipients:
            is_valid, error = cls.validate_email_address(email)
            if not is_valid:
                return False, f"Invalid recipient: {email} - {error}"

        return True, None

    @classmethod
    def validate_subject(cls, subject: str) -> Tuple[bool, Optional[str]]:
        """
        Validate email subject

        Args:
            subject: Email subject

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not subject:
            return False, "Subject is empty"

        if len(subject) > cls.MAX_SUBJECT_LENGTH:
            return False, f"Subject exceeds {cls.MAX_SUBJECT_LENGTH} characters"

        return True, None

    @classmethod
    def validate_body(cls, text_body: Optional[str], html_body: Optional[str]) -> Tuple[bool, Optional[str]]:
        """
        Validate email body

        Args:
            text_body: Plain text body
            html_body: HTML body

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not text_body and not html_body:
            return False, "Email body is empty (no text or HTML content)"

        if text_body and len(text_body) > cls.MAX_BODY_LENGTH:
            return False, f"Text body exceeds {cls.MAX_BODY_LENGTH} bytes"

        if html_body and len(html_body) > cls.MAX_BODY_LENGTH:
            return False, f"HTML body exceeds {cls.MAX_BODY_LENGTH} bytes"

        return True, None

    @classmethod
    def validate_attachments(cls, attachments: Optional[List[Dict[str, Any]]]) -> Tuple[bool, Optional[str]]:
        """
        Validate attachments

        Args:
            attachments: List of attachment dictionaries

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not attachments:
            return True, None

        total_size = 0

        for idx, attachment in enumerate(attachments):
            if not attachment.get('filename'):
                return False, f"Attachment {idx} missing filename"

            if not attachment.get('data'):
                return False, f"Attachment {idx} '{attachment.get('filename')}' has no data"

            # Get data size (handle both base64 strings and bytes)
            data = attachment['data']
            if isinstance(data, str):
                try:
                    decoded_size = len(base64.b64decode(data))
                except Exception:
                    return False, f"Attachment {idx} has invalid base64 data"
            else:
                decoded_size = len(data)

            if decoded_size > cls.MAX_ATTACHMENT_SIZE:
                return False, f"Attachment '{attachment['filename']}' exceeds {cls.MAX_ATTACHMENT_SIZE} bytes"

            total_size += decoded_size

            if total_size > cls.MAX_TOTAL_ATTACHMENT_SIZE:
                return False, f"Total attachments exceed {cls.MAX_TOTAL_ATTACHMENT_SIZE} bytes"

        return True, None

    @classmethod
    def validate_message(
        cls,
        from_address: str,
        to_addresses: List[str],
        subject: str,
        text_body: Optional[str] = None,
        html_body: Optional[str] = None,
        cc_addresses: Optional[List[str]] = None,
        bcc_addresses: Optional[List[str]] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate complete email message

        Args:
            from_address: Sender address
            to_addresses: List of recipients
            subject: Email subject
            text_body: Plain text body
            html_body: HTML body
            cc_addresses: CC recipients
            bcc_addresses: BCC recipients
            reply_to: Reply-To address
            attachments: Attachments list

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Validate from address
        is_valid, error = cls.validate_email_address(from_address)
        if not is_valid:
            return False, f"Invalid sender: {from_address} - {error}"

        # Validate reply-to if provided
        if reply_to:
            is_valid, error = cls.validate_email_address(reply_to)
            if not is_valid:
                return False, f"Invalid Reply-To: {reply_to} - {error}"

        # Validate recipients
        is_valid, error = cls.validate_recipients(to_addresses, cc_addresses, bcc_addresses)
        if not is_valid:
            return False, error

        # Validate subject
        is_valid, error = cls.validate_subject(subject)
        if not is_valid:
            return False, error

        # Validate body
        is_valid, error = cls.validate_body(text_body, html_body)
        if not is_valid:
            return False, error

        # Validate attachments
        is_valid, error = cls.validate_attachments(attachments)
        if not is_valid:
            return False, error

        return True, None


class SMTPConnectionPool:
    """Connection pool for SMTP connections with automatic cleanup"""

    def __init__(self, max_connections: int = 10, idle_timeout: int = 300, stale_timeout: int = 3600):
        """
        Initialize SMTP connection pool

        Args:
            max_connections: Maximum connections per account
            idle_timeout: Idle connection timeout in seconds
            stale_timeout: Maximum connection age in seconds
        """
        self.max_connections = max_connections
        self.idle_timeout = idle_timeout
        self.stale_timeout = stale_timeout
        self.pools: Dict[str, List[SMTPPoolConnection]] = defaultdict(list)
        self.lock = RLock()
        self.pool_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: {
            'created': 0,
            'reused': 0,
            'closed': 0
        })

    def get_connection(self, hostname: str, port: int, username: str, password: str,
                      encryption: SMTPEncryption) -> Optional[smtplib.SMTP]:
        """
        Get a connection from pool or create new one

        Args:
            hostname: SMTP server hostname
            port: SMTP server port
            username: SMTP username
            password: SMTP password
            encryption: Encryption mode

        Returns:
            SMTP connection or None if failed
        """
        pool_key = f"{hostname}:{port}"

        with self.lock:
            # Clean up stale/idle connections
            self._cleanup_pool(pool_key)

            # Try to reuse existing connection
            if pool_key in self.pools and self.pools[pool_key]:
                conn_wrapper = self.pools[pool_key].pop(0)
                if conn_wrapper.client and conn_wrapper.is_valid:
                    try:
                        # Test connection is still valid
                        conn_wrapper.client.noop()
                        conn_wrapper.last_used = datetime.utcnow()
                        conn_wrapper.use_count += 1
                        self.pool_stats[pool_key]['reused'] += 1
                        logger.info(f"Reused SMTP connection for {pool_key} (use #{conn_wrapper.use_count})")
                        return conn_wrapper.client
                    except Exception as e:
                        logger.warning(f"Pooled connection invalid: {e}")
                        self._close_connection(conn_wrapper)

        # Create new connection if under limit
        if len(self.pools.get(pool_key, [])) < self.max_connections:
            try:
                smtp = self._create_connection(hostname, port, username, password, encryption)
                if smtp:
                    conn_wrapper = SMTPPoolConnection(client=smtp)
                    self.pool_stats[pool_key]['created'] += 1
                    logger.info(f"Created new SMTP connection for {pool_key}")
                    return smtp
            except Exception as e:
                logger.error(f"Failed to create SMTP connection: {e}")

        return None

    def release_connection(self, hostname: str, port: int, conn: Optional[smtplib.SMTP]):
        """
        Return connection to pool

        Args:
            hostname: SMTP server hostname
            port: SMTP server port
            conn: SMTP connection to return
        """
        if not conn:
            return

        pool_key = f"{hostname}:{port}"

        with self.lock:
            if len(self.pools.get(pool_key, [])) < self.max_connections:
                conn_wrapper = SMTPPoolConnection(client=conn, use_count=1)
                self.pools[pool_key].append(conn_wrapper)
                logger.debug(f"Returned SMTP connection to pool for {pool_key}")
            else:
                self._close_connection(SMTPPoolConnection(client=conn))

    def close_all(self):
        """Close all connections in all pools"""
        with self.lock:
            for pool_key, connections in self.pools.items():
                for conn_wrapper in connections:
                    self._close_connection(conn_wrapper)
                logger.info(f"Closed {len(connections)} connections for {pool_key}")
            self.pools.clear()

    def get_stats(self) -> Dict[str, Any]:
        """Get pool statistics"""
        with self.lock:
            return {
                'pools': dict(self.pool_stats),
                'active_connections': {
                    pool_key: len(conns) for pool_key, conns in self.pools.items()
                }
            }

    def _create_connection(self, hostname: str, port: int, username: str, password: str,
                          encryption: SMTPEncryption) -> Optional[smtplib.SMTP]:
        """Create new SMTP connection"""
        try:
            if encryption == SMTPEncryption.IMPLICIT_SSL:
                conn = smtplib.SMTP_SSL(hostname, port, timeout=30)
            else:
                conn = smtplib.SMTP(hostname, port, timeout=30)

            if encryption == SMTPEncryption.STARTTLS:
                conn.starttls()

            conn.login(username, password)
            return conn
        except Exception as e:
            logger.error(f"SMTP connection failed: {e}")
            return None

    def _cleanup_pool(self, pool_key: str):
        """Remove stale and idle connections"""
        if pool_key not in self.pools:
            return

        valid_connections = []
        for conn_wrapper in self.pools[pool_key]:
            if conn_wrapper.is_stale(self.stale_timeout):
                self._close_connection(conn_wrapper)
                self.pool_stats[pool_key]['closed'] += 1
            elif conn_wrapper.is_idle(self.idle_timeout):
                self._close_connection(conn_wrapper)
            else:
                valid_connections.append(conn_wrapper)

        self.pools[pool_key] = valid_connections

    def _close_connection(self, conn_wrapper: SMTPPoolConnection):
        """Close a single connection"""
        if conn_wrapper.client:
            try:
                conn_wrapper.client.quit()
            except Exception:
                try:
                    conn_wrapper.client.close()
                except Exception:
                    pass


class SMTPProtocolHandler:
    """
    Comprehensive SMTP protocol handler with connection pooling,
    TLS/SSL support, error handling, and retry logic
    """

    # Retry configuration
    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 5, 30]  # seconds between retries
    RETRYABLE_CODES = {421, 450, 451, 452}  # Temporary failures

    def __init__(
        self,
        hostname: str,
        port: int,
        username: str,
        password: str,
        encryption: str = 'tls',
        from_address: Optional[str] = None,
        pool_size: int = 10
    ):
        """
        Initialize SMTP protocol handler

        Args:
            hostname: SMTP server hostname
            port: SMTP server port
            username: SMTP username
            password: SMTP password
            encryption: Encryption mode ('tls', 'ssl', 'none')
            from_address: Default from address (if None, uses username)
            pool_size: Connection pool size
        """
        self.hostname = hostname
        self.port = port
        self.username = username
        self.password = password

        # Parse encryption
        try:
            self.encryption = SMTPEncryption(encryption.lower())
        except ValueError:
            logger.warning(f"Unknown encryption mode: {encryption}, using TLS")
            self.encryption = SMTPEncryption.STARTTLS

        self.from_address = from_address or username
        self.pool = SMTPConnectionPool(max_connections=pool_size)
        self.validator = SMTPMessageValidator()
        self.operation_lock = Lock()  # Ensure thread-safe operations

    def connect(self) -> bool:
        """
        Test SMTP connection

        Returns:
            True if connection successful, False otherwise
        """
        try:
            conn = self.pool.get_connection(
                self.hostname,
                self.port,
                self.username,
                self.password,
                self.encryption
            )

            if conn:
                self.pool.release_connection(self.hostname, self.port, conn)
                logger.info(f"SMTP connection test successful: {self.hostname}:{self.port}")
                return True

            return False
        except Exception as e:
            logger.error(f"SMTP connection test failed: {e}")
            return False

    def authenticate(self) -> bool:
        """
        Authenticate with SMTP server

        Returns:
            True if authentication successful
        """
        try:
            conn = self.pool.get_connection(
                self.hostname,
                self.port,
                self.username,
                self.password,
                self.encryption
            )

            if conn:
                self.pool.release_connection(self.hostname, self.port, conn)
                logger.info(f"SMTP authentication successful for {self.username}")
                return True

            return False
        except Exception as e:
            logger.error(f"SMTP authentication failed: {e}")
            return False

    def test_connection(self) -> bool:
        """
        Test SMTP connection with VRFY command

        Returns:
            True if test successful
        """
        try:
            conn = self.pool.get_connection(
                self.hostname,
                self.port,
                self.username,
                self.password,
                self.encryption
            )

            if conn:
                try:
                    conn.verify(self.username)
                    logger.info(f"SMTP verify test successful for {self.username}")
                finally:
                    self.pool.release_connection(self.hostname, self.port, conn)
                return True

            return False
        except Exception as e:
            logger.debug(f"SMTP verify test not supported: {e}")
            # Verify not supported is not a failure
            return self.connect()

    def send_message(
        self,
        to_addresses: List[str],
        subject: str,
        text_body: Optional[str] = None,
        html_body: Optional[str] = None,
        cc_addresses: Optional[List[str]] = None,
        bcc_addresses: Optional[List[str]] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        custom_headers: Optional[Dict[str, str]] = None,
        from_address: Optional[str] = None,
        retry: bool = True
    ) -> DeliveryResult:
        """
        Send email message with retry logic

        Args:
            to_addresses: List of recipient addresses
            subject: Email subject
            text_body: Plain text body
            html_body: HTML body
            cc_addresses: CC recipients
            bcc_addresses: BCC recipients
            reply_to: Reply-To address
            attachments: List of attachments
            custom_headers: Custom email headers
            from_address: From address (overrides default)
            retry: Enable retry logic

        Returns:
            DeliveryResult with status and details
        """
        # Use provided from_address or default
        from_addr = from_address or self.from_address

        # Validate message
        is_valid, error_msg = self.validator.validate_message(
            from_addr, to_addresses, subject, text_body, html_body,
            cc_addresses, bcc_addresses, reply_to, attachments
        )

        if not is_valid:
            logger.error(f"Message validation failed: {error_msg}")
            return DeliveryResult(
                status=SMTPDeliveryStatus.INVALID,
                smtp_error=error_msg,
                is_retryable=False
            )

        # Attempt send with retry
        for attempt in range(self.MAX_RETRIES if retry else 1):
            result = self._send_message_attempt(
                from_addr, to_addresses, subject, text_body, html_body,
                cc_addresses, bcc_addresses, reply_to, attachments,
                custom_headers
            )

            if result.status == SMTPDeliveryStatus.SUCCESS:
                result.retry_count = attempt
                return result

            if not result.is_retryable or attempt >= self.MAX_RETRIES - 1:
                result.retry_count = attempt
                return result

            # Wait before retry
            delay = self.RETRY_DELAYS[min(attempt, len(self.RETRY_DELAYS) - 1)]
            logger.info(f"Retrying send in {delay}s (attempt {attempt + 1}/{self.MAX_RETRIES})")
            time.sleep(delay)

        # Should not reach here, but return last result
        return result

    def _send_message_attempt(
        self,
        from_address: str,
        to_addresses: List[str],
        subject: str,
        text_body: Optional[str],
        html_body: Optional[str],
        cc_addresses: Optional[List[str]],
        bcc_addresses: Optional[List[str]],
        reply_to: Optional[str],
        attachments: Optional[List[Dict[str, Any]]],
        custom_headers: Optional[Dict[str, str]]
    ) -> DeliveryResult:
        """Single send attempt"""
        conn = None
        try:
            with self.operation_lock:
                conn = self.pool.get_connection(
                    self.hostname, self.port, self.username,
                    self.password, self.encryption
                )

                if not conn:
                    return DeliveryResult(
                        status=SMTPDeliveryStatus.TEMP_FAILED,
                        smtp_error="Failed to obtain SMTP connection",
                        is_retryable=True
                    )

                # Build message
                msg, message_id = self._build_message(
                    from_address, to_addresses, subject, text_body,
                    html_body, cc_addresses, reply_to, attachments,
                    custom_headers
                )

                # Prepare recipients
                all_recipients = list(to_addresses)
                if cc_addresses:
                    all_recipients.extend(cc_addresses)
                if bcc_addresses:
                    all_recipients.extend(bcc_addresses)

                # Send
                try:
                    conn.send_message(msg)
                    logger.info(f"Message sent successfully (ID: {message_id})")
                    return DeliveryResult(
                        status=SMTPDeliveryStatus.SUCCESS,
                        message_id=message_id,
                        sent_at=datetime.utcnow(),
                        is_retryable=False
                    )

                except smtplib.SMTPRecipientsRefused as e:
                    # Some/all recipients rejected
                    logger.error(f"Recipients refused: {e}")
                    recipient_failures = {}
                    if hasattr(e, 'recipients') and isinstance(e.recipients, dict):
                        for addr, (code, msg) in e.recipients.items():
                            recipient_failures[addr] = f"SMTP {code}: {msg.decode() if isinstance(msg, bytes) else msg}"
                    return DeliveryResult(
                        status=SMTPDeliveryStatus.REJECTED,
                        message_id=message_id,
                        smtp_error=str(e),
                        recipient_failures=recipient_failures,
                        is_retryable=False
                    )

                except smtplib.SMTPSenderRefused as e:
                    # Sender rejected
                    logger.error(f"Sender refused: {e}")
                    return DeliveryResult(
                        status=SMTPDeliveryStatus.REJECTED,
                        smtp_code=e.smtp_code,
                        smtp_error=e.smtp_error.decode() if isinstance(e.smtp_error, bytes) else e.smtp_error,
                        is_retryable=False
                    )

                except smtplib.SMTPException as e:
                    # SMTP error
                    smtp_code = getattr(e, 'smtp_code', None)
                    smtp_error = getattr(e, 'smtp_error', str(e))
                    is_retryable = smtp_code in self.RETRYABLE_CODES if smtp_code else True

                    logger.error(f"SMTP error ({smtp_code}): {smtp_error}")
                    return DeliveryResult(
                        status=SMTPDeliveryStatus.FAILED if not is_retryable else SMTPDeliveryStatus.TEMP_FAILED,
                        smtp_code=smtp_code,
                        smtp_error=smtp_error.decode() if isinstance(smtp_error, bytes) else smtp_error,
                        is_retryable=is_retryable
                    )

        except socket.timeout as e:
            logger.error(f"Connection timeout: {e}")
            return DeliveryResult(
                status=SMTPDeliveryStatus.TEMP_FAILED,
                smtp_error=f"Connection timeout: {e}",
                is_retryable=True
            )

        except socket.error as e:
            logger.error(f"Socket error: {e}")
            return DeliveryResult(
                status=SMTPDeliveryStatus.TEMP_FAILED,
                smtp_error=f"Socket error: {e}",
                is_retryable=True
            )

        except Exception as e:
            logger.error(f"Unexpected error sending message: {e}")
            return DeliveryResult(
                status=SMTPDeliveryStatus.FAILED,
                smtp_error=f"Unexpected error: {e}",
                is_retryable=False
            )

        finally:
            if conn:
                self.pool.release_connection(self.hostname, self.port, conn)

    def _build_message(
        self,
        from_address: str,
        to_addresses: List[str],
        subject: str,
        text_body: Optional[str],
        html_body: Optional[str],
        cc_addresses: Optional[List[str]],
        reply_to: Optional[str],
        attachments: Optional[List[Dict[str, Any]]],
        custom_headers: Optional[Dict[str, str]]
    ) -> Tuple[MIMEMultipart, str]:
        """
        Build MIME message

        Returns:
            Tuple of (message, message_id)
        """
        # Create message ID
        import uuid
        message_id = f"<{uuid.uuid4()}@{self.hostname}>"

        # Create base message
        if html_body and text_body:
            msg = MIMEMultipart('alternative')
            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))
        elif html_body:
            msg = MIMEText(html_body, 'html')
        else:
            msg = MIMEText(text_body or '', 'plain')

        # If attachments, wrap in mixed multipart
        if attachments:
            multipart_msg = MIMEMultipart('mixed')
            if isinstance(msg, MIMEMultipart) and msg.get_content_type() == 'multipart/alternative':
                for part in msg.get_payload():
                    multipart_msg.attach(part)
            else:
                multipart_msg.attach(msg)
            msg = multipart_msg

        # Set headers
        msg['Subject'] = subject
        msg['From'] = from_address
        msg['To'] = ', '.join(to_addresses)
        msg['Date'] = formatdate(localtime=True)
        msg['Message-ID'] = message_id

        if cc_addresses:
            msg['Cc'] = ', '.join(cc_addresses)

        if reply_to:
            msg['Reply-To'] = reply_to

        # Add custom headers
        if custom_headers:
            for key, value in custom_headers.items():
                msg[key] = value

        # Add attachments
        if attachments:
            for attachment in attachments:
                self._add_attachment(msg, attachment)

        return msg, message_id

    def _add_attachment(self, msg: MIMEMultipart, attachment: Dict[str, Any]):
        """Add attachment to message"""
        try:
            filename = attachment.get('filename', 'attachment')
            content_type = attachment.get('contentType', 'application/octet-stream')
            data = attachment.get('data', '')

            # Decode base64 if needed
            if isinstance(data, str):
                data = base64.b64decode(data)

            # Parse MIME type
            maintype, subtype = content_type.split('/', 1) if '/' in content_type else (content_type, '')

            # Create appropriate MIME part
            if maintype == 'text':
                part = MIMEText(data.decode() if isinstance(data, bytes) else data, _subtype=subtype)
            elif maintype == 'image':
                part = MIMEImage(data, _subtype=subtype)
            elif maintype == 'audio':
                part = MIMEAudio(data, _subtype=subtype)
            else:
                part = MIMEBase(maintype, subtype)
                part.set_payload(data)
                encoders.encode_base64(part)

            part.add_header('Content-Disposition', 'attachment', filename=filename)
            msg.attach(part)
            logger.debug(f"Added attachment: {filename}")

        except Exception as e:
            logger.warning(f"Failed to add attachment {attachment.get('filename')}: {e}")

    def close(self):
        """Close all pooled connections"""
        self.pool.close_all()

    def get_stats(self) -> Dict[str, Any]:
        """Get handler statistics"""
        return {
            'hostname': self.hostname,
            'port': self.port,
            'username': self.username,
            'encryption': self.encryption.value,
            'pool_stats': self.pool.get_stats()
        }
