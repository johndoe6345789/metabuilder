"""
Email protocol handlers
Protocol-specific implementations for email operations
"""
from src.handlers.imap import (
    IMAPProtocolHandler,
    IMAPConnectionPool,
    IMAPConnection,
    IMAPConnectionConfig,
    IMAPConnectionState,
    IMAPFolder,
    IMAPMessage,
)
from src.handlers.pop3 import (
    POP3ProtocolHandler,
    POP3ConnectionPool,
    POP3ConnectionError,
    POP3AuthenticationError
)

__all__ = [
    'IMAPProtocolHandler',
    'IMAPConnectionPool',
    'IMAPConnection',
    'IMAPConnectionConfig',
    'IMAPConnectionState',
    'IMAPFolder',
    'IMAPMessage',
    'POP3ProtocolHandler',
    'POP3ConnectionPool',
    'POP3ConnectionError',
    'POP3AuthenticationError',
]
