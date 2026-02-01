# Email Parser Plugin - Phase 6

RFC 5322 compliant email parsing with MIME multipart support, HTML sanitization, and comprehensive attachment extraction.

## Features

### RFC 5322 Compliance
- Full RFC 5322 (Internet Message Format) header parsing
- Header folding and continuation line support
- Multiple header values handling
- RFC 2047 encoded header decoding (charset, base64, quoted-printable)

### MIME Message Support
- RFC 2045-2049 multipart message handling
- `multipart/alternative` (prefer HTML over plain text)
- `multipart/mixed` (content + attachments)
- `multipart/related` (content + inline resources)
- Nested multipart structures
- Content-Type parameter parsing (charset, boundary)

### Attachment Handling
- Attachment metadata extraction (filename, size, MIME type)
- Inline vs attachment classification (Content-Disposition)
- Content-ID for embedded resources
- Content encoding detection (base64, quoted-printable, 7bit, 8bit, binary)
- Size limits with configurable thresholds
- Selective content extraction (metadata only or base64 encoded)

### Security (XSS Protection)
- Dangerous tag removal: `<script>`, `<iframe>`, `<object>`, `<embed>`, etc.
- Event handler sanitization: `onclick`, `onerror`, `onload`, etc.
- Attribute filtering on dangerous event handlers and URLs
- Configurable sanitization (enable/disable)

### Content Encoding
- Base64 decoding
- Quoted-printable decoding
- 7bit/8bit/binary pass-through
- Automatic charset handling

## Installation

```bash
npm install @metabuilder/workflow-plugin-email-parser
```

## Usage

### Basic Email Parsing

```typescript
import { emailParserExecutor, EmailParserConfig } from '@metabuilder/workflow-plugin-email-parser';

const config: EmailParserConfig = {
  rawMessage: `From: sender@example.com
To: recipient@example.com
Subject: Test Email
Date: Mon, 23 Jan 2026 14:30:45 +0000

Hello, this is a test email.`,
  tenantId: 'tenant-123',
  sanitizeHtml: true,
  maxAttachmentSize: 25 * 1024 * 1024, // 25MB
  extractAttachmentContent: false
};

const node = {
  id: 'parse-email',
  type: 'email-parser',
  parameters: config
};

const result = await emailParserExecutor.execute(node, context, state);

if (result.status === 'success' || result.status === 'partial') {
  const message = result.output.message;
  console.log(`From: ${message.from}`);
  console.log(`To: ${message.to.join(', ')}`);
  console.log(`Subject: ${message.subject}`);
  console.log(`Body: ${message.textBody || message.htmlBody}`);
  console.log(`Attachments: ${message.attachmentCount}`);
}
```

### Workflow Configuration

```json
{
  "id": "email-parse-node",
  "type": "email-parser",
  "parameters": {
    "rawMessage": "{{ $json.rawEmailData }}",
    "tenantId": "{{ $context.tenantId }}",
    "sanitizeHtml": true,
    "maxAttachmentSize": 26214400,
    "extractAttachmentContent": false
  },
  "connections": ["imap-sync"]
}
```

## Configuration Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rawMessage` | string | **required** | Raw email message in RFC 5322 format |
| `tenantId` | string | **required** | Tenant ID for multi-tenant context |
| `sanitizeHtml` | boolean | `true` | Remove dangerous HTML tags/attributes |
| `extractAttachmentContent` | boolean | `false` | Include base64 content for attachments |
| `maxAttachmentSize` | number | 25MB | Maximum attachment size in bytes |
| `maxBodyLength` | number | 1MB | Maximum body text length in characters |

## Output Format

### ParsedEmailMessage

```typescript
{
  messageId: string;                    // RFC 5322 Message-ID
  from: string;                         // Sender email address
  to: string[];                         // Recipients
  cc?: string[];                        // CC recipients
  bcc?: string[];                       // BCC recipients
  replyTo?: string;                     // Reply-To header
  subject: string;                      // Email subject
  textBody?: string;                    // Plain text version
  htmlBody?: string;                    // HTML version (sanitized)
  headers: Record<string, string[]>;    // All headers
  receivedAt: string;                   // ISO 8601 timestamp
  attachmentCount: number;              // Total attachments
  attachments: EmailAttachmentMetadata[]; // Attachment list
  size: number;                         // Message size in bytes
  priority?: 'high' | 'normal' | 'low'; // Priority from X-Priority
  mimeType: string;                     // Content-Type
}
```

### EmailAttachmentMetadata

```typescript
{
  filename: string;              // Original filename
  mimeType: string;              // e.g., "image/png", "application/pdf"
  size: number;                  // Size in bytes
  contentId?: string;            // For embedded resources
  isInline: boolean;             // Inline vs attachment
  content?: string;              // Base64 encoded (if extracted)
  contentEncoding: string;       // Encoding type (base64, quoted-printable, etc.)
}
```

### Execution Result

```typescript
{
  status: 'success' | 'partial' | 'error';
  output: {
    message?: ParsedEmailMessage;      // Parsed email (if successful)
    errors: ParserError[];              // Parse errors
    warnings: string[];                 // Non-fatal warnings
    metrics: {
      parseDurationMs: number;          // Parse time
      headerCount: number;              // Headers parsed
      partCount: number;                // MIME parts
      attachmentCount: number;          // Attachments found
      attachmentSizeBytes: number;      // Total attachment size
      sanitizationWarnings: number;     // HTML sanitization removals
    }
  };
  duration: number;
}
```

## Error Handling

### Error Codes

| Code | Description | Recoverable |
|------|-------------|-------------|
| `MISSING_FROM` | No From header found | No |
| `MISSING_TO` | No valid To header | No |
| `INVALID_HEADERS` | Malformed header section | Yes |
| `INVALID_MIME` | Malformed MIME structure | Yes |
| `PARSE_ERROR` | Generic parse failure | No |
| `PARSE_EXCEPTION` | Unexpected exception | No |

### Partial Parsing

When `status === 'partial'`:
- Message was successfully extracted
- Some non-critical errors or warnings occurred
- Errors array contains details of issues
- Message can still be processed (attachments, encoding errors, etc.)

Example:
```typescript
if (result.status === 'partial') {
  console.log('Errors:', result.output.errors);
  console.log('Warnings:', result.output.warnings);
  // Still process message
  const message = result.output.message;
}
```

## RFC Standards Implemented

### RFC 5322 - Internet Message Format
- Header parsing with folding support
- Address list parsing
- Date/time parsing
- Comment handling
- Quoted strings

### RFC 2045-2049 - MIME
- Content-Type parameter parsing
- Multipart boundary detection
- Content-Transfer-Encoding support
- Content-Disposition handling

### RFC 2047 - MIME Header Extensions
- Encoded-word syntax: `=?charset?encoding?text?=`
- Base64 and Quoted-Printable decoding
- Multiple encoded words in single header

### RFC 3501 - IMAP4rev1
- MIME integration with IMAP flags
- Content structure compatibility

## Security Considerations

### XSS Prevention

The parser automatically sanitizes HTML content by:

1. **Removing dangerous tags**: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<meta>`, `<link>`, `<style>`, `<form>`, `<svg>`, etc.

2. **Removing event handlers**: `onclick`, `onerror`, `onload`, `onmouseover`, `onchange`, `onsubmit`, etc.

3. **Filtering dangerous attributes**: `href`, `src`, `action`, `formaction` on dangerous tags

4. **Counting sanitization actions**: `metrics.sanitizationWarnings` tracks removed elements

### Best Practices

```typescript
// Always enable HTML sanitization for untrusted email sources
const config: EmailParserConfig = {
  rawMessage: emailFromImap,
  tenantId: userTenantId,
  sanitizeHtml: true,  // ✓ Always true for user emails
  extractAttachmentContent: false // ✓ Avoid extracting large files to memory
};

// Size limits prevent memory exhaustion
maxBodyLength: 1024 * 1024,           // 1MB
maxAttachmentSize: 25 * 1024 * 1024,  // 25MB per file

// Large attachments should be stored separately
if (attachment.size > 10 * 1024 * 1024) {
  // Store in S3 instead of database
}
```

### No Code Execution

The parser:
- Does NOT execute JavaScript or any code
- Does NOT make external HTTP requests
- Does NOT modify files on disk
- Does NOT load external resources
- Is fully synchronous and isolated

## Examples

### Simple Text Email

```
From: alice@example.com
To: bob@example.com
Subject: Hello
Message-ID: <msg@example.com>
Date: Mon, 23 Jan 2026 10:00:00 +0000

Hi Bob, how are you?
```

### Multipart Alternative (Text + HTML)

```
From: sender@example.com
To: recipient@example.com
Subject: Test
Content-Type: multipart/alternative; boundary="boundary123"

--boundary123
Content-Type: text/plain

Plain text version

--boundary123
Content-Type: text/html

<html><body>HTML version</body></html>

--boundary123--
```

### Email with Attachment

```
From: sender@example.com
To: recipient@example.com
Subject: Document
Content-Type: multipart/mixed; boundary="boundary456"

--boundary456
Content-Type: text/plain

See attachment.

--boundary456
Content-Type: application/pdf
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="report.pdf"

JVBERi0xLjQKJeLj...

--boundary456--
```

### Email with Inline Image

```
Content-Type: multipart/mixed; boundary="boundary789"

--boundary789
Content-Type: text/html

<html><img src="cid:logo@company.com"/></html>

--boundary789
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-Disposition: inline; filename="logo.png"
Content-ID: <logo@company.com>

iVBORw0KGgoAAAANSUhEUgA...

--boundary789--
```

## Testing

Run the test suite:

```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run type-check        # TypeScript validation
npm run build              # Build plugin
```

Test coverage includes:
- RFC 5322 header parsing (simple, folded, multiple)
- MIME multipart handling (alternative, mixed, nested)
- Content encoding (base64, quoted-printable)
- HTML sanitization (script, iframe, events)
- Attachment extraction and cataloging
- Error handling and recovery
- Real-world complex emails
- Metrics collection

## Integration with Email Client

The parser is designed to work within the email client architecture:

1. **IMAP Sync** (`imap-sync`) - Fetches raw messages from IMAP server
2. **Email Parser** (`email-parser`) - Parses RFC 5322 format **[THIS PLUGIN]**
3. **DBAL Storage** - Stores parsed message in EmailMessage/EmailAttachment entities
4. **Email Search** (`imap-search`) - Full-text search on parsed content

### Workflow Example

```json
{
  "id": "email-sync-flow",
  "nodes": [
    {
      "id": "sync-node",
      "type": "imap-sync",
      "parameters": {
        "imapId": "{{ $context.imapClientId }}",
        "folderId": "{{ $json.folderId }}",
        "maxMessages": 100
      }
    },
    {
      "id": "parse-node",
      "type": "email-parser",
      "parameters": {
        "rawMessage": "{{ $json.messageContent }}",
        "tenantId": "{{ $context.tenantId }}",
        "sanitizeHtml": true
      },
      "connections": ["sync-node"]
    },
    {
      "id": "store-node",
      "type": "dbal-write",
      "parameters": {
        "entity": "EmailMessage",
        "data": "{{ $json.parsedMessage }}"
      },
      "connections": ["parse-node"]
    }
  ]
}
```

## Performance

### Benchmarks

Typical parsing times on modern hardware:

| Message Type | Size | Time |
|--------------|------|------|
| Simple text | 2KB | <1ms |
| Text + HTML multipart | 50KB | 2-5ms |
| With small attachment | 500KB | 5-10ms |
| Large HTML with images | 5MB | 50-100ms |

### Memory Usage

- Per message parsing: ~10-20MB (includes decoded content)
- Streaming not supported (loads entire message into memory)
- Large attachments should be extracted to disk

### Optimization Tips

```typescript
// Don't extract large attachment content
extractAttachmentContent: false,  // ✓ Metadata only

// Limit body length for huge messages
maxBodyLength: 1024 * 1024,       // ✓ 1MB limit

// Set reasonable attachment size limit
maxAttachmentSize: 25 * 1024 * 1024, // ✓ 25MB

// Disable HTML sanitization if not needed (rare)
sanitizeHtml: false,              // ✗ Usually want sanitization
```

## Limitations

- **No streaming**: Entire message loaded into memory
- **Synchronous**: No async I/O (parsing only)
- **No external resources**: Links and images not fetched
- **Limited charset support**: UTF-8, ASCII, ISO-8859-1 primarily
- **No S/MIME or PGP**: Encrypted messages not decrypted
- **No authentication**: Just parsing, no verification

## Architecture Notes

### Header Parsing Strategy

Headers are case-insensitive and may have folding:
```
Subject: This is a very long
 subject that continues
 on next line
```

The parser:
1. Splits headers by CRLF/LF
2. Detects folding (lines starting with space/tab)
3. Merges continuation lines
4. Stores headers case-insensitively in Map
5. Supports multiple values (e.g., Received headers)

### MIME Structure

For multipart messages:
1. Extract boundary from Content-Type parameter
2. Split body by boundary delimiters
3. Parse each part recursively (may contain multipart parts)
4. Build tree structure of MIME parts
5. Extract bodies and attachments from tree

### Sanitization Strategy

HTML is processed in four passes:
1. Remove complete tag+content: `<script>...</script>`
2. Remove dangerous tags: `<iframe>`, `<object>`
3. Remove event handler attributes: `onclick`, `onerror`
4. Remove dangerous URL attributes: `href="javascript:..."`

## Contributing

See [CLAUDE.md](../../../../../../../CLAUDE.md) for development guidelines.

## License

MIT
