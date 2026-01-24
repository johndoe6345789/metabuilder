# POP3 Protocol Handler - Quick Reference

## Import

```python
from src.handlers.pop3 import (
    POP3ProtocolHandler,
    POP3ConnectionPool,
    POP3ConnectionError,
    POP3AuthenticationError
)
```

## Basic Usage

### Connect & Fetch Messages

```python
with POP3ProtocolHandler('pop.gmail.com', 995, 'user@gmail.com', 'password') as handler:
    handler.authenticate()
    messages = handler.fetch_messages()
    for msg in messages:
        print(f"{msg['subject']} from {msg['from']}")
```

### List Messages

```python
handler = POP3ProtocolHandler('pop.gmail.com', 995, 'user@gmail.com', 'password')
handler.connect()
handler.authenticate()
message_ids, total_size = handler.list_messages()
print(f"Found {len(message_ids)} messages, {total_size} bytes")
handler.disconnect()
```

### Fetch Specific Message

```python
with POP3ProtocolHandler('pop.gmail.com', 995, 'user@gmail.com', 'password') as h:
    h.authenticate()
    message = h.fetch_message(1)
    print(f"Subject: {message['subject']}")
    print(f"Body: {message['textBody']}")
    print(f"Attachments: {message['attachmentCount']}")
```

### Delete Messages

```python
with POP3ProtocolHandler('pop.gmail.com', 995, 'user@gmail.com', 'password') as h:
    h.authenticate()
    deleted, failed = h.delete_messages([1, 2, 3])
    print(f"Deleted {deleted}, Failed {failed}")
```

### Connection Pooling

```python
pool = POP3ConnectionPool('pop.gmail.com', 995, 'user@gmail.com', 'password', pool_size=5)

handler = pool.acquire()
if handler:
    try:
        handler.authenticate()
        messages = handler.fetch_messages()
    finally:
        pool.release(handler)

pool.close_all()
```

## Error Handling

```python
from src.handlers.pop3 import POP3ProtocolHandler, POP3ConnectionError, POP3AuthenticationError

try:
    handler = POP3ProtocolHandler('pop.gmail.com', 995, 'user@gmail.com', 'password')
    handler.connect()
    handler.authenticate()
    messages = handler.fetch_messages()
except POP3ConnectionError as e:
    print(f"Connection failed: {e}")
except POP3AuthenticationError as e:
    print(f"Authentication failed: {e}")
finally:
    handler.disconnect()
```

## Common Servers

### Gmail
```python
handler = POP3ProtocolHandler(
    'pop.gmail.com',
    995,
    'your-email@gmail.com',
    'app-password'  # Use app-specific password
)
```

### Outlook
```python
handler = POP3ProtocolHandler(
    'outlook.office365.com',
    995,
    'your-email@outlook.com',
    'password'
)
```

### Generic IMAP Server
```python
handler = POP3ProtocolHandler(
    'mail.example.com',
    995,  # or 110 for plain
    'user@example.com',
    'password',
    encryption='ssl'  # or 'tls' or 'none'
)
```

## API Reference

### POP3ProtocolHandler Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `connect()` | - | bool | Connect to server (auto-retry 3x) |
| `authenticate()` | user?, pass? | bool | Authenticate with server |
| `disconnect()` | - | bool | Gracefully disconnect |
| `list_messages()` | - | (ids, size) | Get all message IDs and total size |
| `fetch_message(id)` | message_id | dict | Fetch single message |
| `fetch_messages(ids?)` | message_ids? | [dict] | Fetch multiple messages |
| `delete_message(id)` | message_id | bool | Mark message for deletion |
| `delete_messages(ids)` | message_ids | (del, fail) | Delete multiple messages |
| `get_mailbox_stat()` | - | (count, size) | Get mailbox statistics |
| `get_message_size(id)` | message_id | int | Get message size in bytes |
| `reset()` | - | bool | Undo pending deletions |
| `get_capabilities()` | - | [str] | Get server capabilities |
| `test_connection()` | - | bool | Test connection validity |

### Context Manager

```python
with POP3ProtocolHandler(...) as handler:
    # Use handler
    pass
# Auto disconnect
```

## Configuration

### Encryption Options

```python
# SSL (port 995)
encryption='ssl'

# STARTTLS (port 110)
encryption='tls'

# No encryption (not recommended)
encryption='none'
```

### Initialization Parameters

```python
POP3ProtocolHandler(
    hostname,                    # str: POP3 server
    port,                       # int: Server port
    username,                   # str: Login username
    password,                   # str: Login password
    encryption='ssl',           # str: 'ssl', 'tls', or 'none'
    timeout=30                  # int: Connection timeout (seconds)
)
```

## Message Structure

```python
{
    'messageId': 1,
    'from': 'sender@example.com',
    'to': ['recipient@example.com'],
    'cc': ['cc@example.com'],
    'subject': 'Email Subject',
    'textBody': 'Plain text body',
    'htmlBody': '<html>HTML body</html>',
    'receivedAt': 1674476400000,  # milliseconds
    'size': 1234,
    'attachmentCount': 2,
    'attachments': [
        {'filename': 'doc.pdf', 'contentType': 'application/pdf', 'size': 50000}
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

## POP3 Limitations

1. **No Folders**: Single mailbox only
2. **No Flags**: Cannot mark read/unread/starred
3. **No Concurrent Access**: One session per account
4. **Message ID Volatility**: IDs change each session
5. **Limited Metadata**: Only basic headers available

## Connection Pool API

```python
pool = POP3ConnectionPool(hostname, port, username, password, pool_size=3)

# Acquire connection
handler = pool.acquire()

if handler:
    handler.authenticate()
    # Use handler
    pool.release(handler)

# Cleanup
pool.close_all()
```

## Examples

### Sync All Emails to Database

```python
def sync_pop3_account(account_id):
    account = get_account(account_id)

    with POP3ProtocolHandler(
        account.hostname,
        account.port,
        account.username,
        decrypt(account.password)
    ) as handler:
        handler.authenticate()
        messages = handler.fetch_messages()

        for msg in messages:
            save_to_database(account_id, msg)

        return len(messages)
```

### Check for New Messages

```python
def check_new_emails(hostname, port, username, password):
    with POP3ProtocolHandler(hostname, port, username, password) as h:
        h.authenticate()
        ids, total_size = h.list_messages()

        return {
            'count': len(ids),
            'total_size': total_size,
            'first_message': h.fetch_message(ids[0]) if ids else None
        }
```

### Archive Old Emails

```python
def archive_emails(handler, days=30):
    handler.authenticate()
    messages = handler.fetch_messages()

    cutoff = datetime.now() - timedelta(days=days)
    to_delete = [
        msg['messageId'] for msg in messages
        if datetime.fromtimestamp(msg['receivedAt']/1000) < cutoff
    ]

    deleted, failed = handler.delete_messages(to_delete)
    return {'deleted': deleted, 'failed': failed}
```

## Troubleshooting

### Connection Timeout
```python
# Increase timeout for slow networks
handler = POP3ProtocolHandler(..., timeout=60)
```

### Authentication Failed
```python
# Use app-specific password for Gmail/Outlook
# Check username/password format for your server
```

### Cannot Delete Messages
```python
# Calling disconnect() or quitting context commits deletions
# Call reset() before disconnect() to undo
handler.reset()
```

### Large Message Handling
```python
# Fetch messages individually to manage memory
for msg_id in message_ids:
    msg = handler.fetch_message(msg_id)
    process_message(msg)
```

## Testing

```python
python3 -m pytest tests/test_pop3_handler.py -v
```

## Files

- Implementation: `src/handlers/pop3.py`
- Tests: `tests/test_pop3_handler.py`
- Documentation: `src/handlers/POP3_HANDLER.md`
- Module exports: `src/handlers/__init__.py`
