# Email Parser Plugin

RFC 5322 email message parser for MetaBuilder workflow engine.

## Plugin: email-parser

Parses RFC 5322 format email messages into structured components.

**Inputs:**
- `message` (string, required) - Email message in RFC 5322 format
- `includeAttachments` (boolean, optional, default: true) - Whether to extract attachment metadata

**Outputs:**
- `status` (string) - 'parsed' or 'error'
- `data` (object) - Contains:
  - `headers` (object) - Parsed email headers (from, to, cc, bcc, subject, date, messageId, etc.)
  - `body` (string) - Full message body as raw string
  - `textBody` (string, optional) - Plain text version
  - `htmlBody` (string, optional) - HTML version
  - `attachments` (array) - Attachment metadata with filename, mimeType, size, isInline
  - `parseTime` (number) - Timestamp of parsing

**Header Fields:**
- `from` - Sender email address
- `to` - Array of recipient addresses
- `cc` - Array of CC recipients
- `bcc` - Array of BCC recipients
- `subject` - Email subject
- `date` - RFC 2822 date string
- `messageId` - Unique message identifier
- `inReplyTo` - Message ID being replied to
- `references` - Array of referenced message IDs
- `contentType` - MIME content type
- `contentTransferEncoding` - Encoding method

**Attachment Fields:**
- `filename` - Original filename
- `mimeType` - MIME type (e.g., image/png, application/pdf)
- `size` - File size in bytes
- `contentId` - Content-ID for inline attachments
- `isInline` - Whether attachment is inline or regular

**Usage:**
```json
{
  "id": "parse-email",
  "nodeType": "email-parser",
  "parameters": {
    "message": "From: sender@example.com\nTo: recipient@example.com\nSubject: Test\n\nHello World",
    "includeAttachments": true
  }
}
```

**Output Example:**
```json
{
  "status": "success",
  "output": {
    "status": "parsed",
    "data": {
      "headers": {
        "from": "sender@example.com",
        "to": ["recipient@example.com"],
        "subject": "Test",
        "date": "Wed, 23 Jan 2026 12:00:00 GMT"
      },
      "textBody": "Hello World",
      "htmlBody": null,
      "attachments": [],
      "parseTime": 1705978800000
    }
  }
}
```

## Features

- **RFC 5322 Compliant** - Parses standard email format
- **Multipart Support** - Handles multipart/mixed and multipart/alternative messages
- **MIME Encoding** - Decodes MIME-encoded headers
- **Attachment Extraction** - Identifies and extracts attachment metadata
- **Header Normalization** - Normalizes common headers (from, to, cc, bcc, etc.)

## Building

```bash
npm run build
npm run type-check
```

## Installation

Add to workflow package.json:

```json
{
  "devDependencies": {
    "@metabuilder/workflow-plugin-email-parser": "workspace:*"
  }
}
```

## See Also

- IMAP Sync: `/workflow/plugins/ts/integration/email/imap-sync/`
- IMAP Search: `/workflow/plugins/ts/integration/email/imap-search/`
- Email Send: `/workflow/plugins/ts/integration/email-send/`
- Plugin Registry: `/workflow/plugins/ts/email-plugins.ts`
