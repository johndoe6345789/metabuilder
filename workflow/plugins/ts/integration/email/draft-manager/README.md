# Draft Manager - Phase 6 Email Plugin

Comprehensive email draft lifecycle management with auto-save, recovery, and bulk operations.

## Overview

The Draft Manager executor handles all aspects of email draft management in the MetaBuilder email client:

- **Auto-save**: Automatically persist draft state to IndexedDB with conflict detection
- **Concurrent Edit Handling**: Version-based conflict detection and resolution
- **Draft Recovery**: Recover unsaved drafts after browser crashes or reconnection
- **Bulk Operations**: Export draft bundles with compression and import with conflict handling
- **Multi-tenant Isolation**: Enforce tenant/user boundaries on all operations
- **Attachment Tracking**: Manage file metadata and storage impact

## Features

### 1. Auto-Save with Conflict Detection

```typescript
{
  "action": "auto-save",
  "accountId": "gmail-work-123",
  "draft": {
    "draftId": "draft-xyz",
    "subject": "Important Email",
    "body": "Email content here",
    "to": [{ "address": "recipient@example.com", "name": "John Doe" }],
    "cc": [],
    "bcc": [],
    "attachments": [
      {
        "id": "attach-1",
        "filename": "document.pdf",
        "mimeType": "application/pdf",
        "size": 2048576,
        "uploadedAt": 1704067200000
      }
    ]
  },
  "autoSaveInterval": 5000,
  "maxDraftSize": 26214400,
  "enableCompression": true,
  "deviceId": "desktop-001"
}
```

**Response**:
```json
{
  "status": "success",
  "output": {
    "actionPerformed": "auto-save",
    "draft": {
      "draftId": "draft-xyz",
      "accountId": "gmail-work-123",
      "tenantId": "tenant-acme",
      "userId": "user-456",
      "subject": "Important Email",
      "body": "Email content here",
      "to": [{"address": "recipient@example.com", "name": "John Doe"}],
      "cc": [],
      "bcc": [],
      "attachments": [{...}],
      "isDirty": false,
      "lastSavedAt": 1704153600000,
      "lastModifiedAt": 1704153600000,
      "version": 2,
      "syncToken": "sync-token-xyz"
    },
    "saveMetadata": {
      "saveId": "save-123",
      "draftId": "draft-xyz",
      "savedAt": 1704153600000,
      "device": "desktop-001",
      "changesSummary": {
        "fieldsChanged": ["subject", "body"],
        "attachmentsAdded": 1,
        "attachmentsRemoved": 0,
        "bytesAdded": 15234
      }
    },
    "conflictDetected": false,
    "stats": {
      "operationDuration": 42,
      "itemsAffected": 1,
      "storageUsed": 45678
    }
  },
  "timestamp": 1704153600000,
  "duration": 42
}
```

**Conflict Resolution** (when `conflictDetected: true`):
- `local-wins`: Keep local version (device with newer timestamp)
- `remote-wins`: Use server/last-saved version
- `merge`: Combine changes (recipients merged, content from local)

### 2. Concurrent Edit Handling

Multiple devices can edit the same draft. Conflicts are detected using:
- **Version number**: Incremented on each save
- **Timestamp**: Last modification time
- **Device ID**: Identifies source of edit

Example conflict scenario:
```
Device 1 saves: version 1 → version 2 (at t1)
Device 2 tries save: version 1 → version 2 (at t2, t2 > t1)
Result: Conflict detected, resolution applied based on recoveryOptions.preferLocal
```

### 3. Draft Recovery

Recover drafts after browser crash or reconnection:

```typescript
{
  "action": "recover",
  "accountId": "gmail-work-123",
  "draftId": "draft-xyz",
  "recoveryOptions": {
    "preferLocal": true,
    "preserveAttachments": true,
    "maxRecoveryAge": 3600000  // 1 hour
  }
}
```

**Response**:
```json
{
  "status": "success",
  "output": {
    "actionPerformed": "recover",
    "draft": {...},
    "recovery": {
      "draftId": "draft-xyz",
      "recoveredAt": 1704153600000,
      "recoveryReason": "reconnection",
      "lastKnownState": {...},
      "autoRecovered": true,
      "userConfirmationRequired": false
    },
    "conflictDetected": false,
    "stats": {
      "operationDuration": 5,
      "itemsAffected": 1,
      "storageUsed": 45678
    }
  }
}
```

Recovery reasons:
- `reconnection`: Browser came back online
- `browser-crash`: Detected incomplete save
- `manual-recovery`: User requested recovery

### 4. Export Draft Bundles

Export all drafts for an account with optional compression:

```typescript
{
  "action": "export",
  "accountId": "gmail-work-123",
  "enableCompression": true
}
```

**Response**:
```json
{
  "status": "success",
  "output": {
    "actionPerformed": "export",
    "bundle": {
      "bundleId": "bundle-xyz",
      "exportedAt": 1704153600000,
      "drafts": [
        {
          "draftId": "draft-1",
          "subject": "Draft 1",
          "body": "Content",
          ...
        },
        {
          "draftId": "draft-2",
          "subject": "Draft 2",
          ...
        }
      ],
      "metadata": {
        "count": 2,
        "totalSize": 456789,
        "compressionRatio": 0.3,
        "format": "gzip"
      }
    },
    "stats": {
      "operationDuration": 125,
      "itemsAffected": 2,
      "storageUsed": 456789,
      "compressionSavings": 319952
    }
  }
}
```

### 5. Import Draft Bundles

Import drafts from bundle with conflict detection:

```typescript
{
  "action": "import",
  "accountId": "gmail-work-123",
  "bundleData": {
    "bundleId": "bundle-xyz",
    "exportedAt": 1704153600000,
    "drafts": [...],
    "metadata": {...}
  },
  "recoveryOptions": {
    "preferLocal": true
  }
}
```

Import behavior:
- Drafts are imported with updated `tenantId` and `userId` for security
- Conflicting drafts (same `draftId`) use `preferLocal` strategy
- All attachments are preserved unless `preserveAttachments: false`
- Import maintains draft version history

### 6. List and Get Drafts

List all drafts for an account:

```typescript
{
  "action": "list",
  "accountId": "gmail-work-123"
}
```

Get single draft by ID:

```typescript
{
  "action": "get",
  "accountId": "gmail-work-123",
  "draftId": "draft-xyz"
}
```

### 7. Delete Drafts

Delete draft and free storage:

```typescript
{
  "action": "delete",
  "accountId": "gmail-work-123",
  "draftId": "draft-xyz"
}
```

Response shows storage freed:
```json
{
  "status": "success",
  "output": {
    "actionPerformed": "delete",
    "conflictDetected": false,
    "stats": {
      "operationDuration": 3,
      "itemsAffected": 1,
      "storageUsed": -45678  // Negative = freed
    }
  }
}
```

## Data Model

### DraftState
```typescript
interface DraftState {
  draftId: string;                    // Unique draft identifier
  accountId: string;                  // Email account (FK to EmailClient)
  tenantId: string;                   // Multi-tenant isolation
  userId: string;                     // Draft owner
  subject: string;                    // Email subject
  body: string;                       // Plain text body
  bodyHtml?: string;                  // HTML body (optional)
  to: EmailRecipient[];               // Primary recipients
  cc: EmailRecipient[];               // Carbon copy recipients
  bcc: EmailRecipient[];              // Blind carbon copy
  attachments: AttachmentMetadata[];  // File attachments
  isDirty: boolean;                   // Unsaved changes flag
  lastSavedAt: number;                // Last save timestamp
  lastModifiedAt: number;             // Last modification timestamp
  version: number;                    // Conflict detection version
  syncToken?: string;                 // Server sync token
  scheduledSendTime?: number;         // Scheduled send time (optional)
  tags?: string[];                    // Draft tags/labels
  references?: string;                // Message-ID for reply/forward
}
```

### DraftSaveMetadata
Tracks each save operation:
```typescript
interface DraftSaveMetadata {
  saveId: string;                     // Unique save operation ID
  draftId: string;                    // Associated draft
  savedAt: number;                    // Timestamp
  device: string;                     // Device identifier
  changesSummary: {
    fieldsChanged: string[];          // Changed field names
    attachmentsAdded: number;         // New attachments
    attachmentsRemoved: number;       // Removed attachments
    bytesAdded: number;               // Storage impact
  };
  conflict?: {
    remoteVersion: number;            // Remote draft version
    remoteModifiedAt: number;         // Remote modification time
    resolutionStrategy: string;       // How conflict was resolved
  };
}
```

### DraftRecovery
Recovery operation metadata:
```typescript
interface DraftRecovery {
  draftId: string;                    // Recovered draft
  recoveredAt: number;                // Recovery timestamp
  recoveryReason: string;             // Why recovery occurred
  lastKnownState: DraftState;         // Recovered state
  autoRecovered: boolean;             // Was it automatic?
  userConfirmationRequired: boolean;  // User approval needed?
}
```

### DraftBundle
For export/import operations:
```typescript
interface DraftBundle {
  bundleId: string;                   // Unique bundle identifier
  exportedAt: number;                 // Export timestamp
  drafts: DraftState[];               // Bundled drafts
  metadata: {
    count: number;                    // Number of drafts
    totalSize: number;                // Uncompressed size (bytes)
    compressionRatio: number;         // Ratio after compression
    format: string;                   // 'json' | 'jsonl' | 'gzip'
  };
}
```

## Storage Model (IndexedDB)

The plugin uses IndexedDB for browser-side persistence:

```
Database: metabuilder_email_[tenantId]
├── Stores:
│   ├── drafts
│   │   └── Indexes: draftId (primary), accountId, userId, lastSavedAt
│   ├── draft_saves
│   │   └── Indexes: draftId, saveId, savedAt, device
│   └── draft_attachments
│       └── Indexes: draftId, attachmentId
```

## Validation Rules

### Auto-Save
- `action`: Required, must be 'auto-save'
- `accountId`: Required, string UUID
- `draft`: Required, object with at least `subject` or `body`
- `autoSaveInterval`: Optional, 1000-60000ms
- `maxDraftSize`: Optional, minimum 1MB (1048576 bytes)

### Recover/Delete/Get
- `draftId`: Required, string UUID
- `accountId`: Required, string UUID

### Import
- `bundleData`: Required, valid DraftBundle
- `bundleData.drafts`: Array of DraftState objects

### General
- `deviceId`: Optional, string (defaults to 'unknown')
- `enableCompression`: Optional, boolean (default: true)

## Error Codes

| Code | Meaning |
|------|---------|
| `DRAFT_MANAGER_ERROR` | Generic plugin error |
| `VALIDATION_ERROR` | Invalid parameters |
| `STORAGE_ERROR` | IndexedDB or storage quota exceeded |
| `CONFLICT_ERROR` | Unresolvable conflict detected |
| `RECOVERY_ERROR` | Recovery operation failed |

## Security

### Multi-Tenant Isolation
All operations enforce tenant and user boundaries:
- Drafts are filtered by `tenantId` on list/get
- Delete operations verify `tenantId` and `userId` match
- Import operations override `tenantId`/`userId` for security

### Access Control
- Users can only access their own drafts
- Cross-tenant access is rejected with "Unauthorized" error
- No draft data leaks between tenants

### Attachment Handling
- Attachments stored separately with metadata only
- Blob URLs generated for preview (temporary, revoked after use)
- Actual blob storage handled by separate attachment service

## Performance

### Optimization Strategies
- **List response**: Body field cleared for smaller payloads
- **Compression**: Drafts compressed with gzip (70% average savings)
- **Conflict detection**: Timestamp + version-based, no deep comparison
- **In-memory cache**: Recent drafts cached for fast access

### Storage Limits
- Default max draft size: 25MB
- Total per account: Depends on browser storage quota (typically 50GB)
- Attachment count: No hard limit, but storage-constrained

### Benchmarks (Simulated)
- Auto-save: ~42ms average
- List (10 drafts): ~15ms
- Export (100 drafts): ~125ms
- Import (100 drafts): ~180ms
- Recovery: ~5ms

## Integration Example

### Workflow Definition

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "compose-draft",
      "type": "draft-manager",
      "nodeType": "draft-manager",
      "parameters": {
        "action": "auto-save",
        "accountId": "{{ $json.accountId }}",
        "draft": {
          "draftId": "{{ $json.draftId }}",
          "subject": "{{ $json.subject }}",
          "body": "{{ $json.body }}",
          "to": "{{ $json.recipients }}",
          "cc": [],
          "bcc": [],
          "attachments": "{{ $json.attachments }}"
        },
        "autoSaveInterval": 5000,
        "deviceId": "{{ $json.deviceId }}"
      }
    },
    {
      "id": "handle-error",
      "type": "condition",
      "condition": "{{ compose-draft.output.conflictDetected }}",
      "then": [
        {
          "id": "recover-draft",
          "type": "draft-manager",
          "nodeType": "draft-manager",
          "parameters": {
            "action": "recover",
            "accountId": "{{ $json.accountId }}",
            "draftId": "{{ compose-draft.output.draft.draftId }}",
            "recoveryOptions": {
              "preferLocal": true
            }
          }
        }
      ]
    }
  ]
}
```

## Testing

Run tests with Jest:

```bash
npm test

# Run specific test suite
npm test -- --testNamePattern="Test Case 1"

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

Test coverage includes:
- All 7 draft actions (auto-save, recover, delete, export, import, list, get)
- Conflict detection and resolution
- Multi-tenant isolation
- Attachment handling
- Recovery scenarios
- Storage enforcement
- Edge cases (empty body, scheduled sends, tags, references)

## Future Enhancements

1. **Server Synchronization**: Sync drafts to backend with bi-directional updates
2. **Collaborative Editing**: Real-time collaboration on shared drafts
3. **Draft History**: Maintain version history with rollback support
4. **Template Support**: Save draft templates for quick composition
5. **AI Suggestions**: Draft completions and subject line suggestions
6. **Attachment Preview**: In-line preview of images and documents
7. **Full-Text Search**: Search across draft content
8. **Smart Recovery**: ML-based recovery suggestion ranking

## See Also

- [IMAP Sync Plugin](../imap-sync/README.md)
- [IMAP Search Plugin](../imap-search/README.md)
- [Email Parser Plugin](../email-parser/README.md)
- [Workflow Script Specification](../../../README.md)
