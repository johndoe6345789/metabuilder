"""
IMAP Sync Implementation
IMAPClient wrapper for incremental sync operations with UID tracking
"""
from typing import List, Dict, Any, Optional, Tuple
from imapclient import IMAPClient
from email.parser import BytesParser
from email.policy import default
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class IMAPSyncManager:
    """Manages IMAP sync operations for email accounts"""

    def __init__(self, hostname: str, port: int, username: str, password: str, encryption: str = 'tls'):
        """
        Initialize IMAP sync manager

        Args:
            hostname: IMAP server hostname (e.g., imap.gmail.com)
            port: IMAP server port (993 for TLS, 143 for STARTTLS)
            username: IMAP username
            password: IMAP password
            encryption: 'tls' (default), 'starttls', or 'none'
        """
        self.hostname = hostname
        self.port = port
        self.username = username
        self.password = password
        self.encryption = encryption
        self.client: Optional[IMAPClient] = None

    def connect(self) -> bool:
        """
        Connect to IMAP server

        Returns:
            True if connection successful, False otherwise
        """
        try:
            use_ssl = self.encryption == 'tls'
            self.client = IMAPClient(
                self.hostname,
                port=self.port,
                use_ssl=use_ssl,
                timeout=30
            )

            # Handle STARTTLS
            if self.encryption == 'starttls':
                self.client.starttls()

            # Authenticate
            self.client.login(self.username, self.password)
            logger.info(f'Connected to {self.hostname} as {self.username}')
            return True
        except Exception as e:
            logger.error(f'Failed to connect to IMAP server: {e}')
            return False

    def disconnect(self):
        """Disconnect from IMAP server"""
        if self.client:
            try:
                self.client.logout()
                logger.info('Disconnected from IMAP server')
            except Exception as e:
                logger.warning(f'Error during logout: {e}')

    def list_folders(self) -> List[Dict[str, Any]]:
        """
        List all folders on IMAP server

        Returns:
            List of folder dicts with name, type, attributes
        """
        if not self.client:
            return []

        try:
            folders = []
            mailbox_list = self.client.list_folders()

            for flags, delimiter, name in mailbox_list:
                # Determine folder type from IMAP flags
                folder_type = self._infer_folder_type(name, flags)

                folders.append({
                    'name': name,
                    'displayName': self._get_display_name(name),
                    'type': folder_type,
                    'flags': [f.decode() if isinstance(f, bytes) else f for f in flags],
                    'isSelectable': b'\\Noselect' not in flags and not name.startswith('[Gmail]'),
                    'delimiter': delimiter.decode() if isinstance(delimiter, bytes) else delimiter
                })

            return folders
        except Exception as e:
            logger.error(f'Failed to list folders: {e}')
            return []

    def sync_folder(
        self,
        folder_name: str,
        last_uid: Optional[int] = None,
        force_full: bool = False
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Sync messages from a folder (incremental by default)

        Args:
            folder_name: Name of folder to sync
            last_uid: Last synced UID for incremental sync (None = full sync)
            force_full: Force full sync even if last_uid provided

        Returns:
            Tuple of (messages, highest_uid)
        """
        if not self.client:
            return [], 0

        try:
            # Select folder
            flags, message_count, _ = self.client.select_folder(folder_name)
            logger.info(f'Selected {folder_name}: {message_count[0]} messages')

            messages = []
            highest_uid = 0

            if not force_full and last_uid:
                # Incremental sync - fetch new messages since last_uid
                search_criteria = f'{last_uid + 1}:*'
                uids = self.client.search(search_criteria)
                logger.info(f'Found {len(uids)} new messages since UID {last_uid}')
            else:
                # Full sync - fetch all messages
                uids = self.client.search()
                logger.info(f'Full sync: fetching {len(uids)} messages')

            # Fetch messages in batches
            for uid in uids:
                try:
                    message_data = self._fetch_message(uid, folder_name)
                    if message_data:
                        messages.append(message_data)
                        highest_uid = max(highest_uid, uid)
                except Exception as e:
                    logger.warning(f'Failed to fetch message UID {uid}: {e}')
                    continue

            logger.info(f'Synced {len(messages)} messages from {folder_name}')
            return messages, highest_uid

        except Exception as e:
            logger.error(f'Failed to sync folder {folder_name}: {e}')
            return [], 0

    def _fetch_message(self, uid: int, folder_name: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a single message by UID

        Args:
            uid: Message UID
            folder_name: Folder name (for context)

        Returns:
            Message dict or None if fetch failed
        """
        try:
            # Fetch raw message
            data = self.client.fetch(uid, [b'RFC822', b'FLAGS'])

            if uid not in data:
                return None

            message_data = data[uid]
            flags = message_data.get(b'FLAGS', [])
            rfc822 = message_data.get(b'RFC822', b'')

            # Parse email
            parser = BytesParser(policy=default)
            email = parser.parsebytes(rfc822)

            # Extract headers
            from_header = email.get('From', '')
            to_header = email.get('To', '')
            cc_header = email.get('Cc', '')
            bcc_header = email.get('Bcc', '')
            subject = email.get('Subject', '')
            message_id = email.get('Message-ID', '')
            date_str = email.get('Date', '')

            # Parse body
            text_body = ''
            html_body = ''

            if email.is_multipart():
                for part in email.iter_parts():
                    content_type = part.get_content_type()
                    if content_type == 'text/plain':
                        text_body = part.get_content()
                    elif content_type == 'text/html':
                        html_body = part.get_content()
            else:
                if email.get_content_type() == 'text/html':
                    html_body = email.get_content()
                else:
                    text_body = email.get_content()

            # Parse recipients
            to_addresses = [addr.strip() for addr in to_header.split(',') if addr.strip()]
            cc_addresses = [addr.strip() for addr in cc_header.split(',') if addr.strip()] if cc_header else []

            return {
                'uid': uid,
                'folder': folder_name,
                'messageId': message_id,
                'from': from_header,
                'to': to_addresses,
                'cc': cc_addresses,
                'bcc': [addr.strip() for addr in bcc_header.split(',') if addr.strip()] if bcc_header else [],
                'subject': subject,
                'textBody': text_body,
                'htmlBody': html_body,
                'receivedAt': self._parse_date(date_str),
                'isRead': b'\\Seen' in flags,
                'isStarred': b'\\Flagged' in flags,
                'isDeleted': b'\\Deleted' in flags,
                'isSpam': b'\\Junk' in flags or 'Spam' in folder_name,
                'isDraft': b'\\Draft' in flags or folder_name.lower() == 'drafts',
                'isSent': b'\\Sent' in flags or folder_name.lower() in ['sent', 'sent mail'],
                'attachmentCount': len([p for p in email.iter_parts() if p.get_filename()]),
                'size': len(rfc822)
            }
        except Exception as e:
            logger.warning(f'Failed to parse message UID {uid}: {e}')
            return None

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

            # Try parsing with email.utils
            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(date_str)
            return int(dt.timestamp() * 1000)
        except Exception:
            # Fallback to current time
            logger.warning(f'Failed to parse date: {date_str}')
            return int(datetime.utcnow().timestamp() * 1000)

    def _infer_folder_type(self, folder_name: str, flags: List[bytes]) -> str:
        """
        Infer folder type from name and IMAP flags

        Args:
            folder_name: Folder name
            flags: IMAP flags

        Returns:
            Folder type: 'inbox', 'sent', 'drafts', 'trash', 'spam', 'archive', 'custom'
        """
        lower_name = folder_name.lower()

        # Check IMAP special folder flags
        if b'\\All' in flags:
            return 'archive'
        if b'\\Sent' in flags:
            return 'sent'
        if b'\\Drafts' in flags:
            return 'drafts'
        if b'\\Trash' in flags or b'\\Deleted' in flags:
            return 'trash'
        if b'\\Junk' in flags:
            return 'spam'
        if b'\\Inbox' in flags:
            return 'inbox'

        # Fallback to name matching
        if 'inbox' in lower_name:
            return 'inbox'
        if 'sent' in lower_name:
            return 'sent'
        if 'draft' in lower_name:
            return 'drafts'
        if 'trash' in lower_name or 'deleted' in lower_name:
            return 'trash'
        if 'spam' in lower_name or 'junk' in lower_name:
            return 'spam'
        if 'archive' in lower_name or 'all' in lower_name:
            return 'archive'

        return 'custom'

    def _get_display_name(self, folder_name: str) -> str:
        """
        Get human-readable folder display name

        Args:
            folder_name: Raw folder name from IMAP

        Returns:
            Display name
        """
        # Handle Gmail-style folders
        if folder_name.startswith('[Gmail]/'):
            return folder_name[8:]  # Remove [Gmail]/ prefix

        # Clean up folder name
        return folder_name.split('/')[-1]  # Get last part after delimiter

    def mark_as_read(self, uid: int) -> bool:
        """Mark message as read"""
        try:
            self.client.set_flags(uid, [b'\\Seen'])
            return True
        except Exception as e:
            logger.error(f'Failed to mark UID {uid} as read: {e}')
            return False

    def mark_as_unread(self, uid: int) -> bool:
        """Mark message as unread"""
        try:
            self.client.remove_flags(uid, [b'\\Seen'])
            return True
        except Exception as e:
            logger.error(f'Failed to mark UID {uid} as unread: {e}')
            return False

    def add_star(self, uid: int) -> bool:
        """Add star to message"""
        try:
            self.client.set_flags(uid, [b'\\Flagged'])
            return True
        except Exception as e:
            logger.error(f'Failed to star UID {uid}: {e}')
            return False

    def remove_star(self, uid: int) -> bool:
        """Remove star from message"""
        try:
            self.client.remove_flags(uid, [b'\\Flagged'])
            return True
        except Exception as e:
            logger.error(f'Failed to unstar UID {uid}: {e}')
            return False

    def delete_message(self, uid: int) -> bool:
        """Delete message (mark with \\Deleted flag)"""
        try:
            self.client.set_flags(uid, [b'\\Deleted'])
            self.client.expunge()
            return True
        except Exception as e:
            logger.error(f'Failed to delete UID {uid}: {e}')
            return False
