"""
Phase 7 - IMAP Protocol Handler
Production-grade IMAP4 protocol handler with connection pooling,
IDLE support, UID tracking, and comprehensive error handling.
"""
import imaplib
import threading
import time
import logging
from typing import Dict, List, Optional, Tuple, Set, Any, Callable
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
from queue import Queue, Empty
from contextlib import contextmanager
import socket

logger = logging.getLogger(__name__)


class IMAPConnectionState(Enum):
    """IMAP connection state enumeration"""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    AUTHENTICATED = "authenticated"
    IDLE = "idle"
    SELECTED = "selected"
    ERROR = "error"


@dataclass
class IMAPFolder:
    """Structured folder representation"""
    name: str
    display_name: str
    folder_type: str
    flags: List[str]
    is_selectable: bool
    delimiter: Optional[str]
    unread_count: int = 0
    total_count: int = 0
    uid_validity: int = 0


@dataclass
class IMAPMessage:
    """Structured message representation"""
    uid: int
    folder: str
    message_id: str
    from_addr: str
    to_addrs: List[str]
    cc_addrs: List[str]
    bcc_addrs: List[str]
    subject: str
    text_body: str
    html_body: str
    received_at: int  # milliseconds timestamp
    is_read: bool
    is_starred: bool
    is_deleted: bool
    is_spam: bool
    is_draft: bool
    is_sent: bool
    attachment_count: int
    size: int
    flags: Set[str] = field(default_factory=set)


@dataclass
class IMAPConnectionConfig:
    """IMAP connection configuration"""
    hostname: str
    port: int
    username: str
    password: str
    encryption: str = "tls"  # 'tls', 'starttls', or 'none'
    timeout: int = 30
    idle_timeout: int = 900  # 15 minutes
    max_retries: int = 3
    retry_delay: int = 5  # seconds
    connection_id: str = ""


class IMAPConnection:
    """Single IMAP connection with state management"""

    def __init__(self, config: IMAPConnectionConfig):
        """Initialize IMAP connection"""
        self.config = config
        self.connection: Optional[imaplib.IMAP4_SSL | imaplib.IMAP4] = None
        self.state = IMAPConnectionState.DISCONNECTED
        self.lock = threading.RLock()
        self.current_folder: Optional[str] = None
        self.uid_validity: Dict[str, int] = {}
        self.last_activity = time.time()
        self.idle_thread: Optional[threading.Thread] = None
        self.idle_stop_event = threading.Event()

    def connect(self) -> bool:
        """
        Connect to IMAP server with retry logic

        Returns:
            True if connection successful, False otherwise
        """
        with self.lock:
            if self.state in [IMAPConnectionState.AUTHENTICATED, IMAPConnectionState.SELECTED]:
                return True

            self.state = IMAPConnectionState.CONNECTING

            for attempt in range(self.config.max_retries):
                try:
                    if self.config.encryption == "tls":
                        self.connection = imaplib.IMAP4_SSL(
                            self.config.hostname,
                            self.config.port,
                            timeout=self.config.timeout
                        )
                    else:
                        self.connection = imaplib.IMAP4(
                            self.config.hostname,
                            self.config.port,
                            timeout=self.config.timeout
                        )

                    # Upgrade to TLS if using STARTTLS
                    if self.config.encryption == "starttls":
                        self.connection.starttls()

                    # Authenticate
                    status, response = self.connection.login(
                        self.config.username,
                        self.config.password
                    )

                    if status != "OK":
                        logger.error(
                            f"[{self.config.connection_id}] Authentication failed: {response}"
                        )
                        self.state = IMAPConnectionState.ERROR
                        continue

                    self.state = IMAPConnectionState.AUTHENTICATED
                    self.last_activity = time.time()
                    logger.info(
                        f"[{self.config.connection_id}] Connected to {self.config.hostname}"
                    )
                    return True

                except socket.gaierror as e:
                    logger.error(
                        f"[{self.config.connection_id}] DNS resolution failed: {e}"
                    )
                    if attempt < self.config.max_retries - 1:
                        time.sleep(self.config.retry_delay * (attempt + 1))
                except socket.timeout as e:
                    logger.error(
                        f"[{self.config.connection_id}] Connection timeout: {e}"
                    )
                    if attempt < self.config.max_retries - 1:
                        time.sleep(self.config.retry_delay * (attempt + 1))
                except imaplib.IMAP4.error as e:
                    logger.error(
                        f"[{self.config.connection_id}] IMAP error: {e}"
                    )
                    if attempt < self.config.max_retries - 1:
                        time.sleep(self.config.retry_delay * (attempt + 1))
                except Exception as e:
                    logger.error(
                        f"[{self.config.connection_id}] Unexpected error: {e}"
                    )
                    if attempt < self.config.max_retries - 1:
                        time.sleep(self.config.retry_delay * (attempt + 1))

            self.state = IMAPConnectionState.ERROR
            return False

    def disconnect(self) -> None:
        """Disconnect from IMAP server"""
        with self.lock:
            if self.idle_thread and self.idle_thread.is_alive():
                self.stop_idle()

            if self.connection:
                try:
                    self.connection.close()
                    self.connection.logout()
                except Exception as e:
                    logger.warning(
                        f"[{self.config.connection_id}] Error during disconnect: {e}"
                    )

            self.connection = None
            self.state = IMAPConnectionState.DISCONNECTED
            self.current_folder = None

    def authenticate(self) -> bool:
        """
        Authenticate connection

        Returns:
            True if already authenticated or successfully authenticated
        """
        with self.lock:
            if self.state in [IMAPConnectionState.AUTHENTICATED, IMAPConnectionState.SELECTED]:
                return True

            return self.connect()

    def select_folder(self, folder_name: str) -> Tuple[bool, Optional[int]]:
        """
        Select folder and return message count

        Args:
            folder_name: Name of folder to select

        Returns:
            Tuple of (success, message_count)
        """
        with self.lock:
            if not self.connection or self.state == IMAPConnectionState.DISCONNECTED:
                return False, None

            try:
                status, response = self.connection.select(folder_name)

                if status != "OK":
                    logger.error(
                        f"[{self.config.connection_id}] Failed to select {folder_name}: {response}"
                    )
                    return False, None

                # Parse message count
                if response and response[0]:
                    message_count = int(response[0])
                else:
                    message_count = 0

                self.current_folder = folder_name
                self.state = IMAPConnectionState.SELECTED
                self.last_activity = time.time()

                logger.debug(
                    f"[{self.config.connection_id}] Selected {folder_name}: {message_count} messages"
                )
                return True, message_count

            except Exception as e:
                logger.error(
                    f"[{self.config.connection_id}] Error selecting folder: {e}"
                )
                return False, None

    def list_folders(self) -> List[IMAPFolder]:
        """
        List all folders on server

        Returns:
            List of IMAPFolder objects
        """
        with self.lock:
            if not self.connection or self.state == IMAPConnectionState.DISCONNECTED:
                return []

            try:
                folders = []
                status, mailbox_list = self.connection.list()

                if status != "OK":
                    logger.error(
                        f"[{self.config.connection_id}] Failed to list folders"
                    )
                    return []

                for mailbox_response in mailbox_list:
                    try:
                        flags, delimiter, name = self._parse_mailbox_response(mailbox_response)
                        folder = IMAPFolder(
                            name=name,
                            display_name=self._get_display_name(name),
                            folder_type=self._infer_folder_type(name, flags),
                            flags=[f.decode() if isinstance(f, bytes) else f for f in flags],
                            is_selectable=b"\\Noselect" not in flags,
                            delimiter=delimiter.decode() if isinstance(delimiter, bytes) else delimiter,
                        )
                        folders.append(folder)
                    except Exception as e:
                        logger.warning(
                            f"[{self.config.connection_id}] Error parsing folder: {e}"
                        )
                        continue

                logger.debug(
                    f"[{self.config.connection_id}] Listed {len(folders)} folders"
                )
                return folders

            except Exception as e:
                logger.error(
                    f"[{self.config.connection_id}] Error listing folders: {e}"
                )
                return []

    def fetch_messages(
        self,
        folder_name: str,
        start_uid: Optional[int] = None,
        end_uid: Optional[str] = "*",
    ) -> List[IMAPMessage]:
        """
        Fetch messages from folder by UID range

        Args:
            folder_name: Name of folder to fetch from
            start_uid: Starting UID (None = fetch all)
            end_uid: Ending UID ("*" = latest)

        Returns:
            List of IMAPMessage objects
        """
        with self.lock:
            if not self.connection or self.state == IMAPConnectionState.DISCONNECTED:
                return []

            try:
                # Select folder
                success, _ = self.select_folder(folder_name)
                if not success:
                    return []

                # Build UID range
                if start_uid is None:
                    uid_range = "1:*"
                else:
                    uid_range = f"{start_uid}:{end_uid}"

                # Search for messages
                status, response = self.connection.uid("SEARCH", None, "ALL")
                if status != "OK":
                    logger.error(
                        f"[{self.config.connection_id}] Failed to search messages"
                    )
                    return []

                uids = response[0].split() if response[0] else []
                logger.debug(
                    f"[{self.config.connection_id}] Found {len(uids)} messages in {folder_name}"
                )

                messages = []
                for uid in uids:
                    try:
                        message = self._fetch_message_by_uid(uid.decode() if isinstance(uid, bytes) else uid, folder_name)
                        if message:
                            messages.append(message)
                    except Exception as e:
                        logger.warning(
                            f"[{self.config.connection_id}] Error fetching UID {uid}: {e}"
                        )
                        continue

                self.last_activity = time.time()
                return messages

            except Exception as e:
                logger.error(
                    f"[{self.config.connection_id}] Error fetching messages: {e}"
                )
                return []

    def search(
        self,
        folder_name: str,
        criteria: str = "ALL",
    ) -> List[int]:
        """
        Search folder for message UIDs matching criteria

        Args:
            folder_name: Folder to search
            criteria: IMAP search criteria (e.g., "UNSEEN", "FROM sender@example.com")

        Returns:
            List of UIDs matching criteria
        """
        with self.lock:
            if not self.connection or self.state == IMAPConnectionState.DISCONNECTED:
                return []

            try:
                success, _ = self.select_folder(folder_name)
                if not success:
                    return []

                status, response = self.connection.uid("SEARCH", None, criteria)
                if status != "OK":
                    logger.error(
                        f"[{self.config.connection_id}] Search failed: {criteria}"
                    )
                    return []

                uids = []
                if response and response[0]:
                    uid_list = response[0].split()
                    uids = [int(u) if isinstance(u, bytes) else int(u) for u in uid_list]

                logger.debug(
                    f"[{self.config.connection_id}] Search found {len(uids)} messages"
                )
                self.last_activity = time.time()
                return uids

            except Exception as e:
                logger.error(
                    f"[{self.config.connection_id}] Error searching: {e}"
                )
                return []

    def set_flags(self, uid: int, flags: List[str], folder_name: Optional[str] = None) -> bool:
        """
        Set flags on a message

        Args:
            uid: Message UID
            flags: List of flags to set (e.g., [r'\Seen', r'\Flagged'])
            folder_name: Optional folder (selects if provided)

        Returns:
            True if successful
        """
        with self.lock:
            if not self.connection or self.state == IMAPConnectionState.DISCONNECTED:
                return False

            try:
                if folder_name and folder_name != self.current_folder:
                    success, _ = self.select_folder(folder_name)
                    if not success:
                        return False

                # Convert flags to bytes
                flag_bytes = [f.encode() if isinstance(f, str) else f for f in flags]

                status, response = self.connection.uid("STORE", str(uid), "+FLAGS", flag_bytes)
                if status != "OK":
                    logger.error(
                        f"[{self.config.connection_id}] Failed to set flags on UID {uid}"
                    )
                    return False

                self.last_activity = time.time()
                return True

            except Exception as e:
                logger.error(
                    f"[{self.config.connection_id}] Error setting flags: {e}"
                )
                return False

    def start_idle(self, callback: Optional[Callable] = None) -> bool:
        """
        Start IDLE (idle) mode for real-time notifications

        Args:
            callback: Optional callback function for new message notifications

        Returns:
            True if IDLE started successfully
        """
        with self.lock:
            if not self.connection or self.state == IMAPConnectionState.DISCONNECTED:
                return False

            if self.idle_thread and self.idle_thread.is_alive():
                logger.warning(
                    f"[{self.config.connection_id}] IDLE already running"
                )
                return False

            try:
                # Start IDLE mode
                self.connection.idle()
                self.state = IMAPConnectionState.IDLE
                self.idle_stop_event.clear()

                # Start listener thread
                self.idle_thread = threading.Thread(
                    target=self._idle_listener,
                    args=(callback,),
                    daemon=True,
                )
                self.idle_thread.start()

                logger.info(
                    f"[{self.config.connection_id}] IDLE mode started"
                )
                return True

            except Exception as e:
                logger.error(
                    f"[{self.config.connection_id}] Error starting IDLE: {e}"
                )
                self.state = IMAPConnectionState.ERROR
                return False

    def stop_idle(self) -> bool:
        """
        Stop IDLE mode

        Returns:
            True if IDLE stopped successfully
        """
        with self.lock:
            if self.state != IMAPConnectionState.IDLE:
                return False

            try:
                self.idle_stop_event.set()

                # Send DONE to exit IDLE
                if self.connection:
                    self.connection.idle_done()
                    self.state = IMAPConnectionState.AUTHENTICATED

                if self.idle_thread and self.idle_thread.is_alive():
                    self.idle_thread.join(timeout=5)

                logger.info(
                    f"[{self.config.connection_id}] IDLE mode stopped"
                )
                return True

            except Exception as e:
                logger.error(
                    f"[{self.config.connection_id}] Error stopping IDLE: {e}"
                )
                return False

    def _idle_listener(self, callback: Optional[Callable]) -> None:
        """
        Listen for IDLE responses (runs in separate thread)

        Args:
            callback: Optional callback for new messages
        """
        try:
            while not self.idle_stop_event.is_set():
                try:
                    # Wait for IDLE responses with timeout
                    responses = self.connection.idle_check(timeout=self.config.idle_timeout)

                    for response in responses or []:
                        if callback:
                            callback(response)
                        logger.debug(
                            f"[{self.config.connection_id}] IDLE response: {response}"
                        )

                except socket.timeout:
                    # Restart IDLE after timeout
                    self.connection.idle_done()
                    self.connection.idle()

        except Exception as e:
            logger.error(
                f"[{self.config.connection_id}] IDLE listener error: {e}"
            )

    def get_uid_validity(self, folder_name: str) -> int:
        """
        Get UID validity value for folder (for UID stability)

        Args:
            folder_name: Folder name

        Returns:
            UID validity value
        """
        with self.lock:
            if folder_name in self.uid_validity:
                return self.uid_validity[folder_name]

            if not self.connection or self.state == IMAPConnectionState.DISCONNECTED:
                return 0

            try:
                success, _ = self.select_folder(folder_name)
                if not success:
                    return 0

                # Get UID validity from UIDVALIDITY
                status, response = self.connection.status(folder_name, "(UIDVALIDITY)")
                if status != "OK" or not response:
                    return 0

                # Parse response: ('UIDVALIDITY 1234567890')
                response_str = response[0].decode() if isinstance(response[0], bytes) else response[0]
                parts = response_str.split()
                if len(parts) >= 2:
                    validity = int(parts[1])
                    self.uid_validity[folder_name] = validity
                    return validity

                return 0

            except Exception as e:
                logger.warning(
                    f"[{self.config.connection_id}] Error getting UID validity: {e}"
                )
                return 0

    def _fetch_message_by_uid(self, uid: str, folder_name: str) -> Optional[IMAPMessage]:
        """
        Fetch single message by UID

        Args:
            uid: Message UID
            folder_name: Folder name

        Returns:
            IMAPMessage or None
        """
        try:
            status, data = self.connection.uid("FETCH", uid, "(RFC822 FLAGS)")
            if status != "OK" or not data:
                return None

            # Parse response
            message_data = data[0]
            if not message_data:
                return None

            flags_data = data[1] if len(data) > 1 else b""
            rfc822_data = message_data[1] if isinstance(message_data, tuple) else b""

            # Parse email
            from email.parser import BytesParser
            from email.policy import default
            from email.utils import parsedate_to_datetime

            parser = BytesParser(policy=default)
            email_msg = parser.parsebytes(rfc822_data)

            # Extract headers
            from_addr = email_msg.get("From", "")
            to_addrs = [a.strip() for a in email_msg.get("To", "").split(",") if a.strip()]
            cc_addrs = [a.strip() for a in email_msg.get("Cc", "").split(",") if a.strip()]
            bcc_addrs = [a.strip() for a in email_msg.get("Bcc", "").split(",") if a.strip()]
            subject = email_msg.get("Subject", "")
            message_id = email_msg.get("Message-ID", "")

            # Parse body
            text_body = ""
            html_body = ""

            if email_msg.is_multipart():
                for part in email_msg.iter_parts():
                    content_type = part.get_content_type()
                    if content_type == "text/plain" and not text_body:
                        text_body = part.get_content()
                    elif content_type == "text/html" and not html_body:
                        html_body = part.get_content()
            else:
                if email_msg.get_content_type() == "text/html":
                    html_body = email_msg.get_content()
                else:
                    text_body = email_msg.get_content()

            # Parse date
            date_str = email_msg.get("Date", "")
            try:
                if date_str:
                    dt = parsedate_to_datetime(date_str)
                    received_at = int(dt.timestamp() * 1000)
                else:
                    received_at = int(datetime.utcnow().timestamp() * 1000)
            except Exception:
                received_at = int(datetime.utcnow().timestamp() * 1000)

            # Parse flags
            flags = set()
            if flags_data:
                flags_str = flags_data.decode() if isinstance(flags_data, bytes) else flags_data
                if "\\Seen" in flags_str:
                    flags.add("\\Seen")
                if "\\Flagged" in flags_str:
                    flags.add("\\Flagged")
                if "\\Deleted" in flags_str:
                    flags.add("\\Deleted")
                if "\\Draft" in flags_str:
                    flags.add("\\Draft")

            # Count attachments
            attachment_count = sum(
                1 for part in email_msg.iter_parts()
                if part.get_filename()
            )

            return IMAPMessage(
                uid=int(uid),
                folder=folder_name,
                message_id=message_id,
                from_addr=from_addr,
                to_addrs=to_addrs,
                cc_addrs=cc_addrs,
                bcc_addrs=bcc_addrs,
                subject=subject,
                text_body=text_body,
                html_body=html_body,
                received_at=received_at,
                is_read="\\Seen" in flags,
                is_starred="\\Flagged" in flags,
                is_deleted="\\Deleted" in flags,
                is_spam="Spam" in folder_name or "Junk" in folder_name,
                is_draft="\\Draft" in flags or folder_name.lower() == "drafts",
                is_sent="Sent" in folder_name,
                attachment_count=attachment_count,
                size=len(rfc822_data),
                flags=flags,
            )

        except Exception as e:
            logger.warning(
                f"[{self.config.connection_id}] Error fetching message UID {uid}: {e}"
            )
            return None

    def _parse_mailbox_response(self, response: bytes) -> Tuple[List[bytes], Optional[str], str]:
        """Parse mailbox response from LIST command"""
        import re

        response_str = response.decode() if isinstance(response, bytes) else response
        # Parse: (FLAGS) "DELIMITER" "NAME"
        match = re.match(r"\((?P<flags>.*?)\)\s+(?:\"(?P<delim>.*?)\"|NIL)\s+(?:\"(?P<name>.*?)\"|(?P<name_unquoted>\S+))", response_str)

        if match:
            flags_str = match.group("flags")
            flags = [f.encode() for f in flags_str.split()] if flags_str else []
            delimiter = match.group("delim")
            name = match.group("name") or match.group("name_unquoted") or ""
            return flags, delimiter, name

        return [], None, ""

    def _infer_folder_type(self, folder_name: str, flags: List[bytes]) -> str:
        """Infer folder type from name and flags"""
        lower_name = folder_name.lower()

        if b"\\Inbox" in flags or "inbox" in lower_name:
            return "inbox"
        if b"\\Sent" in flags or "sent" in lower_name:
            return "sent"
        if b"\\Drafts" in flags or "draft" in lower_name:
            return "drafts"
        if b"\\Trash" in flags or "trash" in lower_name or "deleted" in lower_name:
            return "trash"
        if b"\\Junk" in flags or "spam" in lower_name or "junk" in lower_name:
            return "spam"
        if b"\\All" in flags or "archive" in lower_name or "all" in lower_name:
            return "archive"

        return "custom"

    def _get_display_name(self, folder_name: str) -> str:
        """Get human-readable folder display name"""
        if folder_name.startswith("[Gmail]/"):
            return folder_name[8:]

        return folder_name.split("/")[-1]


class IMAPConnectionPool:
    """Thread-safe connection pool for multiple IMAP accounts"""

    def __init__(self, max_connections_per_account: int = 3):
        """
        Initialize connection pool

        Args:
            max_connections_per_account: Maximum connections per account
        """
        self.max_connections_per_account = max_connections_per_account
        self.pools: Dict[str, List[IMAPConnection]] = {}
        self.lock = threading.RLock()
        self.semaphores: Dict[str, threading.Semaphore] = {}

    def get_connection(self, config: IMAPConnectionConfig) -> IMAPConnection:
        """
        Get connection from pool or create new one

        Args:
            config: IMAP connection configuration

        Returns:
            IMAPConnection object
        """
        with self.lock:
            account_id = f"{config.hostname}:{config.username}"

            if account_id not in self.pools:
                self.pools[account_id] = []
                self.semaphores[account_id] = threading.Semaphore(
                    self.max_connections_per_account
                )

            # Try to reuse existing connection
            pool = self.pools[account_id]
            for conn in pool:
                if (
                    conn.state in [
                        IMAPConnectionState.AUTHENTICATED,
                        IMAPConnectionState.SELECTED,
                    ]
                    and time.time() - conn.last_activity < 300  # 5 minutes
                ):
                    logger.debug(
                        f"[{config.connection_id}] Reusing connection from pool"
                    )
                    return conn

            # Create new connection if pool not full
            if len(pool) < self.max_connections_per_account:
                config.connection_id = f"{account_id}#{len(pool)}"
                conn = IMAPConnection(config)
                if conn.connect():
                    pool.append(conn)
                    logger.debug(
                        f"[{config.connection_id}] Created new connection in pool"
                    )
                    return conn

            # Wait for available connection and reuse
            self.semaphores[account_id].acquire()
            if pool:
                conn = pool[0]
                if not conn.connect():
                    conn.disconnect()
                return conn

            # Fallback: create new connection even if pool is full
            config.connection_id = f"{account_id}#{len(pool)}"
            conn = IMAPConnection(config)
            conn.connect()
            return conn

    def release_connection(self, connection: IMAPConnection) -> None:
        """
        Release connection back to pool

        Args:
            connection: IMAPConnection to release
        """
        with self.lock:
            # Keep connection in pool for reuse
            if connection.state == IMAPConnectionState.ERROR:
                logger.debug("Removing failed connection from pool")
                connection.disconnect()

    def clear_pool(self, account_id: Optional[str] = None) -> None:
        """
        Clear connections from pool

        Args:
            account_id: Optional specific account to clear (None = clear all)
        """
        with self.lock:
            if account_id:
                if account_id in self.pools:
                    for conn in self.pools[account_id]:
                        conn.disconnect()
                    del self.pools[account_id]
                    if account_id in self.semaphores:
                        del self.semaphores[account_id]
            else:
                for pool in self.pools.values():
                    for conn in pool:
                        conn.disconnect()
                self.pools.clear()
                self.semaphores.clear()

    @contextmanager
    def pooled_connection(self, config: IMAPConnectionConfig):
        """
        Context manager for pooled connections

        Args:
            config: IMAP connection configuration

        Yields:
            IMAPConnection object
        """
        conn = self.get_connection(config)
        try:
            yield conn
        finally:
            self.release_connection(conn)


class IMAPProtocolHandler:
    """
    High-level IMAP protocol handler with connection pooling,
    IDLE support, and structured data returns
    """

    def __init__(self, connection_pool: Optional[IMAPConnectionPool] = None):
        """
        Initialize protocol handler

        Args:
            connection_pool: Optional connection pool (creates default if None)
        """
        self.pool = connection_pool or IMAPConnectionPool()
        self.idle_callbacks: Dict[str, Callable] = {}

    def connect(
        self,
        hostname: str,
        port: int,
        username: str,
        password: str,
        encryption: str = "tls",
        timeout: int = 30,
    ) -> bool:
        """
        Connect to IMAP server

        Args:
            hostname: Server hostname
            port: Server port
            username: Username
            password: Password
            encryption: Encryption type
            timeout: Connection timeout

        Returns:
            True if connected successfully
        """
        config = IMAPConnectionConfig(
            hostname=hostname,
            port=port,
            username=username,
            password=password,
            encryption=encryption,
            timeout=timeout,
        )

        with self.pool.pooled_connection(config) as conn:
            return conn.state in [
                IMAPConnectionState.AUTHENTICATED,
                IMAPConnectionState.SELECTED,
            ]

    def authenticate(self, config: IMAPConnectionConfig) -> bool:
        """
        Authenticate connection

        Args:
            config: Connection configuration

        Returns:
            True if authenticated
        """
        with self.pool.pooled_connection(config) as conn:
            return conn.authenticate()

    def list_folders(self, config: IMAPConnectionConfig) -> List[IMAPFolder]:
        """
        List all folders

        Args:
            config: Connection configuration

        Returns:
            List of IMAPFolder objects
        """
        with self.pool.pooled_connection(config) as conn:
            return conn.list_folders()

    def fetch_messages(
        self,
        config: IMAPConnectionConfig,
        folder_name: str,
        start_uid: Optional[int] = None,
    ) -> List[IMAPMessage]:
        """
        Fetch messages from folder

        Args:
            config: Connection configuration
            folder_name: Folder name
            start_uid: Starting UID for incremental fetch

        Returns:
            List of IMAPMessage objects
        """
        with self.pool.pooled_connection(config) as conn:
            return conn.fetch_messages(folder_name, start_uid)

    def search(
        self,
        config: IMAPConnectionConfig,
        folder_name: str,
        criteria: str = "ALL",
    ) -> List[int]:
        """
        Search folder

        Args:
            config: Connection configuration
            folder_name: Folder name
            criteria: IMAP search criteria

        Returns:
            List of matching UIDs
        """
        with self.pool.pooled_connection(config) as conn:
            return conn.search(folder_name, criteria)

    def mark_as_read(
        self,
        config: IMAPConnectionConfig,
        uid: int,
        folder_name: Optional[str] = None,
    ) -> bool:
        """
        Mark message as read

        Args:
            config: Connection configuration
            uid: Message UID
            folder_name: Optional folder name

        Returns:
            True if successful
        """
        with self.pool.pooled_connection(config) as conn:
            return conn.set_flags(uid, [r"\Seen"], folder_name)

    def mark_as_unread(
        self,
        config: IMAPConnectionConfig,
        uid: int,
        folder_name: Optional[str] = None,
    ) -> bool:
        """
        Mark message as unread

        Args:
            config: Connection configuration
            uid: Message UID
            folder_name: Optional folder name

        Returns:
            True if successful
        """
        with self.pool.pooled_connection(config) as conn:
            status, _ = conn.select_folder(folder_name) if folder_name else (True, None)
            if not status:
                return False

            return conn.connection.uid("STORE", str(uid), "-FLAGS", [b"\\Seen"])[0] == "OK"

    def add_star(
        self,
        config: IMAPConnectionConfig,
        uid: int,
        folder_name: Optional[str] = None,
    ) -> bool:
        """
        Add star to message

        Args:
            config: Connection configuration
            uid: Message UID
            folder_name: Optional folder name

        Returns:
            True if successful
        """
        with self.pool.pooled_connection(config) as conn:
            return conn.set_flags(uid, [r"\Flagged"], folder_name)

    def remove_star(
        self,
        config: IMAPConnectionConfig,
        uid: int,
        folder_name: Optional[str] = None,
    ) -> bool:
        """
        Remove star from message

        Args:
            config: Connection configuration
            uid: Message UID
            folder_name: Optional folder name

        Returns:
            True if successful
        """
        with self.pool.pooled_connection(config) as conn:
            status, _ = conn.select_folder(folder_name) if folder_name else (True, None)
            if not status:
                return False

            return conn.connection.uid("STORE", str(uid), "-FLAGS", [b"\\Flagged"])[0] == "OK"

    def start_idle(
        self,
        config: IMAPConnectionConfig,
        callback: Optional[Callable] = None,
    ) -> bool:
        """
        Start IDLE mode for real-time notifications

        Args:
            config: Connection configuration
            callback: Optional callback for notifications

        Returns:
            True if IDLE started
        """
        account_id = f"{config.hostname}:{config.username}"
        if callback:
            self.idle_callbacks[account_id] = callback

        with self.pool.pooled_connection(config) as conn:
            return conn.start_idle(callback)

    def stop_idle(
        self,
        config: IMAPConnectionConfig,
    ) -> bool:
        """
        Stop IDLE mode

        Args:
            config: Connection configuration

        Returns:
            True if IDLE stopped
        """
        account_id = f"{config.hostname}:{config.username}"
        self.idle_callbacks.pop(account_id, None)

        with self.pool.pooled_connection(config) as conn:
            return conn.stop_idle()

    def get_uid_validity(
        self,
        config: IMAPConnectionConfig,
        folder_name: str,
    ) -> int:
        """
        Get UID validity for folder

        Args:
            config: Connection configuration
            folder_name: Folder name

        Returns:
            UID validity value
        """
        with self.pool.pooled_connection(config) as conn:
            return conn.get_uid_validity(folder_name)

    def disconnect(self) -> None:
        """Disconnect all connections"""
        self.pool.clear_pool()
