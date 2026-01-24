# Phase 7: POP3 Protocol Handler

## Overview

POP3 (Post Office Protocol version 3) handler providing stateless email retrieval capabilities with connection management, error recovery, and connection pooling.

**Location**: `services/email_service/src/handlers/pop3.py`

**Status**: Production Ready (Phase 7)

## Key Characteristics

### POP3 Limitations & Design Decisions

POP3 is a simpler protocol than IMAP with fundamental limitations:

| Feature | IMAP | POP3 | Notes |
|---------|------|------|-------|
| **Folder Support** | ✓ Full | ✗ None | Single mailbox only |
| **Flags** | ✓ Yes (Read, Starred, etc.) | ✗ No | No persistent message state |
| **Incremental Sync** | ✓ Yes (UID) | ~ Partial | Must track UIDL locally |
| **Concurrent Access** | ✓ Yes | ✗ No | Locks mailbox during session |
| **Message IDs** | ✓ Unique (UID) | ~ Session-based | IDs valid only within session |

### Stateless Design

The handler operates in **stateless mode** for each operation:
- Each major operation (list, fetch, delete) opens and closes connection
- No persistent connection state
- Compatible with serverless architectures
- Automatic connection cleanup

### Error Recovery

- **Automatic Retry**: 3 retry attempts for connection failures
- **Timeout Handling**: 30-second default timeout (configurable)
- **Graceful Degradation**: Forced close if quit fails
- **Exception Wrapping**: Custom exceptions for clear error handling

## Class Structure

### POP3ProtocolHandler

Main protocol handler for POP3 operations.

```python
handler = POP3ProtocolHandler(
    hostname='pop.gmail.com',
    port=995,
    username='user@gmail.com',
    password='password',
    encryption='ssl',  # 'ssl', 'tls', 'none'
    timeout=30
)
```

#### Methods

##### Connection Management

```python
def connect() -> bool
```
Connect to POP3 server with automatic retry logic.
- **Returns**: True on success
- **Raises**: `POP3ConnectionError` if all retries exhausted
- **Auto-Retry**: 3 attempts with exponential backoff

```python
def authenticate(username: str = None, password: str = None) -> bool
```
Authenticate with POP3 server.
- **Returns**: True on success
- **Raises**: `POP3AuthenticationError` if authentication fails
- **Usage**: Override credentials if needed

```python
def disconnect() -> bool
```
Gracefully disconnect from server.
- **Returns**: True if successful
- **Fallback**: Forced close if quit fails
- **Idempotent**: Safe to call multiple times

##### Message Operations

```python
def list_messages() -> Tuple[List[int], int]
```
List all messages in mailbox.
- **Returns**: (message_ids, total_size_bytes)
- **POP3 Limitation**: Returns only IDs, not metadata

```python
def fetch_message(message_id: int) -> Optional[Dict[str, Any]]
```
Fetch a single message.
- **Parameters**: 1-based message ID (from list_messages)
- **Returns**: Message dict with parsed headers/body
- **Parsed Fields**:
  - `messageId`, `from`, `to`, `cc`, `bcc`
  - `subject`, `textBody`, `htmlBody`
  - `receivedAt` (milliseconds timestamp)
  - `size`, `attachmentCount`, `attachments`
  - `isRead`, `isStarred`, `isDeleted` (always False for POP3)

```python
def fetch_messages(message_ids: List[int] = None) -> List[Dict[str, Any]]
```
Fetch multiple messages.
- **Parameters**: message_ids (None = all messages)
- **Returns**: List of message dicts
- **Graceful Failure**: Continues if individual messages fail

```python
def delete_message(message_id: int) -> bool
```
Mark message for deletion.
- **Important**: Messages not permanently deleted until disconnect
- **Usage**: Use `reset()` to undo pending deletions
- **Returns**: True if marked successfully

```python
def delete_messages(message_ids: List[int]) -> Tuple[int, int]
```
Delete multiple messages.
- **Returns**: (deleted_count, failed_count)

##### Mailbox Operations

```python
def get_mailbox_stat() -> Tuple[int, int]
```
Get mailbox statistics.
- **Returns**: (message_count, total_size_bytes)

```python
def get_message_size(message_id: int) -> int
```
Get size of a specific message.
- **Returns**: Size in bytes, or -1 if error

```python
def reset() -> bool
```
Reset mailbox (undo pending deletions).
- **Important**: Must call before disconnect to preserve deletions
- **Returns**: True if successful

```python
def get_capabilities() -> List[str]
```
Get server capabilities.
- **Returns**: List of capability strings
- **Example**: ['STLS', 'SASL PLAIN', 'RESP-CODES']

```python
def test_connection() -> bool
```
Test connection validity.
- **Returns**: True if connected and responding
- **Usage**: Health check before operations

##### Context Manager

```python
with POP3ProtocolHandler(...) as handler:
    messages = handler.fetch_messages()
```
Automatic connection cleanup on exit.

### POP3ConnectionPool

Thread-safe connection pool for concurrent operations.

```python
pool = POP3ConnectionPool(
    hostname='pop.gmail.com',
    port=995,
    username='user@gmail.com',
    password='password',
    pool_size=3
)
```

#### Methods

```python
def acquire() -> Optional[POP3ProtocolHandler]
```
Get connection from pool.
- **Returns**: Handler or None if pool exhausted
- **Auto-Connect**: Connection prepared before return

```python
def release(handler: POP3ProtocolHandler)
```
Return connection to pool.
- **Auto-Reset**: Mailbox reset before release
- **Idempotent**: Safe to release already-released connections

```python
def close_all()
```
Close all connections in pool.
- **Usage**: Cleanup on shutdown

### Exception Classes

```python
class POP3ConnectionError(Exception)
```
Raised when connection operations fail.

```python
class POP3AuthenticationError(Exception)
```
Raised when authentication fails.

## Usage Examples

### Basic Message Retrieval

```python
from src.handlers.pop3 import POP3ProtocolHandler

handler = POP3ProtocolHandler(
    hostname='pop.gmail.com',
    port=995,
    username='user@gmail.com',
    password='password'
)

try:
    handler.connect()
    handler.authenticate()

    # List messages
    message_ids, total_size = handler.list_messages()
    print(f'Found {len(message_ids)} messages, {total_size} bytes total')

    # Fetch specific message
    message = handler.fetch_message(1)
    print(f'Subject: {message["subject"]}')
    print(f'From: {message["from"]}')
    print(f'Body: {message["textBody"]}')

finally:
    handler.disconnect()
```

### Context Manager (Recommended)

```python
with POP3ProtocolHandler('pop.gmail.com', 995, 'user@gmail.com', 'password') as handler:
    handler.authenticate()

    # Fetch all messages
    messages = handler.fetch_messages()
    for msg in messages:
        print(f'{msg["subject"]} from {msg["from"]}')
```

### Connection Pooling

```python
from src.handlers.pop3 import POP3ConnectionPool

pool = POP3ConnectionPool('pop.gmail.com', 995, 'user@gmail.com', 'password', pool_size=5)

# Acquire connection
handler = pool.acquire()
if handler:
    try:
        handler.authenticate()
        messages = handler.fetch_messages()
    finally:
        pool.release(handler)

# Cleanup
pool.close_all()
```

### Error Handling

```python
from src.handlers.pop3 import (
    POP3ProtocolHandler,
    POP3ConnectionError,
    POP3AuthenticationError
)

try:
    handler = POP3ProtocolHandler('pop.gmail.com', 995, 'user', 'pass')
    handler.connect()
    handler.authenticate()
except POP3ConnectionError as e:
    print(f'Connection failed: {e}')
except POP3AuthenticationError as e:
    print(f'Authentication failed: {e}')
```

## Message Data Structure

```python
{
    # Identifiers
    'messageId': 1,  # POP3 message ID (1-based)
    'popId': 1,  # Same as messageId
    'messageIdHeader': '<msg@example.com>',  # Message-ID header

    # Recipients
    'from': 'sender@example.com',
    'to': ['recipient@example.com'],
    'cc': ['cc@example.com'],
    'bcc': [],  # Empty - POP3 doesn't provide BCC info

    # Content
    'subject': 'Email Subject',
    'textBody': 'Plain text content',
    'htmlBody': '<html>HTML content</html>',

    # Metadata
    'receivedAt': 1674476400000,  # Milliseconds timestamp
    'size': 1234,  # Bytes
    'attachmentCount': 2,
    'attachments': [
        {
            'filename': 'document.pdf',
            'contentType': 'application/pdf',
            'size': 50000
        }
    ],

    # Flags (always False for POP3)
    'isRead': False,
    'isStarred': False,
    'isDeleted': False,
    'isSpam': False,
    'isDraft': False,
    'isSent': False
}
```

## Configuration

### Encryption Options

```python
# SSL/TLS (port 995 - recommended)
handler = POP3ProtocolHandler(
    'pop.gmail.com', 995,
    'user@gmail.com', 'password',
    encryption='ssl'  # POP3_SSL
)

# STARTTLS (port 110)
handler = POP3ProtocolHandler(
    'mail.example.com', 110,
    'user@example.com', 'password',
    encryption='tls'  # Plain POP3 + STARTTLS
)

# No encryption (not recommended - insecure)
handler = POP3ProtocolHandler(
    'mail.internal', 110,
    'user', 'password',
    encryption='none'  # Plain POP3
)
```

### Common Server Configurations

#### Gmail

```python
hostname = 'pop.gmail.com'
port = 995
encryption = 'ssl'
username = 'your-email@gmail.com'
password = 'your-app-password'  # Use app-specific password
```

#### Outlook/Hotmail

```python
hostname = 'outlook.office365.com'
port = 995
encryption = 'ssl'
username = 'your-email@outlook.com'
password = 'your-password'
```

#### Generic IMAP Server

```python
hostname = 'mail.example.com'
port = 995  # or 110 for plain
encryption = 'ssl'  # or 'tls' or 'none'
username = 'user@example.com'
password = 'password'
```

## Integration with Email Service

### Routes Integration

```python
from src.handlers.pop3 import POP3ProtocolHandler

@app.route('/api/pop3/sync', methods=['POST'])
def sync_pop3():
    """Sync emails via POP3"""
    account_id = request.json['accountId']
    credentials = get_account_credentials(account_id)

    with POP3ProtocolHandler(
        credentials['hostname'],
        credentials['port'],
        credentials['username'],
        credentials['password']
    ) as handler:
        handler.authenticate()
        messages = handler.fetch_messages()

    # Save to database
    for msg in messages:
        save_email_message(account_id, msg)

    return {'synced': len(messages)}
```

### Celery Background Jobs

```python
from celery import shared_task
from src.handlers.pop3 import POP3ProtocolHandler

@shared_task
def sync_pop3_account(account_id: int):
    """Background job to sync POP3 account"""
    account = get_account(account_id)

    with POP3ProtocolHandler(
        account.hostname,
        account.port,
        account.username,
        decrypt(account.password)
    ) as handler:
        handler.authenticate()
        message_ids, total_size = handler.list_messages()

        for msg_id in message_ids:
            message = handler.fetch_message(msg_id)
            if message:
                save_email_message(account_id, message)
                handler.delete_message(msg_id)

    return {'synced': len(message_ids)}
```

## Known Limitations

1. **No Folder Support**: POP3 only supports a single mailbox
2. **No Flags**: Cannot mark as read/unread/starred
3. **Concurrent Access**: Mailbox is locked during session
4. **Message ID Volatility**: IDs only valid within session
5. **No UID Support**: Cannot track messages across sessions reliably
6. **Partial UIDL**: Some servers support UIDL extension (must be implemented separately)

## Testing

### Unit Tests

```bash
python -m pytest tests/test_pop3_handler.py -v
```

### Test Coverage

- Connection management (success, failure, retry)
- Authentication (valid, invalid, custom credentials)
- Message operations (list, fetch single, fetch multiple, delete)
- Mailbox operations (stat, reset, capabilities)
- Error handling and exceptions
- Context manager usage
- Connection pool (acquire, release, exhaustion)

### Mock Usage

```python
from unittest.mock import Mock, patch

@patch('src.handlers.pop3.POP3_SSL')
def test_fetch_message(mock_pop3_ssl):
    mock_client = Mock()
    mock_client.retr.return_value = ('+OK', [
        b'From: sender@example.com',
        b'Subject: Test',
        b'',
        b'Body'
    ], 100)

    mock_pop3_ssl.return_value = mock_client
    handler = POP3ProtocolHandler(...)
    handler.connect()
    message = handler.fetch_message(1)

    assert message['from'] == 'sender@example.com'
```

## Performance Considerations

1. **Connection Pooling**: Use pool for high-volume operations
2. **Batch Operations**: Fetch multiple messages in single session
3. **Selective Sync**: Track downloaded messages locally (UIDL)
4. **Cleanup**: Always call disconnect() or use context manager
5. **Timeout**: Adjust based on network conditions (default 30s)

## Security Considerations

1. **Credentials Storage**: Store encrypted in database
2. **App Passwords**: Use app-specific passwords, not user passwords
3. **TLS/SSL**: Always use encryption='ssl' for port 995
4. **Session Handling**: Don't store credentials in memory longer than needed
5. **Connection Pool**: Limit pool size based on memory/connections available

## Migration from IMAP

If migrating from IMAP to POP3:

1. **No folder sync**: All emails in single mailbox
2. **No incremental sync**: Must track message IDs externally (UIDL)
3. **Always mark for deletion**: POP3 users often keep copies on server
4. **No flags**: Implement custom flag tracking in database
5. **Session-based IDs**: Cannot rely on persistent message IDs

## Dependencies

- Python 3.8+
- `poplib` (stdlib)
- `email` (stdlib) - for parsing RFC 5322 messages
- `cryptography` (optional) - for encrypted password storage

## Files

| File | Purpose |
|------|---------|
| `src/handlers/pop3.py` | Main implementation |
| `tests/test_pop3_handler.py` | Comprehensive test suite |
| `src/handlers/__init__.py` | Module exports |
| `POP3_HANDLER.md` | This documentation |

## Related

- [IMAP Handler](IMAP_HANDLER.md)
- [SMTP Handler](SMTP_HANDLER.md)
- [Email Service README](../README.md)
- [RFC 1939 - POP3 Specification](https://tools.ietf.org/html/rfc1939)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-24 | Initial implementation |
| | | - POP3ProtocolHandler class |
| | | - Connection pool support |
| | | - Error recovery with retry logic |
| | | - Comprehensive test suite |
| | | - Context manager support |
