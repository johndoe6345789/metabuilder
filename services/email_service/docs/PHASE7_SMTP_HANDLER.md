# Phase 7: SMTP Protocol Handler

**Status**: ✅ Complete
**Created**: January 24, 2026
**Location**: `src/handlers/smtp.py`
**Tests**: `tests/test_smtp_handler.py` (50+ tests)

## Overview

Phase 7 implements a production-grade SMTP protocol handler with:
- **Connection pooling** for efficient resource management
- **TLS/SSL encryption** (explicit STARTTLS and implicit SSL)
- **Comprehensive message validation** (RFC 5321 email format, size limits)
- **Automatic retry logic** with exponential backoff
- **Error classification** (retryable vs permanent failures)
- **Delivery status tracking** with message IDs and recipient failures
- **Thread-safe operations** with lock management
- **Full MIME support** (multipart, attachments, HTML/plain text)

## Core Components

### 1. SMTPEncryption Enum

Defines encryption modes for SMTP connections:

```python
class SMTPEncryption(Enum):
    NONE = "none"              # Plain text (port 25)
    STARTTLS = "tls"           # Explicit TLS (port 587)
    IMPLICIT_SSL = "ssl"       # Implicit SSL (port 465)
```

### 2. SMTPDeliveryStatus Enum

Tracks message delivery outcomes:

```python
class SMTPDeliveryStatus(Enum):
    SUCCESS = "success"         # Message sent successfully
    FAILED = "failed"          # Permanent failure
    RETRY = "retry"            # Should retry
    INVALID = "invalid"        # Message validation failed
    REJECTED = "rejected"      # Recipients/sender rejected
    TEMP_FAILED = "temp_failed"  # Temporary failure (retryable)
```

### 3. DeliveryResult Dataclass

Encapsulates send operation results:

```python
@dataclass
class DeliveryResult:
    status: SMTPDeliveryStatus
    message_id: Optional[str]        # RFC 5322 Message-ID
    smtp_code: Optional[int]         # SMTP response code
    smtp_error: Optional[str]        # SMTP error message
    recipient_failures: Dict[str, str]  # Per-recipient errors
    sent_at: Optional[datetime]
    retry_count: int = 0             # Number of retries
    is_retryable: bool = False       # Can be retried

    def to_dict(self) -> Dict[str, Any]:
        """Serialize for API responses"""
```

### 4. SMTPMessageValidator

Validates messages before sending with comprehensive checks:

#### Email Address Validation

Valid emails: user@example.com, test.user@example.co.uk, user+tag@sub.example.com

Invalid emails (rejected): user@example (missing TLD), @example.com (missing local part), user@@example.com (multiple @)

#### Validation Methods

```python
is_valid, error = SMTPMessageValidator.validate_email_address(email)
is_valid, error = SMTPMessageValidator.validate_recipients(to, cc, bcc)
is_valid, error = SMTPMessageValidator.validate_subject(subject)
is_valid, error = SMTPMessageValidator.validate_body(text_body, html_body)
is_valid, error = SMTPMessageValidator.validate_attachments(attachments)
is_valid, error = SMTPMessageValidator.validate_message(...)
```

#### Size Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| Email address | 254 chars | RFC 5321 |
| Subject | 998 chars | RFC 5322 |
| Body (text/HTML) | 100 MB | Per type |
| Single attachment | 25 MB | Common server limit |
| Total attachments | 100 MB | Safety margin |
| Recipients | 100 | To+CC+BCC combined |
| Local part | 64 chars | RFC 5321 |

### 5. SMTPConnectionPool

Manages connections with automatic cleanup:

```python
pool = SMTPConnectionPool(max_connections=10, idle_timeout=300, stale_timeout=3600)
conn = pool.get_connection(host, port, user, pass, encryption)
pool.release_connection(host, port, conn)
pool.close_all()
stats = pool.get_stats()
```

### 6. SMTPProtocolHandler

Main API for SMTP operations:

```python
handler = SMTPProtocolHandler(
    hostname='smtp.gmail.com',
    port=587,
    username='user@gmail.com',
    password='password',
    encryption='tls',
    from_address='sender@gmail.com',
    pool_size=10
)

success = handler.connect()
success = handler.test_connection()
success = handler.authenticate()

result = handler.send_message(
    to_addresses=['recipient@example.com'],
    subject='Hello',
    text_body='Body',
    retry=True
)

handler.close()
```

## Retry Logic

Automatic retry with exponential backoff:

```
MAX_RETRIES = 3
RETRY_DELAYS = [1, 5, 30]  # seconds

Retryable codes: 421, 450, 451, 452
```

## Usage Examples

### Basic Send

```python
from src.handlers.smtp import SMTPProtocolHandler, SMTPDeliveryStatus

handler = SMTPProtocolHandler(
    hostname='smtp.gmail.com',
    port=587,
    username='account@gmail.com',
    password='password',
    encryption='tls'
)

if not handler.connect():
    print("Failed to connect")
    exit(1)

result = handler.send_message(
    to_addresses=['recipient@example.com'],
    subject='Hello',
    text_body='Welcome!'
)

if result.status == SMTPDeliveryStatus.SUCCESS:
    print(f"Sent: {result.message_id}")
else:
    print(f"Failed: {result.smtp_error}")

handler.close()
```

### With Attachments

```python
import base64

with open('document.pdf', 'rb') as f:
    pdf_data = base64.b64encode(f.read()).decode()

result = handler.send_message(
    to_addresses=['recipient@example.com'],
    subject='Document',
    text_body='See attached',
    attachments=[
        {
            'filename': 'document.pdf',
            'contentType': 'application/pdf',
            'data': pdf_data
        }
    ]
)
```

### With HTML

```python
result = handler.send_message(
    to_addresses=['recipient@example.com'],
    subject='Newsletter',
    text_body='Text version',
    html_body='<html><body><h1>HTML version</h1></body></html>'
)
```

## API Reference

### send_message() Parameters

```python
send_message(
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
) -> DeliveryResult
```

## Testing

### Run Tests

```bash
pytest tests/test_smtp_handler.py -v
pytest tests/test_smtp_handler_standalone.py -v
```

### Test Coverage

- 50+ tests for all components
- Message validation (email, recipients, subject, body, attachments)
- Connection pool (create, reuse, cleanup)
- Protocol handler (connect, auth, send with retries)
- Error handling (SMTP, socket, retryable/non-retryable)
- Delivery results (serialization, status tracking)

## Integration

### Flask Routes

```python
from src.handlers.smtp import SMTPProtocolHandler, SMTPDeliveryStatus

handler = SMTPProtocolHandler(
    hostname=data['hostname'],
    port=data['port'],
    username=data['username'],
    password=data['password'],
    encryption=data.get('encryption', 'tls')
)

result = handler.send_message(
    to_addresses=data['to'],
    subject=data['subject'],
    text_body=data.get('text_body'),
    html_body=data.get('html_body'),
    attachments=data.get('attachments')
)

handler.close()
```

### Celery Tasks

```python
@shared_task
def send_email_async(hostname, port, username, password, encryption, to_addresses, subject, text_body):
    handler = SMTPProtocolHandler(
        hostname=hostname,
        port=port,
        username=username,
        password=password,
        encryption=encryption
    )

    result = handler.send_message(
        to_addresses=to_addresses,
        subject=subject,
        text_body=text_body,
        retry=True
    )

    handler.close()
    return result.to_dict()
```

## Performance

- First send: ~500ms-1s (connect + auth)
- Subsequent: ~100-200ms (pooled connection)
- Memory: ~1-2 MB per pooled connection
- Thread-safe with RLock protection

## References

- RFC 5321 - SMTP
- RFC 5322 - Internet Message Format
- Python smtplib documentation
