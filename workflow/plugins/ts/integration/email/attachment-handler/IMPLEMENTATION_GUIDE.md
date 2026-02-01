# Attachment Handler Plugin - Implementation Guide

## Overview

This document provides detailed implementation guidance for integrating the Attachment Handler plugin into the email client and backend services.

## Architecture Overview

```
Email Client UI (Next.js)
    ↓
IMAP Sync Plugin (fetches email + attachment refs)
    ↓
Workflow Engine (orchestrates attachment processing)
    ↓
┌─────────────────────────────────────────┐
│ Attachment Handler Plugin (Phase 6)     │
├─────────────────────────────────────────┤
│ 1. Validate filename & size             │
│ 2. Detect MIME type                     │
│ 3. Calculate SHA256 hash                │
│ 4. Check deduplication                  │
│ 5. Stream to blob storage               │
│ 6. Queue virus scan                     │
│ 7. Generate presigned URL               │
│ 8. Save EmailAttachment record          │
└─────────────────────────────────────────┘
    ↓
Blob Storage (S3 or Filesystem)
Virus Scanner (ClamAV or VirusTotal)
Database (EmailAttachment entity)
```

## Integration Points

### 1. DBAL Layer Integration

The plugin must integrate with TenantAwareBlobStorage for multi-tenant safety:

```typescript
// In AttachmentHandlerExecutor._processAttachment()
import { TenantAwareBlobStorage } from '@metabuilder/dbal/blob/providers/tenant-aware-storage';

// Get blob storage instance (tenant-aware)
const blobStorage = new TenantAwareBlobStorage(
  baseStorage,    // S3Storage or FilesystemStorage
  tenantManager,
  context.tenantId,
  context.userId
);

// Stream large files
const metadata = await blobStorage.uploadStream(
  storageKey,
  attachmentStream,
  config.size,
  {
    contentType: mimeType,
    metadata: {
      messageId: config.messageId,
      filename: config.filename,
      contentHash: contentHash
    }
  }
);
```

### 2. Database Integration

Store attachment metadata in EmailAttachment entity:

```typescript
// In AttachmentHandlerExecutor._processAttachment()
import { getDBALClient } from '@metabuilder/dbal';

const db = getDBALClient();

// Create EmailAttachment record
const attachment = await db.emailAttachments.create({
  tenantId: context.tenantId,
  messageId: config.messageId,
  filename: config.filename,
  mimeType: mimeType,
  size: config.size,
  storageKey: storageKey,
  contentHash: contentHash,
  virusScanStatus: virusScanStatus,
  isDeleted: false,
  retentionExpiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000
});
```

### 3. Virus Scanning Integration

Queue attachment for scanning via workflow engine:

```typescript
// In AttachmentHandlerExecutor._queueVirusScan()
import { WorkflowQueueClient } from '@metabuilder/workflow';

const queue = new WorkflowQueueClient();

if (config.enableVirusScan && isDangerousType(config.filename)) {
  // Queue scan workflow
  await queue.enqueue({
    workflowId: 'scan-attachment',
    priority: 'high',
    payload: {
      attachmentId: attachmentId,
      storageKey: storageKey,
      endpoint: config.virusScanEndpoint
    },
    delayMs: 0  // Immediate
  });
}
```

### 4. Presigned URL Generation

Generate secure download URLs via blob storage:

```typescript
// In AttachmentHandlerExecutor._generatePresignedUrl()
const presignedUrl = await blobStorage.generatePresignedUrl(
  storageKey,
  config.urlExpirationSeconds ?? 3600
);

// URL format depends on backend:
// S3:        https://bucket.s3.amazonaws.com/path?AWSAccessKeyId=...
// Filesystem: /api/v1/attachments/download/{storageKey}?sig=...&expires=...
```

### 5. Deduplication Logic

Check for existing attachments with same content hash:

```typescript
// In AttachmentHandlerExecutor._processAttachment()
if (config.enableDeduplication) {
  // Look up existing attachment by content hash
  const existing = await db.emailAttachments.findFirst({
    where: {
      tenantId: context.tenantId,
      contentHash: contentHash,
      isDeleted: false
    }
  });

  if (existing) {
    // Link to existing instead of re-storing
    isDeduplicated = true;
    storageKey = existing.storageKey;
    // Don't re-upload to blob storage
  }
}
```

## Backend Services

### Email Service (Python Flask)

Add attachment download endpoint:

```python
# services/email_service/app.py
from flask import Flask, send_file, abort
from datetime import datetime

app = Flask(__name__)

@app.route('/api/v1/attachments/download/<path:storage_key>')
def download_attachment(storage_key):
    """Download attachment via presigned URL."""
    # Verify signature
    signature = request.args.get('sig')
    expires = request.args.get('expires', type=int)

    if not verify_signature(storage_key, signature, expires):
        abort(403)

    if datetime.now().timestamp() * 1000 > expires:
        abort(403)  # URL expired

    # Get from blob storage
    blob = blob_storage.download(storage_key)

    # Get metadata for filename
    metadata = blob_storage.get_metadata(storage_key)

    return send_file(
        blob,
        mimetype=metadata.content_type,
        as_attachment=True,
        download_name=extract_filename(storage_key)
    )


@app.route('/api/v1/attachments/<attachment_id>')
def get_attachment_metadata(attachment_id):
    """Get attachment metadata."""
    attachment = db.query(EmailAttachment).filter_by(
        id=attachment_id,
        tenant_id=request.tenant_id,
        is_deleted=False
    ).first()

    if not attachment:
        abort(404)

    return jsonify({
        'id': attachment.id,
        'filename': attachment.filename,
        'mimeType': attachment.mime_type,
        'size': attachment.size,
        'contentHash': attachment.content_hash,
        'virusScanStatus': attachment.virus_scan_status,
        'createdAt': attachment.created_at.timestamp() * 1000
    })


@app.route('/api/v1/attachments/<attachment_id>/scan-status', methods=['GET'])
def get_scan_status(attachment_id):
    """Get virus scan status for attachment."""
    attachment = db.query(EmailAttachment).filter_by(
        id=attachment_id,
        tenant_id=request.tenant_id
    ).first()

    if not attachment:
        abort(404)

    return jsonify({
        'status': attachment.virus_scan_status,
        'details': attachment.virus_scan_details,
        'scannedAt': attachment.virus_scan_at
    })
```

### Virus Scanning Service

ClamAV integration:

```python
# services/email_service/scanner.py
import pyclamd
from celery import shared_task

ac = pyclamd.ClamAsyncScan(
    host='clamav.internal',
    port=3310,
    timeout=30
)

@shared_task
def scan_attachment_clamav(attachment_id, storage_key):
    """Scan attachment with ClamAV."""
    try:
        # Download from blob storage
        blob = blob_storage.download(storage_key)

        # Scan with ClamAV
        result = ac.scan_stream(blob)

        # Update database
        if result:
            status = 'infected' if result.get('FOUND') else 'clean'
            details = result.get('FOUND', 'No threats')
        else:
            status = 'clean'
            details = 'Clean'

        attachment = db.query(EmailAttachment).filter_by(id=attachment_id).first()
        if attachment:
            attachment.virus_scan_status = status
            attachment.virus_scan_details = details
            attachment.virus_scan_at = datetime.utcnow()
            db.commit()
    except Exception as e:
        logger.error(f'ClamAV scan failed: {e}')
        attachment.virus_scan_status = 'error'
        attachment.virus_scan_details = str(e)
        db.commit()
```

VirusTotal integration:

```python
# services/email_service/virustotal_scanner.py
import requests
from celery import shared_task

VT_API_KEY = os.getenv('VIRUSTOTAL_API_KEY')

@shared_task
def scan_attachment_virustotal(attachment_id, storage_key):
    """Scan attachment with VirusTotal."""
    try:
        # Download from blob storage
        blob = blob_storage.download(storage_key)

        # Submit to VirusTotal
        files = {'file': blob}
        headers = {'x-apikey': VT_API_KEY}

        response = requests.post(
            'https://www.virustotal.com/api/v3/files',
            files=files,
            headers=headers,
            timeout=30
        )

        if response.status_code != 200:
            raise Exception(f'VT API error: {response.status_code}')

        file_id = response.json()['data']['id']

        # Poll for results (with backoff)
        for attempt in range(10):
            time.sleep(2 ** attempt)  # Exponential backoff

            result = requests.get(
                f'https://www.virustotal.com/api/v3/files/{file_id}',
                headers=headers
            )

            if result.status_code == 200:
                data = result.json()['data']['attributes']
                stats = data['last_analysis_stats']

                if stats['undetected'] == data['last_analysis_results']:
                    status = 'clean'
                elif stats['suspicious'] > 0:
                    status = 'suspicious'
                elif stats['malicious'] > 0:
                    status = 'infected'
                else:
                    status = 'clean'

                details = f"VT: {stats['malicious']}M {stats['suspicious']}S {stats['undetected']}U"
                break

        # Update database
        attachment = db.query(EmailAttachment).filter_by(id=attachment_id).first()
        if attachment:
            attachment.virus_scan_status = status
            attachment.virus_scan_details = details
            attachment.virus_scan_at = datetime.utcnow()
            db.commit()
    except Exception as e:
        logger.error(f'VirusTotal scan failed: {e}')
        attachment.virus_scan_status = 'error'
        attachment.virus_scan_details = str(e)
        db.commit()
```

## Frontend Integration

### React Hook for Attachment Display

```typescript
// hooks/email/useEmailAttachments.ts
import { useCallback, useState } from 'react';

export function useEmailAttachments(messageId: string) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch attachments for message
  const fetchAttachments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/emails/${messageId}/attachments`);
      if (!response.ok) throw new Error('Failed to fetch attachments');

      const data = await response.json();
      setAttachments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  // Download attachment
  const downloadAttachment = useCallback(async (attachment: any) => {
    try {
      // Use presigned URL from response
      window.open(attachment.presignedUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    }
  }, []);

  // Check scan status
  const checkScanStatus = useCallback(async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/v1/attachments/${attachmentId}/scan-status`);
      if (!response.ok) throw new Error('Failed to fetch scan status');

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  return {
    attachments,
    loading,
    error,
    fetchAttachments,
    downloadAttachment,
    checkScanStatus
  };
}
```

### FakeMUI Component for Attachment List

```typescript
// fakemui/react/components/email/AttachmentListComponent.tsx
import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Chip
} from '@metabuilder/fakemui';

export function AttachmentListComponent({
  attachments,
  onDownload,
  onCheckStatus
}: {
  attachments: any[];
  onDownload: (att: any) => void;
  onCheckStatus: (id: string) => void;
}) {
  if (attachments.length === 0) {
    return <Typography color="textSecondary">No attachments</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Attachments ({attachments.length})
      </Typography>

      <List dense>
        {attachments.map((attachment) => (
          <ListItem
            key={attachment.id}
            secondaryAction={
              <Chip
                label={attachment.virusScanStatus}
                size="small"
                color={
                  attachment.virusScanStatus === 'clean'
                    ? 'success'
                    : attachment.virusScanStatus === 'infected'
                    ? 'error'
                    : 'warning'
                }
              />
            }
          >
            <ListItemButton
              onClick={() => onDownload(attachment)}
              sx={{ flex: 1 }}
            >
              <ListItemIcon>
                {/* Icon based on MIME type */}
              </ListItemIcon>
              <ListItemText
                primary={attachment.filename}
                secondary={`${(attachment.size / 1024).toFixed(1)} KB`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
```

## Configuration

### Environment Variables

```bash
# Blob Storage
BLOB_STORAGE_TYPE=s3  # or 'filesystem'
AWS_S3_BUCKET=metabuilder-attachments
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Virus Scanning
ENABLE_VIRUS_SCAN=true
CLAMAV_HOST=clamav.internal
CLAMAV_PORT=3310
VIRUSTOTAL_API_KEY=...

# Attachment Limits
MAX_ATTACHMENT_SIZE=52428800  # 50MB
ATTACHMENT_RETENTION_DAYS=90

# URL Expiration
PRESIGNED_URL_EXPIRATION_SECONDS=3600  # 1 hour
```

### Workflow Configuration

```json
{
  "id": "process-email-attachments",
  "version": "1.0.0",
  "nodes": [
    {
      "id": "imap-sync",
      "nodeType": "imap-sync",
      "parameters": {
        "imapId": "{{ context.emailAccountId }}",
        "folderId": "{{ context.folderId }}",
        "maxMessages": 100
      }
    },
    {
      "id": "for-each-attachment",
      "nodeType": "loop",
      "parameters": {
        "items": "{{ $json.syncedMessages[*].attachments[] }}"
      },
      "children": [
        {
          "id": "handle-attachment",
          "nodeType": "attachment-handler",
          "parameters": {
            "messageId": "{{ $json.messageId }}",
            "filename": "{{ $json.attachment.filename }}",
            "mimeType": "{{ $json.attachment.mimeType }}",
            "size": "{{ $json.attachment.size }}",
            "attachmentData": "{{ $json.attachment.data }}",
            "enableVirusScan": true,
            "urlExpirationSeconds": 3600
          }
        }
      ]
    }
  ]
}
```

## Testing Strategy

### Unit Tests (95+ cases)

```bash
npm run test                 # All tests
npm run test -- --coverage  # Coverage report
npm run test -- --watch     # Watch mode
```

**Key test areas**:
- Configuration validation
- Filename security checks
- Size constraints
- MIME type detection
- Dangerous content blocking
- Successful processing
- Error handling
- Virus scanning
- Deduplication
- Multi-tenant isolation
- Presigned URL generation
- Edge cases

### Integration Tests

```typescript
// tests/integration/attachment-handler.integration.test.ts
import { IMAPSyncExecutor } from '@metabuilder/workflow-plugin-imap-sync';
import { AttachmentHandlerExecutor } from '@metabuilder/workflow-plugin-attachment-handler';

describe('Email Attachment Workflow', () => {
  it('should sync email with attachment and process it', async () => {
    // 1. Sync email from IMAP
    const syncResult = await imapSync.execute(syncNode, context, state);

    // 2. Extract attachments from sync result
    const messages = syncResult.output.data.syncedMessages;

    // 3. Process each attachment
    for (const message of messages) {
      for (const attachment of message.attachments || []) {
        const handleNode = {
          nodeType: 'attachment-handler',
          parameters: {
            messageId: message.messageId,
            filename: attachment.filename,
            size: attachment.size,
            attachmentData: attachment.data
          }
        };

        const result = await attachmentHandler.execute(
          handleNode,
          context,
          state
        );

        // Verify processing
        expect(result.status).toBe('success');
        expect(result.output.data.presignedUrl).toBeDefined();
        expect(result.output.data.virusScanStatus).toBeDefined();
      }
    }
  });
});
```

### Performance Tests

```typescript
// tests/performance/attachment-handler.perf.test.ts
describe('Attachment Handler Performance', () => {
  it('should handle 100 attachments in < 5 seconds', async () => {
    const attachments = Array.from({ length: 100 }, (_, i) => ({
      messageId: `msg-${i}`,
      filename: `file-${i}.pdf`,
      size: 1024 * 100  // 100KB each
    }));

    const start = performance.now();

    await Promise.all(
      attachments.map(att =>
        executor.execute(createNode(att), context, state)
      )
    );

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  it('should handle 1GB file with streaming', async () => {
    const largeFile = {
      messageId: 'msg-large',
      filename: 'large-file.zip',
      size: 1024 * 1024 * 1024  // 1GB
    };

    const start = performance.now();
    const result = await executor.execute(createNode(largeFile), context, state);
    const duration = performance.now() - start;

    expect(result.status).toBe('success');
    expect(duration).toBeLessThan(30000);  // Should complete in < 30 seconds
  });
});
```

## Deployment

### Docker Compose Setup

```yaml
# docker-compose.yml
services:
  email-service:
    build: ./services/email_service
    environment:
      - BLOB_STORAGE_TYPE=s3
      - AWS_S3_BUCKET=metabuilder-attachments
      - ENABLE_VIRUS_SCAN=true
      - CLAMAV_HOST=clamav
    depends_on:
      - clamav
      - s3
      - postgres

  clamav:
    image: clamav/clamav:latest
    ports:
      - "3310:3310"

  s3:
    image: localstack/localstack:latest
    environment:
      - SERVICES=s3
      - DEBUG=1
    ports:
      - "4566:4566"

  workflow:
    build: .
    environment:
      - DATABASE_URL=postgres://postgres:password@postgres:5432/metabuilder
      - BLOB_STORAGE_TYPE=s3
      - AWS_S3_BUCKET=metabuilder-attachments
    depends_on:
      - email-service
      - postgres
      - s3
```

## Monitoring & Observability

### Metrics to Track

```typescript
// Emit metrics after attachment processing
interface AttachmentMetrics {
  attachmentId: string;
  processingTime: number;           // milliseconds
  fileSize: number;                 // bytes
  mimeType: string;
  virusScanStatus: string;
  isDeduplicated: boolean;
  storageBackend: string;           // s3, filesystem
  tenantId: string;
}

// Log structured data
logger.info('attachment_processed', {
  ...metrics,
  timestamp: Date.now()
});
```

### Logging

```bash
# Enable debug logging
DEBUG=workflow:attachment-handler npm run dev

# Watch for errors
tail -f logs/attachment-handler.error.log
```

## Security Checklist

- [ ] MIME type validation enabled
- [ ] Dangerous extensions blocked
- [ ] File size limits enforced
- [ ] Virus scanning configured
- [ ] Presigned URLs have expiration
- [ ] Multi-tenant isolation verified
- [ ] Blob storage credentials secured
- [ ] Content hash deduplication enabled
- [ ] Soft delete enabled with retention policy
- [ ] Access logs enabled for downloads
- [ ] Encrypted at rest (S3 SSE-S3)
- [ ] Encrypted in transit (HTTPS/TLS)

## Troubleshooting

### Common Issues

**Issue**: "Dangerous filename detected"
**Solution**: Check DANGEROUS_EXTENSIONS list, may need to adjust for your organization

**Issue**: "Size exceeds maximum"
**Solution**: Increase maxSize parameter or split large attachments

**Issue**: "Virus scan pending indefinitely"
**Solution**: Check CLAMAV_HOST/VIRUSTOTAL_API_KEY configuration

**Issue**: "Presigned URL expired"
**Solution**: Increase urlExpirationSeconds parameter

**Issue**: "Deduplication not working"
**Solution**: Ensure enableDeduplication is true and database query is correct

## Future Enhancements

- [ ] Encryption at rest for sensitive attachments
- [ ] Attachment compression before storage
- [ ] OCR for document attachments
- [ ] Preview generation for images/PDFs
- [ ] Retention policy automation
- [ ] Attachment search indexing
- [ ] Download quota enforcement
- [ ] Attachment versioning

## References

- DBAL Blob Storage: `dbal/development/src/blob/`
- Email Entity Schema: `dbal/shared/api/schema/entities/packages/email-attachment.yaml`
- Workflow Engine: `workflow/executor/`
- Test Suite: `src/index.test.ts`
