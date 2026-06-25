# Email Parser Plugin - Quick Start Guide

## Installation

The plugin is already integrated into the email plugins workspace. It's available at:

```
@metabuilder/workflow-plugin-email-parser
```

## Basic Usage

### 1. Simple Email Parsing

```typescript
import { emailParserExecutor, EmailParserConfig } from '@metabuilder/workflow-plugin-email-parser';

const rawEmail = `From: sender@example.com
To: recipient@example.com
Subject: Hello World
Date: Mon, 23 Jan 2026 14:30:45 +0000

This is the email body.`;

const config: EmailParserConfig = {
  rawMessage: rawEmail,
  tenantId: 'my-tenant'
};

const node = {
  id: 'parse-1',
  type: 'email-parser',
  parameters: config
};

const result = await emailParserExecutor.execute(node, {}, {});

if (result.status === 'success') {
  const message = result.output.message;
  console.log(`From: ${message.from}`);
  console.log(`Subject: ${message.subject}`);
  console.log(`Body: ${message.textBody}`);
}
```

### 2. Workflow Configuration

Add to your workflow JSON:

```json
{
  "id": "email-parser-node",
  "type": "email-parser",
  "parameters": {
    "rawMessage": "{{ $json.rawEmailData }}",
    "tenantId": "{{ $context.tenantId }}",
    "sanitizeHtml": true
  }
}
```

### 3. Access Parsed Data

In subsequent workflow nodes, access the parsed email:

```json
{
  "id": "store-node",
  "type": "dbal-write",
  "parameters": {
    "entity": "EmailMessage",
    "data": {
      "from": "{{ $json.parsedEmail.from }}",
      "to": "{{ $json.parsedEmail.to }}",
      "subject": "{{ $json.parsedEmail.subject }}",
      "textBody": "{{ $json.parsedEmail.textBody }}",
      "htmlBody": "{{ $json.parsedEmail.htmlBody }}",
      "headers": "{{ $json.parsedEmail.headers }}"
    }
  },
  "connections": ["email-parser-node"]
}
```

## Configuration Examples

### Parse with HTML Sanitization (Recommended)

```typescript
const config: EmailParserConfig = {
  rawMessage: email,
  tenantId: 'tenant-123',
  sanitizeHtml: true,        // ✓ Remove dangerous HTML
  extractAttachmentContent: false  // ✓ Metadata only
};
```

### Parse with Attachment Content

For small attachments (< 10MB), extract content:

```typescript
const config: EmailParserConfig = {
  rawMessage: email,
  tenantId: 'tenant-123',
  extractAttachmentContent: true,  // ✓ Include base64 content
  maxAttachmentSize: 10 * 1024 * 1024  // 10MB limit
};
```

### Parse with Size Limits

```typescript
const config: EmailParserConfig = {
  rawMessage: email,
  tenantId: 'tenant-123',
  maxBodyLength: 500 * 1024,           // 500KB body limit
  maxAttachmentSize: 50 * 1024 * 1024  // 50MB per file
};
```

## Output Reference

### Success Response

```typescript
{
  status: 'success',
  output: {
    message: {
      messageId: '<123@example.com>',
      from: 'alice@example.com',
      to: ['bob@example.com'],
      cc: ['manager@company.com'],
      subject: 'Meeting Tomorrow',
      textBody: 'Let\'s meet at 2pm',
      htmlBody: '<p>Let\'s meet at 2pm</p>',
      headers: { /* all headers */ },
      receivedAt: '2026-01-24T10:30:00.000Z',
      attachmentCount: 1,
      attachments: [{
        filename: 'agenda.pdf',
        mimeType: 'application/pdf',
        size: 245234,
        isInline: false,
        contentEncoding: 'base64'
      }],
      size: 1024
    },
    errors: [],
    warnings: [],
    metrics: {
      parseDurationMs: 5,
      headerCount: 10,
      partCount: 2,
      attachmentCount: 1,
      attachmentSizeBytes: 245234,
      sanitizationWarnings: 0
    }
  },
  duration: 8
}
```

### Partial Parse (With Non-Critical Errors)

```typescript
{
  status: 'partial',
  output: {
    message: { /* email data */ },
    errors: [{
      code: 'INVALID_MIME',
      message: 'Unexpected boundary format',
      recoverable: true
    }],
    warnings: ['Sanitized 2 dangerous HTML elements']
  }
}
```

### Error Response

```typescript
{
  status: 'error',
  error: 'Email does not contain "From" header',
  errorCode: 'MISSING_FROM',
  output: {
    errors: [{
      code: 'MISSING_FROM',
      message: 'Email does not contain "From" header',
      recoverable: false
    }]
  }
}
```

## Common Use Cases

### Case 1: Sync from IMAP and Parse

```json
{
  "nodes": [
    {
      "id": "imap-sync",
      "type": "imap-sync",
      "parameters": { "imapId": "{{ $context.imapId }}", "folderId": "{{ $json.folderId }}" }
    },
    {
      "id": "parse-email",
      "type": "email-parser",
      "parameters": {
        "rawMessage": "{{ $json.messageBody }}",
        "tenantId": "{{ $context.tenantId }}"
      },
      "connections": ["imap-sync"]
    }
  ]
}
```

### Case 2: Parse and Store in Database

```json
{
  "nodes": [
    {
      "id": "parse-email",
      "type": "email-parser",
      "parameters": { "rawMessage": "{{ $json.email }}", "tenantId": "{{ $context.tenantId }}" }
    },
    {
      "id": "store-message",
      "type": "dbal-write",
      "parameters": {
        "entity": "EmailMessage",
        "data": {
          "from": "{{ $json.message.from }}",
          "to": "{{ JSON.stringify($json.message.to) }}",
          "subject": "{{ $json.message.subject }}",
          "textBody": "{{ $json.message.textBody }}",
          "htmlBody": "{{ $json.message.htmlBody }}"
        }
      },
      "connections": ["parse-email"]
    },
    {
      "id": "store-attachments",
      "type": "dbal-write",
      "parameters": {
        "entity": "EmailAttachment",
        "data": "{{ $json.message.attachments }}",
        "batchMode": true
      },
      "connections": ["store-message"]
    }
  ]
}
```

### Case 3: Parse and Search

```json
{
  "nodes": [
    {
      "id": "parse-email",
      "type": "email-parser",
      "parameters": { "rawMessage": "{{ $json.email }}", "tenantId": "{{ $context.tenantId }}" }
    },
    {
      "id": "search-email",
      "type": "email-search",
      "parameters": {
        "query": "{{ $context.searchQuery }}",
        "content": "{{ $json.message.textBody }} {{ $json.message.subject }}"
      },
      "connections": ["parse-email"]
    }
  ]
}
```

## Validation

Before executing, validate the configuration:

```typescript
const validation = emailParserExecutor.validate(node);

if (!validation.valid) {
  console.error('Validation errors:');
  validation.errors.forEach(err => console.error(`  - ${err}`));
}

if (validation.warnings.length > 0) {
  console.warn('Validation warnings:');
  validation.warnings.forEach(warn => console.warn(`  - ${warn}`));
}
```

## Error Handling

```typescript
const result = await emailParserExecutor.execute(node, context, state);

if (result.status === 'error') {
  // Critical error - no message parsed
  console.error(`Parse failed: ${result.error}`);
  console.error(`Error code: ${result.errorCode}`);

  // Handle failure
  return handleParseError(result.error);
}

if (result.status === 'partial') {
  // Non-critical errors but message still available
  console.warn(`Parse succeeded with issues`);

  if (result.output.errors.length > 0) {
    console.warn('Errors:', result.output.errors);
  }

  if (result.output.warnings.length > 0) {
    console.warn('Warnings:', result.output.warnings);
  }

  // Still process message
  processMessage(result.output.message);
}

if (result.status === 'success') {
  // Clean parse
  processMessage(result.output.message);
}
```

## Performance Tips

1. **Don't extract large attachment content:**
   ```typescript
   extractAttachmentContent: false  // ← Metadata only
   ```

2. **Set body length limit:**
   ```typescript
   maxBodyLength: 1024 * 1024  // 1MB
   ```

3. **Limit attachment size:**
   ```typescript
   maxAttachmentSize: 25 * 1024 * 1024  // 25MB
   ```

4. **Keep HTML sanitization enabled:**
   ```typescript
   sanitizeHtml: true  // ← Default, minimal overhead
   ```

## Security Best Practices

1. **Always enable HTML sanitization for untrusted emails:**
   ```typescript
   sanitizeHtml: true  // ✓ Remove XSS vectors
   ```

2. **Never trust sender information:**
   ```typescript
   // Always validate From address in business logic
   const from = message.from;  // Could be spoofed
   ```

3. **Store attachment content separately:**
   ```typescript
   // Don't store base64 content in database
   // Use S3 or other blob storage instead
   ```

4. **Validate all output before using:**
   ```typescript
   if (!message.from || !message.to || !message.subject) {
     throw new Error('Invalid email structure');
   }
   ```

## Troubleshooting

**Empty body after parsing:**
- Check if email has a body section
- Verify Content-Type multipart handling
- Review charset in headers

**Attachments not found:**
- Verify multipart/mixed structure
- Check Content-Disposition header
- Check maxAttachmentSize limit

**HTML missing:**
- Check if HTML was actually present in original
- Review sanitization warnings count
- Dangerous content may have been removed

**Special characters garbled:**
- Check RFC 2047 encoding in headers
- Verify charset parameter in Content-Type
- Review Buffer encoding during decode

## Next Steps

1. Read [README.md](./README.md) for comprehensive documentation
2. Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details
3. Review test suite in [src/index.test.ts](./src/index.test.ts) for examples
4. Integrate into your email client workflow

## Support

For issues or questions:
1. Check the README.md documentation
2. Review IMPLEMENTATION.md for technical details
3. Check test suite for usage examples
4. Review CLAUDE.md for development guidelines
