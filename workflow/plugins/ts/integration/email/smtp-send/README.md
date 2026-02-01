# SMTP Send Workflow Plugin - Phase 6

Sends emails via SMTP with full support for HTML/text alternatives, attachments, and credential integration.

## Features

- **Multi-format emails**: Plain text, HTML, or both (MIME alternatives)
- **Recipients**: To, CC, BCC with comprehensive validation
- **Attachments**: Multiple files with MIME type detection and inline support
- **Security**: SMTP credential entity integration with encrypted passwords
- **Error handling**: Per-recipient delivery failure tracking with retry logic
- **Delivery tracking**: Message ID and queue ID from SMTP server
- **Network resilience**: Exponential backoff retry with configurable attempts
- **Email headers**: Custom headers, reply-to, delivery notifications

## Configuration

### Node Type: `smtp-send`

**Category**: `email-integration`

**Inputs**:

```typescript
interface SMTPSendConfig {
  // Either credentialId OR smtpConfig (not both)
  credentialId?: string;           // UUID of Credential entity with SMTP config
  smtpConfig?: SMTPConfig;         // Inline SMTP configuration

  // SMTP Configuration (if using inline)
  smtpConfig: {
    host: string;                  // SMTP server (e.g., smtp.gmail.com)
    port: number;                  // Port: 587 (TLS), 465 (SSL), 25 (plain)
    username: string;              // SMTP username
    password: string;              // SMTP password (encrypted in Credential)
    encryption: 'tls' | 'ssl' | 'none';  // Connection encryption
    timeout?: number;              // Connection timeout ms (default: 30000)
    retryAttempts?: number;        // Retries on network failure (0-3, default: 2)
  };

  // Email Fields
  from: string;                    // Sender email address (required)
  fromName?: string;               // Sender display name
  to: string[];                    // Recipients (required, at least 1)
  cc?: string[];                   // CC recipients
  bcc?: string[];                  // BCC recipients
  replyTo?: string;                // Reply-To address

  // Content
  subject: string;                 // Email subject (required)
  textBody?: string;               // Plain text body (or htmlBody required)
  htmlBody?: string;               // HTML body (or textBody required)

  // Attachments
  attachments?: EmailAttachment[]; // Array of files to attach

  // Headers and Notifications
  customHeaders?: Record<string, string>;  // Custom email headers
  requestDeliveryNotification?: boolean;   // RFC 1891 DSN
  requestReadReceipt?: boolean;            // Request read receipt
}

interface EmailAttachment {
  filename: string;                // Filename for display
  contentType: string;             // MIME type (e.g., 'application/pdf')
  data: string;                    // Base64-encoded content
  contentId?: string;              // Content-ID for inline images
  inline?: boolean;                // Whether to embed in HTML
}
```

**Outputs**:

```typescript
interface SendResult {
  status: 'sent' | 'partial' | 'failed';  // Delivery status
  messageId?: string;              // SMTP message ID
  sentAt: number;                  // Timestamp
  errors: DeliveryError[];         // Per-recipient failures
  successCount: number;            // Successfully delivered
  failureCount: number;            // Failed recipients
  queueId?: string;                // Mail server queue ID
  smtpCode?: number;               // SMTP response code
  smtpResponse?: string;           // SMTP response message
  shouldRetry: boolean;            // Whether workflow should retry
}

interface DeliveryError {
  recipient: string;
  errorType: 'invalid_address' | 'auth_failed' | 'network_error' | 'send_failed' | 'unknown';
  message: string;
  retryable: boolean;
}
```

## Usage Examples

### Simple Email with Text Body

```json
{
  "id": "send-notification",
  "nodeType": "smtp-send",
  "parameters": {
    "from": "noreply@example.com",
    "fromName": "MyApp",
    "to": ["user@example.com"],
    "subject": "Notification",
    "textBody": "This is a notification",
    "smtpConfig": {
      "host": "smtp.gmail.com",
      "port": 587,
      "username": "bot@gmail.com",
      "password": "app-password-here",
      "encryption": "tls"
    }
  }
}
```

### HTML Email with CC/BCC

```json
{
  "id": "send-report",
  "nodeType": "smtp-send",
  "parameters": {
    "credentialId": "cred-smtp-prod",
    "from": "reports@company.com",
    "to": ["manager@company.com"],
    "cc": ["team@company.com"],
    "bcc": ["archive@company.com"],
    "subject": "Weekly Report",
    "textBody": "See HTML version below",
    "htmlBody": "<html><body><h1>Weekly Report</h1><p>...</p></body></html>",
    "replyTo": "support@company.com"
  }
}
```

### Email with Attachments

```json
{
  "id": "send-invoice",
  "nodeType": "smtp-send",
  "parameters": {
    "credentialId": "cred-smtp-prod",
    "from": "billing@company.com",
    "to": ["customer@example.com"],
    "subject": "Invoice #12345",
    "textBody": "Please see attached invoice",
    "attachments": [
      {
        "filename": "invoice-12345.pdf",
        "contentType": "application/pdf",
        "data": "JVBERi0xLjQKJeLj..."
      },
      {
        "filename": "terms.txt",
        "contentType": "text/plain",
        "data": "VmFsdWUxCg=="
      }
    ]
  }
}
```

### Email with Inline Image

```json
{
  "id": "send-welcome",
  "nodeType": "smtp-send",
  "parameters": {
    "credentialId": "cred-smtp-prod",
    "from": "welcome@company.com",
    "to": ["newuser@example.com"],
    "subject": "Welcome!",
    "htmlBody": "<html><body><img src=\"cid:company-logo\" /><p>Welcome!</p></body></html>",
    "attachments": [
      {
        "filename": "logo.png",
        "contentType": "image/png",
        "data": "iVBORw0KGgoAAAANSUhEUg...",
        "contentId": "company-logo",
        "inline": true
      }
    ]
  }
}
```

### Using Credential Entity for SMTP Config

```json
{
  "id": "send-via-credential",
  "nodeType": "smtp-send",
  "parameters": {
    "credentialId": "cred-smtp-gmail-prod",
    "from": "notifications@myapp.com",
    "to": ["{{ $json.email }}"],
    "subject": "{{ $json.subject }}",
    "textBody": "{{ $json.message }}",
    "requestDeliveryNotification": true
  }
}
```

## Credential Entity Integration

SMTP Send uses the `Credential` entity for secure storage of SMTP credentials:

```yaml
entity: Credential
fields:
  type: smtp_relay
  config:
    host: smtp.gmail.com
    port: 587
    username: bot@gmail.com
    password: "<encrypted-app-password>"
    encryption: tls
    timeout: 30000
    retryAttempts: 2
```

Passwords are encrypted at rest and never returned in queries.

## Email Address Validation

- RFC 5322 simplified validation
- Max 254 characters per address
- Formats supported:
  - `simple@example.com`
  - `user+tag@example.co.uk`
  - `first.last@example.com`
  - `user_name@example.com`

## Attachment Support

- **Multiple attachments**: Up to 50 files per email
- **Size limits**: Total attachments max 20MB (base64 encoded)
- **MIME types**: Automatic detection from contentType
- **Inline images**: Support for Content-ID based embedding

## Error Handling

### Per-Recipient Tracking

The plugin tracks delivery success/failure per recipient:

```json
{
  "status": "partial",
  "successCount": 2,
  "failureCount": 1,
  "errors": [
    {
      "recipient": "invalid@user",
      "errorType": "invalid_address",
      "message": "Invalid email address format",
      "retryable": false
    }
  ]
}
```

### Retryable Errors

Network-based errors are marked as retryable:

- `network_error`: Connection failures, timeouts
- Transient SMTP failures

Non-retryable errors:

- `invalid_address`: Bad email format
- `auth_failed`: Authentication failed
- `send_failed`: Permanent rejection by server

### Retry Strategy

Exponential backoff on transient failures:

- Attempt 1: Immediate
- Attempt 2: 100ms delay
- Attempt 3: 200ms delay
- Attempt 4: 400ms delay (max 3 retries by default)

Configure with `retryAttempts` (0-3).

## Performance Considerations

- **Batch sends**: For high volume, consider separate workflow per recipient
- **Attachment size**: Compress PDFs/images to stay under 20MB total
- **Connection reuse**: SMTP connections are created per execution (consider pooling in production)
- **Timeout**: Default 30 seconds, adjust for slow networks

## Building

```bash
cd smtp-send
npm run build
npm run test
```

## Testing

Comprehensive test suite with 40+ test cases:

```bash
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run test:coverage          # Coverage report
```

Tests cover:

- Email validation (format, length)
- Recipient handling (to, cc, bcc)
- Attachment processing
- Error scenarios (invalid config, network failures)
- Partial delivery with per-recipient tracking
- Retry logic and network resilience
- SMTP configuration options

## Installation

Add to workflow package.json:

```json
{
  "devDependencies": {
    "@metabuilder/workflow-plugin-smtp-send": "workspace:*"
  }
}
```

## See Also

- **IMAP Sync**: `/workflow/plugins/ts/integration/email/imap-sync/` - Receive emails
- **Email Parser**: `/workflow/plugins/ts/utility/email-parser/` - Parse email content
- **Credential Entity**: `dbal/shared/api/schema/entities/access/credential.yaml`
- **Email Service**: `services/email_service/src/smtp_send.py` - Python backend
- **Plugin Registry**: `/workflow/plugins/ts/email-plugins.ts`

## RFC Compliance

- **RFC 5321**: SMTP protocol and message submission
- **RFC 5322**: Internet Message Format (headers, multipart)
- **RFC 1891**: SMTP Service Extension for Delivery Status Notifications (DSN)
- **RFC 2231**: MIME Parameter Value and Encoded Word Extensions
- **RFC 6531**: SMTPUTF8 (Unicode email addresses - optional)

## Security Notes

- Passwords stored encrypted in Credential entity
- TLS/SSL encryption supported for server connection
- No passwords logged or exposed in error messages
- Credentials fetched via secure DBAL API only
- BCC recipients hidden from other recipients
