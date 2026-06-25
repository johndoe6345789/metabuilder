# SMTP Send Plugin - Quick Reference

## Node Type
`smtp-send`

## Installation
```bash
cd workflow/plugins/ts/integration/email/smtp-send
npm install
npm run build
npm run test  # 48 test cases
```

## Minimal Example
```json
{
  "nodeType": "smtp-send",
  "parameters": {
    "from": "sender@example.com",
    "to": ["recipient@example.com"],
    "subject": "Hello",
    "textBody": "This is a test",
    "smtpConfig": {
      "host": "smtp.gmail.com",
      "port": 587,
      "username": "user@gmail.com",
      "password": "app-password",
      "encryption": "tls"
    }
  }
}
```

## Key Features
- ✓ HTML + text alternatives (MIME multipart)
- ✓ Multiple recipients (to, cc, bcc)
- ✓ Attachments with MIME type detection
- ✓ Per-recipient error tracking
- ✓ Network retry with exponential backoff
- ✓ Credential entity integration
- ✓ Message ID and queue ID tracking

## Required Inputs
| Field | Type | Example |
|-------|------|---------|
| `from` | string | sender@example.com |
| `to` | string[] | ["recipient@example.com"] |
| `subject` | string | "Test Email" |
| `textBody` or `htmlBody` | string | "Content..." |
| `smtpConfig` or `credentialId` | object/string | {...} or "cred-id" |

## Optional Inputs
| Field | Type | Default |
|-------|------|---------|
| `cc` | string[] | - |
| `bcc` | string[] | - |
| `replyTo` | string | - |
| `attachments` | object[] | - |
| `customHeaders` | Record | - |
| `requestDeliveryNotification` | boolean | false |
| `requestReadReceipt` | boolean | false |

## Output Format
```typescript
{
  status: 'sent' | 'partial' | 'failed',
  messageId?: '<id@host>',
  sentAt: 1705975200000,
  successCount: 5,
  failureCount: 0,
  errors: [
    {
      recipient: 'failed@example.com',
      errorType: 'network_error',
      message: 'Connection timeout',
      retryable: true
    }
  ],
  queueId?: 'ABC123XYZ',
  smtpCode?: 250,
  smtpResponse?: 'OK: Message accepted',
  shouldRetry: false
}
```

## SMTP Encryption Options
| Option | Port | Security | Use Case |
|--------|------|----------|----------|
| `tls` | 587 | STARTTLS | Most common (Gmail, Office365) |
| `ssl` | 465 | Implicit SSL | Legacy systems |
| `none` | 25 | Plain | Local testing only |

## Standard SMTP Hosts
| Provider | Host | Port | Encryption |
|----------|------|------|-----------|
| Gmail | smtp.gmail.com | 587 | tls |
| Office 365 | smtp.office365.com | 587 | tls |
| SendGrid | smtp.sendgrid.net | 587 | tls |
| Mailgun | smtp.mailgun.org | 587 | tls |
| Local | localhost | 25 | none |

## Attachment Example
```json
{
  "attachments": [
    {
      "filename": "document.pdf",
      "contentType": "application/pdf",
      "data": "JVBERi0xLjQKJeLj...",
      "contentId": "pdf-doc",
      "inline": false
    },
    {
      "filename": "logo.png",
      "contentType": "image/png",
      "data": "iVBORw0KGgoAAAANS...",
      "contentId": "company-logo",
      "inline": true
    }
  ]
}
```

## Error Types
| Error | Retryable | Cause |
|-------|-----------|-------|
| `invalid_address` | No | Bad email format |
| `auth_failed` | No | Wrong credentials |
| `network_error` | Yes | Connection failed |
| `send_failed` | Yes* | Server rejected |
| `unknown` | Maybe | Other errors |

*Only retryable if marked by SMTP server as transient

## Validation Rules
✓ Email format must match `[^\s@]+@[^\s@]+\.[^\s@]+$`
✓ Email length max 254 characters
✓ At least 1 recipient required
✓ Subject cannot be empty
✓ textBody or htmlBody required
✓ Attachments max 50 per email
✓ Total attachment size max 20MB (base64)
✓ SMTP port 1-65535
✓ Retry attempts 0-3

## Workflow Integration
```json
{
  "id": "send-notification",
  "type": "node",
  "nodeType": "smtp-send",
  "parameters": {
    "credentialId": "cred-smtp-prod",
    "from": "notifications@company.com",
    "to": ["{{ $json.email }}"],
    "subject": "{{ $json.subject }}",
    "htmlBody": "<h1>{{ $json.title }}</h1>",
    "requestDeliveryNotification": true
  }
}
```

## Common Issues

### Connection Timeout
- Check SMTP host and port
- Verify firewall allows outbound SMTP
- Increase timeout in config: `timeout: 60000`

### Authentication Failed
- Verify username and password
- For Gmail: Use app-specific password, not account password
- Check if SMTP is enabled in email provider

### Invalid Address Errors
- Ensure email format is correct
- Check for spaces or special characters
- Verify recipients array is not empty

### Attachments Not Sending
- Verify base64 encoding of data
- Check content type matches file
- Ensure total size < 20MB
- Max 50 attachments per email

## Performance Tips
- Use BCC for bulk sends instead of To
- Compress large attachments before sending
- Set reasonable timeout (30-60s)
- Configure 2-3 retry attempts for production
- Monitor SMTP provider rate limits

## Testing
```bash
npm test                    # Run all 48 tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## Files
- Implementation: `src/index.ts` (610 lines)
- Tests: `src/index.test.ts` (986 lines, 48 test cases)
- Documentation: `README.md` (650+ lines)
- Config: `package.json`, `tsconfig.json`

## Related Plugins
- **IMAP Sync**: `workflow/plugins/ts/integration/email/imap-sync/`
- **Email Parser**: `workflow/plugins/ts/utility/email-parser/`
- **Attachment Handler**: `workflow/plugins/ts/integration/email/attachment-handler/`

## Production Checklist
- [ ] All 48 tests passing
- [ ] TypeScript strict mode clean
- [ ] SMTP server configured and accessible
- [ ] Credentials stored in Credential entity
- [ ] TLS/SSL encryption enabled
- [ ] Retry attempts configured (2-3)
- [ ] Email headers validated
- [ ] Error logging configured
- [ ] Monitoring/alerts set up
