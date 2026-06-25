# Draft Manager - Quick Start Guide

## Installation

```bash
cd workflow/plugins/ts/integration/email/draft-manager
npm install
npm run build
```

## Basic Usage

### 1. Auto-Save a Draft

```typescript
import { draftManagerExecutor } from '@metabuilder/workflow-plugin-draft-manager'

const result = await draftManagerExecutor.execute(
  {
    id: 'node-1',
    type: 'draft-manager',
    nodeType: 'draft-manager',
    parameters: {
      action: 'auto-save',
      accountId: 'gmail-work-123',
      draft: {
        subject: 'Hello',
        body: 'This is my draft',
        to: [{ address: 'recipient@example.com' }],
        cc: [],
        bcc: [],
        attachments: []
      },
      autoSaveInterval: 5000
    }
  },
  {
    executionId: 'exec-123',
    tenantId: 'tenant-acme',
    userId: 'user-456',
    triggerData: {},
    variables: {}
  },
  {}
)

if (result.status === 'success') {
  const draft = result.output.draft
  console.log(`Draft saved: ${draft.draftId}`)
  console.log(`Version: ${draft.version}`)
}
```

### 2. Handle Conflicts

```typescript
if (result.output.conflictDetected) {
  console.log('Conflict resolution applied:', result.output.conflictResolution?.strategy)
}
```

### 3. Recover Draft

```typescript
const recoveryResult = await draftManagerExecutor.execute(
  {
    parameters: {
      action: 'recover',
      accountId: 'gmail-work-123',
      draftId: 'draft-xyz',
      recoveryOptions: { preferLocal: true }
    }
  },
  // ... context and state
)

if (recoveryResult.output.recovery?.autoRecovered) {
  console.log('Draft auto-recovered')
} else if (recoveryResult.output.recovery?.userConfirmationRequired) {
  console.log('User approval needed')
}
```

### 4. Export Drafts

```typescript
const exportResult = await draftManagerExecutor.execute(
  {
    parameters: {
      action: 'export',
      accountId: 'gmail-work-123',
      enableCompression: true
    }
  },
  // ... context and state
)

const bundle = exportResult.output.bundle
console.log(`Exported ${bundle.metadata.count} drafts`)
console.log(`Saved ${bundle.metadata.compressionSavings} bytes with compression`)
```

### 5. Import Drafts

```typescript
const importResult = await draftManagerExecutor.execute(
  {
    parameters: {
      action: 'import',
      accountId: 'gmail-new',
      bundleData: bundle,
      recoveryOptions: { preferLocal: true }
    }
  },
  // ... context and state
)

console.log(`Imported ${importResult.output.stats.itemsAffected} drafts`)
if (importResult.output.conflictDetected) {
  console.log('Some drafts had conflicts')
}
```

### 6. List Drafts

```typescript
const listResult = await draftManagerExecutor.execute(
  {
    parameters: {
      action: 'list',
      accountId: 'gmail-work-123'
    }
  },
  // ... context and state
)

console.log(`Found ${listResult.output.drafts?.length} drafts`)
```

### 7. Get Single Draft

```typescript
const getResult = await draftManagerExecutor.execute(
  {
    parameters: {
      action: 'get',
      accountId: 'gmail-work-123',
      draftId: 'draft-xyz'
    }
  },
  // ... context and state
)

const draft = getResult.output.draft
console.log(`Subject: ${draft?.subject}`)
console.log(`Recipients: ${draft?.to.map(r => r.address).join(', ')}`)
```

### 8. Delete Draft

```typescript
const deleteResult = await draftManagerExecutor.execute(
  {
    parameters: {
      action: 'delete',
      accountId: 'gmail-work-123',
      draftId: 'draft-xyz'
    }
  },
  // ... context and state
)

console.log(`Storage freed: ${Math.abs(deleteResult.output.stats.storageUsed)} bytes`)
```

## Workflow Integration

```json
{
  "version": "2.2.0",
  "nodes": [
    {
      "id": "auto-save-draft",
      "type": "draft-manager",
      "parameters": {
        "action": "auto-save",
        "accountId": "{{ $json.accountId }}",
        "draft": {
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
      "id": "check-conflict",
      "type": "condition",
      "condition": "{{ auto-save-draft.output.conflictDetected }}",
      "then": [
        {
          "id": "recover",
          "type": "draft-manager",
          "parameters": {
            "action": "recover",
            "accountId": "{{ $json.accountId }}",
            "draftId": "{{ auto-save-draft.output.draft.draftId }}"
          }
        }
      ]
    }
  ]
}
```

## Common Error Handling

```typescript
try {
  const result = await draftManagerExecutor.execute(node, context, state)

  if (result.status === 'error') {
    switch (result.errorCode) {
      case 'VALIDATION_ERROR':
        console.error('Invalid parameters:', result.error)
        break
      case 'CONFLICT_ERROR':
        console.error('Conflict resolution failed:', result.error)
        break
      case 'STORAGE_ERROR':
        console.error('Storage limit exceeded:', result.error)
        break
      default:
        console.error('Unknown error:', result.error)
    }
  }
} catch (err) {
  console.error('Execution failed:', err)
}
```

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="Auto-Save"

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Performance Tips

1. **Auto-save interval**: Use 5000ms (5 seconds) for responsive feel
2. **Batch operations**: List all drafts once, then get individual ones
3. **Compression**: Enable for export/import to save bandwidth
4. **Max draft size**: Keep under 25MB, split large content
5. **Device ID**: Always provide for conflict tracking

## Data Models

### Required in Auto-Save

```typescript
{
  subject: string        // Email subject
  body: string          // Email body
  to: EmailRecipient[]  // Recipients
  cc: EmailRecipient[]  // CC recipients
  bcc: EmailRecipient[] // BCC recipients
  attachments: []       // Attachment metadata
}
```

### Optional in Auto-Save

```typescript
{
  draftId?: string              // Explicit draft ID
  bodyHtml?: string             // HTML version
  scheduledSendTime?: number    // For scheduled sends
  tags?: string[]               // Draft tags
  references?: string           // Message-ID for threading
}
```

## Common Workflows

### Scenario: User composes email with auto-save

1. User types subject → auto-save
2. User types body → auto-save (conflict check)
3. User adds recipient → auto-save
4. User browser crashes
5. On reconnection → auto-recover with conflict resolution
6. User sends email → delete draft

### Scenario: Multi-device sync

1. Device A saves draft v1 at t1
2. Device B saves draft v1 at t2 (t2 > t1)
3. System detects conflict
4. Resolves using preferLocal strategy
5. Device A's data wins (earlier timestamp)
6. On next list, both devices see merged version

### Scenario: Backup and restore

1. Export all drafts to bundle (with compression)
2. Save bundle to cloud storage
3. On new device, import bundle
4. All drafts available with conflict handling

## Troubleshooting

**Q: Draft not found**
A: Verify draftId exists and tenantId matches

**Q: Conflict always detected**
A: Ensure you're sending current version from get/list

**Q: Storage limit exceeded**
A: Increase maxDraftSize or reduce draft content

**Q: Attachments missing after import**
A: Set preserveAttachments: true in recoveryOptions

**Q: Multi-tenant access denied**
A: Verify context.tenantId matches draft ownership

## For More Details

- See `README.md` for complete feature documentation
- See `IMPLEMENTATION_GUIDE.md` for architecture details
- Review `src/index.test.ts` for implementation examples
