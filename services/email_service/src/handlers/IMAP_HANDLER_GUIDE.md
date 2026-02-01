# Phase 7 - IMAP Protocol Handler

Production-grade IMAP4 protocol handler with connection pooling, IDLE support, UID tracking, and comprehensive error handling.

**Status**: Phase 7 Complete
**Version**: 1.0.0

## Overview

The IMAP Protocol Handler provides a comprehensive, thread-safe implementation of the IMAP4 protocol with:

- **Connection Pooling**: Multi-connection support with configurable pool sizes
- **IDLE Support**: Real-time email notifications with `IDLE` mode
- **UID Validity Tracking**: Maintains stable message UIDs across sessions
- **Error Handling & Retry Logic**: Automatic retry with exponential backoff
- **Structured Data**: Type-safe message and folder representations
- **Thread Safety**: All operations protected by locks

## Architecture

### Class Hierarchy

```
IMAPProtocolHandler (Public API)
├── IMAPConnectionPool (Connection management)
│   └── IMAPConnection (Single connection)
│       ├── IMAPConnectionState (Enum)
│       ├── IMAPConnectionConfig (Config)
│       └── [Thread: IDLE listener]
├── IMAPFolder (Data structure)
├── IMAPMessage (Data structure)
└── IMAPConnectionConfig (Configuration)
```

### Connection States

```
DISCONNECTED ──────┐
                   ├──→ CONNECTING ──→ AUTHENTICATED ──→ SELECTED
                   │                        ↓
                   └────────────────────── IDLE ←──────┘
                                             ↓
                                           ERROR
```

## Quick Start

### Basic Usage

```python
from src.handlers.imap import IMAPProtocolHandler, IMAPConnectionConfig

# Create handler
handler = IMAPProtocolHandler()

# Create config
config = IMAPConnectionConfig(
    hostname="imap.gmail.com",
    port=993,
    username="user@gmail.com",
    password="app-password",
    encryption="tls",
)

# Connect and list folders
if handler.connect(**config.__dict__):
    folders = handler.list_folders(config)
    for folder in folders:
        print(f"{folder.display_name}: {folder.total_count} messages")

# Fetch messages
messages = handler.fetch_messages(config, "INBOX")
for msg in messages:
    print(f"{msg.subject} from {msg.from_addr}")

# Mark as read
handler.mark_as_read(config, messages[0].uid)

# Clean up
handler.disconnect()
```

### Connection Pooling

```python
from src.handlers.imap import IMAPConnectionPool, IMAPConnectionConfig

# Create pool with 5 connections per account
pool = IMAPConnectionPool(max_connections_per_account=5)

# Get connection (reuses if available)
config = IMAPConnectionConfig(...)
with pool.pooled_connection(config) as conn:
    conn.list_folders()
    # Connection automatically released back to pool

# Connection pool is reused on next call
with pool.pooled_connection(config) as conn:
    folders = conn.list_folders()  # Reuses previous connection

# Clean up
pool.clear_pool()
```

### IDLE Mode (Real-time Notifications)

```python
def on_new_message(response):
    """Callback for new messages"""
    print(f"New message: {response}")

# Start IDLE mode
handler.start_idle(config, callback=on_new_message)

# IDLE runs in background thread
# Messages appear in callback in real-time

# Stop IDLE when done
handler.stop_idle(config)
```

### Message Searching

```python
# Search for unread messages
uids = handler.search(config, "INBOX", "UNSEEN")

# Search for messages from specific sender
uids = handler.search(config, "INBOX", 'FROM "sender@example.com"')

# Search for messages before date
uids = handler.search(config, "INBOX", 'BEFORE 01-Jan-2026')

# Advanced: combine multiple criteria
uids = handler.search(config, "INBOX", 'FROM "sender@example.com" UNSEEN')
```

## API Reference

### IMAPProtocolHandler

High-level handler for IMAP operations.

#### Methods

##### `connect(hostname, port, username, password, encryption="tls", timeout=30) → bool`

Connect to IMAP server.

**Args:**
- `hostname` (str): Server hostname (e.g., "imap.gmail.com")
- `port` (int): Server port (993 for TLS, 143 for STARTTLS)
- `username` (str): Email address or username
- `password` (str): Password or app-specific password
- `encryption` (str): "tls", "starttls", or "none"
- `timeout` (int): Connection timeout in seconds

**Returns:** `bool` - True if connected successfully

**Example:**
```python
handler = IMAPProtocolHandler()
success = handler.connect(
    hostname="imap.gmail.com",
    port=993,
    username="user@gmail.com",
    password="password",
    encryption="tls",
)
```

##### `authenticate(config: IMAPConnectionConfig) → bool`

Authenticate connection.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration

**Returns:** `bool` - True if authenticated

##### `list_folders(config: IMAPConnectionConfig) → List[IMAPFolder]`

List all folders on server.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration

**Returns:** `List[IMAPFolder]` - List of folder objects

**Example:**
```python
folders = handler.list_folders(config)
for folder in folders:
    print(f"{folder.display_name}")
    print(f"  Type: {folder.folder_type}")
    print(f"  Selectable: {folder.is_selectable}")
    print(f"  Messages: {folder.total_count}")
```

##### `fetch_messages(config, folder_name, start_uid=None) → List[IMAPMessage]`

Fetch messages from folder.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `folder_name` (str): Folder name (e.g., "INBOX")
- `start_uid` (Optional[int]): Starting UID for incremental fetch

**Returns:** `List[IMAPMessage]` - List of message objects

**Example:**
```python
# Fetch all messages
messages = handler.fetch_messages(config, "INBOX")

# Incremental fetch (UID > 100)
messages = handler.fetch_messages(config, "INBOX", start_uid=100)

for msg in messages:
    print(f"UID: {msg.uid}")
    print(f"From: {msg.from_addr}")
    print(f"Subject: {msg.subject}")
    print(f"Unread: {not msg.is_read}")
```

##### `search(config, folder_name, criteria="ALL") → List[int]`

Search for messages by criteria.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `folder_name` (str): Folder name to search
- `criteria` (str): IMAP search criteria

**Returns:** `List[int]` - UIDs matching criteria

**Search Criteria:**
- `ALL` - All messages
- `UNSEEN` - Unread messages
- `SEEN` - Read messages
- `FLAGGED` - Starred messages
- `UNFLAGGED` - Unstarred messages
- `FROM "sender@example.com"` - From specific sender
- `TO "recipient@example.com"` - To specific recipient
- `SUBJECT "keyword"` - Subject contains keyword
- `BEFORE 01-Jan-2026` - Before date
- `SINCE 01-Jan-2026` - After date
- `ANSWERED` - Messages with replies
- `DELETED` - Deleted messages

**Example:**
```python
# Unread
uids = handler.search(config, "INBOX", "UNSEEN")

# From sender
uids = handler.search(config, "INBOX", 'FROM "john@example.com"')

# Combine criteria
uids = handler.search(config, "INBOX", 'FROM "john@example.com" UNSEEN')
```

##### `mark_as_read(config, uid, folder_name=None) → bool`

Mark message as read.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `uid` (int): Message UID
- `folder_name` (Optional[str]): Folder name (auto-selected if provided)

**Returns:** `bool` - True if successful

##### `mark_as_unread(config, uid, folder_name=None) → bool`

Mark message as unread.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `uid` (int): Message UID
- `folder_name` (Optional[str]): Folder name

**Returns:** `bool` - True if successful

##### `add_star(config, uid, folder_name=None) → bool`

Add star to message.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `uid` (int): Message UID
- `folder_name` (Optional[str]): Folder name

**Returns:** `bool` - True if successful

##### `remove_star(config, uid, folder_name=None) → bool`

Remove star from message.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `uid` (int): Message UID
- `folder_name` (Optional[str]): Folder name

**Returns:** `bool` - True if successful

##### `start_idle(config, callback=None) → bool`

Start IDLE mode for real-time notifications.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `callback` (Optional[Callable]): Callback function for notifications

**Returns:** `bool` - True if IDLE started

**Callback Signature:**
```python
def callback(response: bytes):
    """Process IDLE response"""
    print(f"IDLE Response: {response}")
```

##### `stop_idle(config) → bool`

Stop IDLE mode.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration

**Returns:** `bool` - True if IDLE stopped

##### `get_uid_validity(config, folder_name) → int`

Get UID validity for folder (for message stability).

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration
- `folder_name` (str): Folder name

**Returns:** `int` - UID validity value

##### `disconnect() → None`

Disconnect all connections.

### IMAPConnectionPool

Connection pooling for multiple accounts.

#### Methods

##### `get_connection(config: IMAPConnectionConfig) → IMAPConnection`

Get or create connection from pool.

**Args:**
- `config` (IMAPConnectionConfig): Connection configuration

**Returns:** `IMAPConnection` - Connection object

##### `release_connection(connection: IMAPConnection) → None`

Release connection back to pool.

**Args:**
- `connection` (IMAPConnection): Connection to release

##### `clear_pool(account_id: Optional[str] = None) → None`

Clear pool.

**Args:**
- `account_id` (Optional[str]): Specific account to clear (None = clear all)

##### `pooled_connection(config: IMAPConnectionConfig)`

Context manager for pooled connections.

**Example:**
```python
pool = IMAPConnectionPool()

with pool.pooled_connection(config) as conn:
    folders = conn.list_folders()
```

### IMAPConnectionConfig

Configuration dataclass.

**Fields:**
- `hostname` (str): Server hostname
- `port` (int): Server port
- `username` (str): Username
- `password` (str): Password
- `encryption` (str): "tls", "starttls", or "none" (default: "tls")
- `timeout` (int): Connection timeout in seconds (default: 30)
- `idle_timeout` (int): IDLE timeout in seconds (default: 900)
- `max_retries` (int): Connection retry attempts (default: 3)
- `retry_delay` (int): Delay between retries (default: 5 seconds)
- `connection_id` (str): Connection identifier (auto-generated)

### IMAPFolder

Folder data structure.

**Fields:**
- `name` (str): Raw folder name (e.g., "[Gmail]/Sent Mail")
- `display_name` (str): Human-readable name (e.g., "Sent Mail")
- `folder_type` (str): "inbox", "sent", "drafts", "trash", "spam", "archive", "custom"
- `flags` (List[str]): IMAP flags (e.g., ["\HasNoChildren", "\Sent"])
- `is_selectable` (bool): Can select this folder
- `delimiter` (Optional[str]): Folder hierarchy delimiter (e.g., "/")
- `unread_count` (int): Unread message count (default: 0)
- `total_count` (int): Total message count (default: 0)
- `uid_validity` (int): UID validity value (default: 0)

### IMAPMessage

Message data structure.

**Fields:**
- `uid` (int): Unique IMAP UID
- `folder` (str): Folder containing message
- `message_id` (str): RFC 5322 Message-ID
- `from_addr` (str): Sender email address
- `to_addrs` (List[str]): Recipients
- `cc_addrs` (List[str]): CC recipients
- `bcc_addrs` (List[str]): BCC recipients
- `subject` (str): Email subject
- `text_body` (str): Plain text body
- `html_body` (str): HTML body
- `received_at` (int): Timestamp in milliseconds
- `is_read` (bool): Read status
- `is_starred` (bool): Star status
- `is_deleted` (bool): Deleted status
- `is_spam` (bool): Spam status
- `is_draft` (bool): Draft status
- `is_sent` (bool): Sent status
- `attachment_count` (int): Number of attachments
- `size` (int): Message size in bytes
- `flags` (Set[str]): IMAP flags

## Error Handling

All methods handle errors gracefully with logging.

### Common Errors

| Error | Cause | Handling |
|-------|-------|----------|
| Connection refused | Server not responding | Retries with exponential backoff |
| Authentication failed | Invalid credentials | Returns False |
| Timeout | Slow network | Retries up to max_retries |
| DNS resolution failed | Invalid hostname | Retries with backoff |
| Folder not found | Invalid folder name | Returns empty list/None |
| Search failed | Invalid search criteria | Returns empty list |

### Logging

All operations are logged with connection ID for debugging:

```
[imap.gmail.com:user@gmail.com#0] Connected to imap.gmail.com
[imap.gmail.com:user@gmail.com#0] Selected INBOX: 42 messages
[imap.gmail.com:user@gmail.com#0] IDLE mode started
```

## Performance Considerations

### Connection Pooling

- Default: 3 connections per account
- Connections reused if active (< 5 minutes)
- Semaphore prevents exceeding max connections
- Stale connections cleaned up automatically

### IDLE Mode

- Runs in background thread
- Default timeout: 15 minutes
- Auto-restarts on timeout
- CPU-efficient event-based monitoring

### UID Stability

- UIDs cached per folder
- Tracked via UIDVALIDITY
- Enables safe incremental syncs
- Persists across reconnects

### Memory Usage

- Lazy message parsing (only fetched when needed)
- Connection pooling reduces memory overhead
- IDLE uses minimal resources when idle

## Thread Safety

All operations are thread-safe:

- Connection locking with `threading.RLock`
- Pool semaphores prevent overload
- IDLE listener runs in separate thread
- Context managers handle cleanup

## Testing

### Run Tests

```bash
# All tests
pytest tests/test_imap_handler.py -v

# With coverage
pytest tests/test_imap_handler.py --cov=src.handlers.imap

# Specific test class
pytest tests/test_imap_handler.py::TestIMAPConnection -v

# Specific test
pytest tests/test_imap_handler.py::TestIMAPConnection::test_connect_success -v
```

### Test Coverage

- Connection lifecycle (connect, disconnect)
- Authentication (success, failure)
- Folder listing and selection
- Message fetching and parsing
- Search operations
- Flag operations (read, star, etc.)
- IDLE mode
- Connection pooling
- Error handling and recovery
- Thread safety
- Data structure creation

## Integration Examples

### With Flask Route

```python
from flask import Blueprint, request, jsonify
from src.handlers.imap import IMAPProtocolHandler, IMAPConnectionConfig

imap_bp = Blueprint('imap', __name__)
handler = IMAPProtocolHandler()

@imap_bp.route('/folders/<account_id>', methods=['GET'])
def list_folders(account_id):
    """List folders for account"""
    config = IMAPConnectionConfig(
        hostname=request.args.get('hostname'),
        port=int(request.args.get('port')),
        username=request.args.get('username'),
        password=request.args.get('password'),
    )

    folders = handler.list_folders(config)

    return jsonify({
        'folders': [
            {
                'name': f.name,
                'displayName': f.display_name,
                'type': f.folder_type,
                'messageCount': f.total_count,
            }
            for f in folders
        ]
    })

@imap_bp.route('/messages/<account_id>', methods=['GET'])
def get_messages(account_id):
    """Fetch messages from folder"""
    folder = request.args.get('folder', 'INBOX')
    config = IMAPConnectionConfig(...)

    messages = handler.fetch_messages(config, folder)

    return jsonify({
        'messages': [
            {
                'uid': m.uid,
                'from': m.from_addr,
                'subject': m.subject,
                'isRead': m.is_read,
            }
            for m in messages
        ]
    })
```

### With Celery Task

```python
from celery import shared_task
from src.handlers.imap import IMAPProtocolHandler, IMAPConnectionConfig

handler = IMAPProtocolHandler()

@shared_task
def sync_inbox(account_id, hostname, port, username, password):
    """Background task to sync inbox"""
    config = IMAPConnectionConfig(
        hostname=hostname,
        port=port,
        username=username,
        password=password,
    )

    # Get last synced UID
    last_uid = get_last_uid(account_id)

    # Fetch new messages
    messages = handler.fetch_messages(config, 'INBOX', start_uid=last_uid)

    # Store messages in database
    for msg in messages:
        save_message(account_id, msg)

    # Update last UID
    update_last_uid(account_id, max(m.uid for m in messages))

    handler.disconnect()

    return {
        'account_id': account_id,
        'message_count': len(messages),
        'last_uid': max(m.uid for m in messages) if messages else 0,
    }
```

### Multi-Account Sync

```python
from concurrent.futures import ThreadPoolExecutor

def sync_all_accounts(accounts):
    """Sync all accounts in parallel"""
    handler = IMAPProtocolHandler()

    def sync_account(account):
        config = IMAPConnectionConfig(**account)
        messages = handler.fetch_messages(config, 'INBOX')
        save_messages(account['id'], messages)

    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(sync_account, accounts)

    handler.disconnect()
```

## Troubleshooting

### Connection Refused

**Problem:** Cannot connect to server

**Solutions:**
1. Check hostname and port are correct
2. Verify firewall allows IMAP traffic
3. Check SSL certificate validity (if TLS)
4. Enable "Less secure app access" for Gmail

### Authentication Failed

**Problem:** Username or password incorrect

**Solutions:**
1. Verify credentials are correct
2. Use app-specific password for Gmail (2FA enabled)
3. Check for typos in email address
4. Verify account is not locked

### Timeout

**Problem:** Connection times out

**Solutions:**
1. Increase timeout: `timeout=60`
2. Check network connectivity
3. Check server load
4. Try different server port

### IDLE Not Working

**Problem:** IDLE mode fails to start

**Solutions:**
1. Verify server supports IDLE (most do)
2. Check firewall allows persistent connections
3. Ensure previous IDLE is stopped
4. Check for connection timeout

### Out of Memory

**Problem:** Memory usage growing

**Solutions:**
1. Clear connection pool: `handler.pool.clear_pool()`
2. Reduce max_connections_per_account
3. Limit message batch size
4. Stop IDLE mode when not needed

## Security Notes

- Passwords are never logged or stored
- Credentials should be stored encrypted in production
- Use environment variables for sensitive config
- IDLE mode keeps connection open (firewall implications)
- TLS recommended for production
- Validate SMTP relay credentials before use

## Future Enhancements

- [ ] POP3 support
- [ ] Full-text search with full-body indexing
- [ ] Spam filtering with ML
- [ ] Email encryption (PGP/S/MIME)
- [ ] Delegate account support
- [ ] Calendar/contact sync (CalDAV/CardDAV)
- [ ] Batch operations optimization
- [ ] Connection metrics and monitoring
