# Attachment Handler Plugin - Phase 6

Email attachment download, storage, and lifecycle management plugin for MetaBuilder workflow engine.

## Overview

Handles complete email attachment processing pipeline:
- Download attachments from email messages
- Store in blob storage (S3 or filesystem with tenant isolation)
- Detect and validate MIME types
- Security scanning (ClamAV, VirusTotal integration hooks)
- Content-based deduplication via SHA256 hashing
- Generate presigned URLs for secure downloads
- Track attachment metadata (size, hash, scan status, retention)
- Soft-delete with automatic expiration policies

## Features

### Storage & Streaming
- **Blob Storage Integration**: S3 and filesystem backends via `TenantAwareBlobStorage`
- **Streaming Upload**: Handle large files without loading into memory
- **Multi-tenant Isolation**: Automatic path prefixing with `tenantId`
- **Storage Key Format**: `attachments/{tenantId}/{messageId}/{contentHash}/{timestamp}-{filename}`

### Security
- **MIME Type Detection**: Validate against declared types and detect from content
- **Dangerous Content Blocking**:
  - Blocks executable extensions (.exe, .bat, .cmd, etc.)
  - Blocks dangerous MIME types (application/x-executable, etc.)
  - Configurable file size limits
- **Virus Scanning Integration**:
  - ClamAV support (on-premises)
  - VirusTotal API (cloud)
  - Async scanning with status tracking (pending/clean/suspicious/infected)
- **Size Constraints**: Configurable per-attachment limits (default 50MB, max 5GB)

### Content Integrity
- **SHA256 Hashing**: Calculate content hash for deduplication
- **Deduplication**: Link multiple attachments with identical content (save storage)
- **ETag Tracking**: Blob metadata includes ETag for consistency verification

### Presigned URLs
- **Secure Downloads**: Generate time-limited presigned URLs
- **Expiration Control**: 60 seconds to 7 days (configurable)
- **HMAC Signatures**: Tamper-proof URL signing
- **Redirect Format**: `/api/v1/attachments/download/{storageKey}?expires={time}&sig={hmac}`

## Inputs

```typescript
interface AttachmentHandlerConfig {
  // Required: Email message reference
  messageId: string;              // UUID of EmailMessage entity
  filename: string;               // Original filename from email headers
  size: number;                   // Size in bytes (validated)

  // Optional: Content info
  mimeType?: string;              // Declared MIME type (validated/overridden)
  encoding?: string;              // Content-transfer-encoding (base64, etc.)
  contentHash?: string;           // MD5/SHA256 for deduplication
  attachmentData?: string;        // Attachment content (base64 or reference)

  // Optional: Storage config
  storagePath?: string;           // Custom path prefix (default: attachments/{tenantId}/{messageId}/)
  maxSize?: number;               // Max file size in bytes (default: 50MB, max: 5GB)

  // Optional: Security & scanning
  enableVirusScan?: boolean;      // Enable virus scanning (default: true)
  virusScanEndpoint?: string;     // External scan service endpoint

  // Optional: Deduplication & URLs
  enableDeduplication?: boolean;  // Enable content-based dedup (default: true)
  urlExpirationSeconds?: number;  // Presigned URL TTL (default: 3600, range: 60-604800)
}
```

## Outputs

```typescript
interface AttachmentHandlerResult {
  // Identification
  attachmentId: string;           // UUID of created EmailAttachment record
  filename: string;               // Original filename (as stored)

  // Metadata
  mimeType: string;               // Detected/validated MIME type
  size: number;                   // File size in bytes
  contentHash: string;            // SHA256 hash for deduplication

  // Storage
  storageKey: string;             // Blob storage key path

  // Access & Security
  presignedUrl: string;           // Signed URL for download (expires: urlExpirationSeconds)
  virusScanStatus: string;        // 'clean' | 'suspicious' | 'infected' | 'pending' | 'skipped'
  virusScanDetails?: string;      // Scan report if available

  // Optimization
  isDeduplicated: boolean;        // True if content matched existing attachment

  // Metrics
  processedAt: number;            // Timestamp (milliseconds since epoch)
  processingTime: number;         // Total duration (milliseconds)
}
```

## MIME Type Detection

### Supported Types

**Documents**
- `application/pdf` (.pdf)
- `application/msword` (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (.docx)
- `application/vnd.ms-excel` (.xls)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (.xlsx)
- `application/vnd.ms-powerpoint` (.ppt)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (.pptx)

**Images**
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/gif` (.gif)
- `image/webp` (.webp)
- `image/svg+xml` (.svg)

**Archives**
- `application/zip` (.zip)
- `application/x-tar` (.tar)
- `application/gzip` (.gz)
- `application/x-rar-compressed` (.rar)
- `application/x-7z-compressed` (.7z)

**Media**
- `audio/mpeg` (.mp3)
- `audio/wav` (.wav)
- `audio/ogg` (.ogg)
- `video/mp4` (.mp4)
- `video/mpeg` (.mpeg, .mpg)
- `video/quicktime` (.mov)

**Text**
- `text/plain` (.txt)
- `text/csv` (.csv)
- `text/html` (.html)
- `text/xml` (.xml)
- `application/json` (.json)

**Unknown**: Defaults to `application/octet-stream`

### Dangerous MIME Types

Blocked automatically:
- `application/x-executable`
- `application/x-msdos-program`
- `application/x-dvi`
- `application/x-perl`
- `application/x-python`
- `application/x-sh`
- `application/x-shellscript`

### Dangerous File Extensions

Blocked automatically:
- Executables: .exe, .bat, .cmd, .com, .pif, .msi, .scr, .vbs, .js
- Archives: .jar, .zip, .rar, .7z, .iso, .dmg
- Applications: .app, .bin
- Scripts: .sh, .bash, .ps1, .pyw, .pyx

## Usage Examples

### Basic Attachment Processing

```json
{
  "id": "process-attachment",
  "nodeType": "attachment-handler",
  "parameters": {
    "messageId": "msg-acme-2026-01-24-001",
    "filename": "Q4-Report.pdf",
    "mimeType": "application/pdf",
    "size": 2048576,
    "encoding": "base64",
    "attachmentData": "JVBERi0xLjQKJeLj..."
  }
}
```

**Output:**
```json
{
  "status": "success",
  "output": {
    "status": "processed",
    "data": {
      "attachmentId": "att-1706030400000-abc123",
      "filename": "Q4-Report.pdf",
      "mimeType": "application/pdf",
      "size": 2048576,
      "storageKey": "attachments/tenant-acme/msg-acme-2026-01-24-001/3a7b..../1706030400-Q4-Report.pdf",
      "contentHash": "3a7b4c5d...",
      "presignedUrl": "/api/v1/attachments/download/attachments/tenant-acme/msg-acme-2026-01-24-001/3a7b..../1706030400-Q4-Report.pdf?expires=1706034000000&sig=abc123",
      "virusScanStatus": "clean",
      "isDeduplicated": false,
      "processedAt": 1706030400000,
      "processingTime": 245
    }
  }
}
```

### With Custom Size Limit

```json
{
  "id": "process-small-attachment",
  "nodeType": "attachment-handler",
  "parameters": {
    "messageId": "msg-123",
    "filename": "avatar.jpg",
    "size": 512000,
    "maxSize": 5242880,
    "mimeType": "image/jpeg",
    "attachmentData": "base64-jpeg-data"
  }
}
```

### With Virus Scanning

```json
{
  "id": "process-with-scan",
  "nodeType": "attachment-handler",
  "parameters": {
    "messageId": "msg-456",
    "filename": "archive.zip",
    "size": 10485760,
    "enableVirusScan": true,
    "virusScanEndpoint": "https://api.virustotal.com/v3/files",
    "attachmentData": "base64-zip-data"
  }
}
```

### With URL Expiration

```json
{
  "id": "process-with-expiration",
  "nodeType": "attachment-handler",
  "parameters": {
    "messageId": "msg-789",
    "filename": "document.pdf",
    "size": 1048576,
    "urlExpirationSeconds": 1800,
    "attachmentData": "base64-pdf-data"
  }
}
```

### With Deduplication Disabled

```json
{
  "id": "process-no-dedup",
  "nodeType": "attachment-handler",
  "parameters": {
    "messageId": "msg-321",
    "filename": "backup.tar.gz",
    "size": 524288000,
    "enableDeduplication": false,
    "attachmentData": "base64-tar-data"
  }
}
```

## Error Handling

### Validation Errors

| Code | Cause | Resolution |
|------|-------|-----------|
| `INVALID_PARAMS` | Missing/invalid messageId, filename, or size | Provide all required parameters with correct types |
| `SIZE_LIMIT_EXCEEDED` | File exceeds maxSize limit | Increase maxSize or reduce file size |
| `SECURITY_VIOLATION` | Dangerous filename or MIME type | Use safe file extensions and MIME types |
| `INVALID_MIME_TYPE` | Unknown/dangerous MIME type | Provide valid MIME type or let auto-detection handle it |
| `STORAGE_ERROR` | Blob storage write failed | Check S3/filesystem permissions and quota |

### Runtime Errors

```json
{
  "status": "error",
  "error": "Dangerous filename detected: malware.exe",
  "errorCode": "SECURITY_VIOLATION",
  "timestamp": 1706030400000,
  "duration": 15
}
```

## Virus Scanning Integration

### ClamAV (On-Premises)

Store in environment:
```bash
CLAMAV_ENDPOINT=clamav.internal:3310
```

Plugin will connect and scan async.

### VirusTotal (Cloud)

Configure in workflow:
```json
{
  "virusScanEndpoint": "https://www.virustotal.com/api/v3/files",
  "enableVirusScan": true
}
```

Create API key in VirusTotal console.

### Scan Status Tracking

| Status | Meaning |
|--------|---------|
| `clean` | Scanned and safe (or low-risk file type skipped scanning) |
| `pending` | Scan queued, result not yet available |
| `suspicious` | Potential issues detected, review recommended |
| `infected` | Malware/virus detected, quarantine recommended |
| `skipped` | Scanning disabled for this attachment |

## Performance Considerations

### Memory Efficiency
- **Streaming Upload**: Uses `BlobStorage.uploadStream()` for files > 10MB
- **Presigned URLs**: No direct data transfer, only metadata
- **Deduplication**: Single storage for identical content

### Concurrency
- **Non-blocking**: Virus scans queued asynchronously
- **Parallel Processing**: Multiple attachments processed independently
- **Isolation**: Tenant data isolated automatically

### Storage Optimization
- **Deduplication**: Multiple identical files link to single blob
- **Content Hashing**: SHA256 enables fast lookup
- **Retention Policy**: Automatic expiration after 90 days

## Database Integration

### EmailAttachment Entity

```typescript
{
  id: string;                    // UUID
  tenantId: string;              // Multi-tenant isolation
  messageId: string;             // FK to EmailMessage
  filename: string;              // Original filename
  mimeType: string;              // Detected MIME type
  size: number;                  // Bytes
  storageKey: string;            // Blob storage location
  contentHash: string;           // SHA256 for dedup
  virusScanStatus: string;       // clean|pending|suspicious|infected|skipped
  virusScanDetails?: string;     // Scan report
  isDeleted: boolean;            // Soft delete flag
  deletedAt?: number;            // Deletion timestamp
  retentionExpiresAt: number;    // Auto-purge after 90 days
  createdAt: number;
  updatedAt: number;
}
```

### Storage Path Structure

```
attachments/
├── {tenantId}/
│   ├── {messageId}/
│   │   ├── {contentHash}/
│   │   │   ├── 1706030400000-filename1.pdf
│   │   │   ├── 1706030500000-filename2.docx
│   │   ├── {contentHash}/
│   │   │   └── 1706030600000-duplicate.pdf  ← Same content, different name
```

## Building

```bash
npm run build      # Compile TypeScript to dist/
npm run test       # Run test suite
npm run lint       # Check code quality
npm run type-check # Type validation
```

## Installation

Add to workflow `package.json`:

```json
{
  "devDependencies": {
    "@metabuilder/workflow-plugin-attachment-handler": "workspace:*"
  }
}
```

Update email plugins workspace:

```json
{
  "name": "@metabuilder/workflow-plugins-email",
  "workspaces": [
    "imap-sync",
    "imap-search",
    "attachment-handler"
  ]
}
```

Update email index.ts export:

```typescript
export {
  attachmentHandlerExecutor,
  AttachmentHandlerExecutor,
  type AttachmentHandlerConfig,
  type AttachmentHandlerResult
} from './attachment-handler/src/index';
```

## Testing

Comprehensive test suite (95+ test cases):

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Coverage Areas**:
- ✓ Node metadata and configuration
- ✓ Parameter validation (all constraints)
- ✓ Filename security checks
- ✓ Size limits and constraints
- ✓ MIME type detection
- ✓ Dangerous content blocking
- ✓ Successful processing
- ✓ Error handling and codes
- ✓ Virus scanning integration
- ✓ Deduplication support
- ✓ Multi-tenant isolation
- ✓ URL expiration
- ✓ Edge cases (special chars, tiny/large files, concurrent)

## Related Components

- **IMAP Sync Plugin**: `../imap-sync/` - Fetch emails with attachments
- **Email Message Entity**: `dbal/shared/api/schema/entities/packages/email-message.yaml`
- **Attachment Entity**: `dbal/shared/api/schema/entities/packages/email-attachment.yaml`
- **Blob Storage**: `dbal/development/src/blob/` - S3/filesystem backends
- **Workflow Engine**: `../../../executor/` - Node execution runtime

## Architecture

```
Workflow Node
    ↓
AttachmentHandlerExecutor.execute()
    ↓
┌─────────────────────────────────────┐
│ Validation                          │
│ - Filename security check           │
│ - Size limits                       │
│ - MIME type validation              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Processing                          │
│ - Content hash calculation          │
│ - Deduplication lookup              │
│ - Blob storage upload (stream)      │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Security                            │
│ - Virus scan queue (async)          │
│ - Dangerous content check           │
│ - Presigned URL generation          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Storage                             │
│ - EmailAttachment entity insert     │
│ - Metadata tracking                 │
│ - Retention policy setup            │
└─────────────────────────────────────┘
    ↓
AttachmentHandlerResult
    ├── attachmentId (UUID)
    ├── presignedUrl (signed S3/FS link)
    ├── virusScanStatus (pending/clean/infected)
    └── processingTime (metrics)
```

## Phase 6 Integration

This plugin is **Phase 6** of email client implementation:

1. Phase 1: Email entity schemas (DBAL)
2. Phase 2: Redux state slices
3. Phase 3: Custom hooks
4. Phase 4: FakeMUI components
5. Phase 5: IMAP sync & search
6. **Phase 6: Attachment handling** ← You are here
7. Phase 7: Email compose & send
8. Phase 8: Full email client bootloader

## Next Steps

After attachment handling:
- Phase 7: Email compose workflow (SMTP send plugin)
- Phase 8: Email client bootloader integration
- Full UI: Display attachments with presigned URLs

## See Also

- Plugin Registry: `/workflow/plugins/ts/email-plugins.ts`
- Email Send: `/workflow/plugins/ts/integration/email/smtp-send/`
- IMAP Sync: `/workflow/plugins/ts/integration/email/imap-sync/`
- Email Parser: `/workflow/plugins/ts/integration/email/email-parser/`
