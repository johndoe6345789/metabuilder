"""
SMTP Send Implementation
Handles outgoing email via SMTP with attachment support
"""
from typing import List, Dict, Any, Optional
import smtplib
import base64
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.image import MIMEImage
from email.mime.audio import MIMEAudio
from email import encoders
from email.utils import formatdate

logger = logging.getLogger(__name__)

class SMTPSender:
    """Manages SMTP operations for sending emails"""

    def __init__(self, hostname: str, port: int, username: str, password: str, encryption: str = 'tls'):
        """
        Initialize SMTP sender

        Args:
            hostname: SMTP server hostname (e.g., smtp.gmail.com)
            port: SMTP server port (587 for TLS, 465 for SSL, 25 for plain)
            username: SMTP username
            password: SMTP password
            encryption: 'tls' (STARTTLS), 'ssl' (implicit SSL), or 'none'
        """
        self.hostname = hostname
        self.port = port
        self.username = username
        self.password = password
        self.encryption = encryption
        self.client: Optional[smtplib.SMTP] = None

    def connect(self) -> bool:
        """
        Connect to SMTP server

        Returns:
            True if connection successful, False otherwise
        """
        try:
            if self.encryption == 'ssl':
                self.client = smtplib.SMTP_SSL(self.hostname, self.port, timeout=30)
            else:
                self.client = smtplib.SMTP(self.hostname, self.port, timeout=30)

            # Use STARTTLS if configured
            if self.encryption == 'tls' and self.client is not None:
                self.client.starttls()

            # Authenticate
            self.client.login(self.username, self.password)
            logger.info(f'Connected to SMTP server {self.hostname}:{self.port}')
            return True
        except Exception as e:
            logger.error(f'Failed to connect to SMTP server: {e}')
            return False

    def disconnect(self):
        """Disconnect from SMTP server"""
        if self.client:
            try:
                self.client.quit()
                logger.info('Disconnected from SMTP server')
            except Exception as e:
                logger.warning(f'Error during SMTP disconnect: {e}')

    def send_email(
        self,
        from_address: str,
        to_addresses: List[str],
        subject: str,
        text_body: str = '',
        html_body: str = '',
        cc_addresses: Optional[List[str]] = None,
        bcc_addresses: Optional[List[str]] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        custom_headers: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Send email via SMTP

        Args:
            from_address: Sender email address
            to_addresses: List of recipient email addresses
            subject: Email subject
            text_body: Plain text body
            html_body: HTML body
            cc_addresses: List of CC recipients
            bcc_addresses: List of BCC recipients
            reply_to: Reply-To address
            attachments: List of attachment dicts with 'filename', 'contentType', 'data'
            custom_headers: Custom email headers

        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.client:
            logger.error('Not connected to SMTP server')
            return False

        try:
            # Create message
            if html_body and text_body:
                msg = MIMEMultipart('alternative')
                msg.attach(MIMEText(text_body, 'plain'))
                msg.attach(MIMEText(html_body, 'html'))
            elif html_body:
                msg = MIMEText(html_body, 'html')
            else:
                msg = MIMEText(text_body, 'plain')

            # If we have attachments, wrap in multipart/mixed
            if attachments:
                multipart_msg = MIMEMultipart('mixed')
                if isinstance(msg, MIMEMultipart):
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

            # Prepare recipient list (including BCC)
            all_recipients = list(to_addresses)
            if cc_addresses:
                all_recipients.extend(cc_addresses)
            if bcc_addresses:
                all_recipients.extend(bcc_addresses)

            # Send email
            self.client.send_message(msg)
            logger.info(f'Email sent from {from_address} to {len(all_recipients)} recipients')
            return True

        except Exception as e:
            logger.error(f'Failed to send email: {e}')
            return False

    def _add_attachment(self, msg: MIMEMultipart, attachment: Dict[str, Any]):
        """
        Add attachment to email message

        Args:
            msg: MIME message
            attachment: Attachment dict with 'filename', 'contentType', 'data'
        """
        try:
            filename = attachment.get('filename', 'attachment')
            content_type = attachment.get('contentType', 'application/octet-stream')
            data = attachment.get('data', '')

            # Decode base64 data if provided as string
            if isinstance(data, str):
                data = base64.b64decode(data)

            # Determine MIME type and add attachment
            maintype, subtype = content_type.split('/', 1)

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

            # Set filename
            part.add_header('Content-Disposition', 'attachment', filename=filename)
            msg.attach(part)
            logger.info(f'Added attachment: {filename} ({content_type})')

        except Exception as e:
            logger.warning(f'Failed to add attachment {attachment.get("filename")}: {e}')

    def test_connection(self) -> bool:
        """
        Test SMTP connection by verifying the sender address

        Returns:
            True if connection test successful, False otherwise
        """
        try:
            if self.client:
                self.client.verify(self.username)
                logger.info(f'SMTP connection test successful for {self.username}')
                return True
            return False
        except Exception as e:
            logger.error(f'SMTP connection test failed: {e}')
            return False
