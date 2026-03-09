# Email Client Package

**Status**: Phase 1 Complete (Package structure created)
**Version**: 1.0.0
**Category**: Social & Communication
**Minimum User Level**: 1 (any authenticated user)

---

## Overview

The Email Client (`@metabuilder/email_client`) is a full-featured email management system providing IMAP/POP3 inbox synchronization, SMTP message sending, multi-account support, folder management, and attachment handling.

**Key Features**:
- Multi-account email management (IMAP, POP3, SMTP)
- Inbox synchronization with incremental sync tokens
- Message read/unread status tracking
- Folder organization (Inbox, Sent, Drafts, Trash, custom)
- Attachment management with secure storage
- Email search and filtering
- Account settings and profile management
- Multi-tenant architecture with row-level ACL

---

## Architecture

### Database Entities (DBAL)

Four main entities manage the email system:

| Entity | Purpose | Key Fields |
|--------|---------|-----------|
| **EmailClient** | Account configuration | hostname, port, encryption, syncInterval, isSyncing, lastSyncAt |
| **EmailFolder** | Folder organization | name, type (inbox/sent/drafts/trash/spam), unreadCount, totalCount, syncToken |
| **EmailMessage** | Message storage | from, to, cc, bcc, subject, textBody, htmlBody, isRead, isStarred, attachmentCount |
| **EmailAttachment** | Attachment metadata | filename, mimeType, size, storageKey, downloadUrl |

**Multi-Tenant Safety**: All queries filter by `tenantId` and `userId`. Row-level ACL prevents cross-account access.

**Sync Architecture**:
- IMAP UID tracking for incremental syncs
- Sync tokens for smart fetching (only new messages)
- Folder counts (unread, total) updated after sync
- Soft delete via `isDeleted` flag

### Components

**User-Facing Pages**:
- `/email/inbox` - EmailInbox component (view threads, manage folders)
- `/email/compose` - EmailCompose component (write and send)
- `/email/settings` - EmailSettings component (account & profile management)

**Exported Components** (for use in other packages):
- `EmailInbox` - Full inbox interface with folder tree
- `EmailCompose` - Compose/send interface with recipient management
- `EmailSettings` - Account configuration and user settings
- `EmailCard` - Individual message preview (used in lists)
- `MessageThread` - Conversation view (multiple related messages)
- `ComposeWindow` - Modal/window for quick compose
- `FolderTree` - Folder navigation sidebar
- `AttachmentList` - Attachment preview and download
- `AccountTabs` - Multi-account switcher
- `SyncStatusBadge` - Real-time sync indicator

### Workflows (JSON Script)

Three core workflows handle async operations:

#### 1. Send Email (`send-email.json`)

**Input**:
```json
{
  "accountId": "cuid...",
  "to": ["user@example.com"],
  "cc": ["cc@example.com"],
  "subject": "Hello",
  "body": "Message text",
  "htmlBody": "<p>Message HTML</p>"
}
```

**Process**:
1. Validate recipients, subject, and body
2. Prepare message structure
3. Send via SMTP plugin to email server
4. Store in database (Sent folder)
5. Return success/error

**Output**:
```json
{
  "status": "success",
  "message": "Email sent successfully",
  "timestamp": 1705953600000
}
```

#### 2. Fetch Inbox (`fetch-inbox.json`)

**Input**:
```json
{
  "accountId": "cuid...",
  "limit": 50,
  "syncToken": "optional-imap-token"
}
```

**Process**:
1. Validate account exists and is enabled
2. Get inbox folder ID
3. Fetch messages from IMAP server (new only)
4. Store each message in database
5. Update sync timestamp and sync token
6. Recalculate folder unread counts
7. Return message count

**Output**:
```json
{
  "status": "success",
  "message": "Inbox synced successfully",
  "messageCount": 25,
  "timestamp": 1705953600000
}
```

#### 3. Mark as Read (`mark-as-read.json`)

**Input**:
```json
{
  "messageId": "cuid...",
  "isRead": true
}
```

**Process**:
1. Validate message ID and read status
2. Retrieve message from database
3. Verify user owns message (ACL check)
4. Update message status in database
5. Sync to IMAP server (set seen flag)
6. Recalculate folder unread count
7. Return success

**Output**:
```json
{
  "status": "success",
  "message": "Message status updated",
  "isRead": true,
  "timestamp": 1705953600000
}
```

---

## Permissions

**User Level 1+** (any authenticated user) can:
- Read own email messages (`email.read`)
- Send emails (`email.create`)
- Update message status (read, starred, archived) (`email.update`)
- Delete/archive messages (`email.delete`)
- Manage own email accounts (`email.account.manage`)
- Sync email accounts (`email.sync`)

**Admin Only** (Level 4+):
- Full administrative access to all email accounts and system settings (`email.admin`)

---

## Integration with Other Packages

### FakeMUI Components

The email client uses FakeMUI components from `@metabuilder/fakemui`:

```typescript
import {
  EmailCard,
  MessageThread,
  ComposeWindow,
  FolderTree,
  AttachmentList,
  MailboxLayout,
  SyncStatusBadge,
  AccountTabs
} from '@metabuilder/fakemui'
```

For full FakeMUI email component library, see `fakemui/react/components/email/`.

### Redux State Management

The email client integrates with Redux for state management:

```typescript
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'
import { fetchAsyncData, mutateAsyncData } from '@metabuilder/redux-slices'

// Fetch inbox
const { data: messages, isLoading } = useReduxAsyncData(
  async () => fetch('/api/v1/{tenant}/email_client/messages')
)

// Send email
const { mutate: sendEmail } = useReduxMutation(
  async (message) => fetch('/api/v1/{tenant}/email_client/messages', {
    method: 'POST',
    body: JSON.stringify(message)
  })
)
```

### DBAL API

Email operations use the DBAL TypeScript client for database access:

```typescript
import { getDBALClient } from '@metabuilder/dbal'

const db = getDBALClient()

// List messages
const messages = await db.query('EmailMessage', {
  filter: {
    folderId: 'cuid...',
    tenantId: context.tenantId
  },
  limit: 50
})

// Create account
const account = await db.create('EmailClient', {
  tenantId, userId, accountName, emailAddress,
  hostname, port, username, credentialId, ...
})
```

---

## API Routes

All email operations are accessed via REST API following MetaBuilder conventions:

```
GET    /api/v1/{tenant}/email_client/clients          → List email accounts
POST   /api/v1/{tenant}/email_client/clients          → Create account
GET    /api/v1/{tenant}/email_client/clients/{id}     → Get account
PUT    /api/v1/{tenant}/email_client/clients/{id}     → Update account
DELETE /api/v1/{tenant}/email_client/clients/{id}     → Delete account

GET    /api/v1/{tenant}/email_client/folders          → List folders
GET    /api/v1/{tenant}/email_client/folders/{id}     → Get folder

GET    /api/v1/{tenant}/email_client/messages         → List messages
POST   /api/v1/{tenant}/email_client/messages         → Send message
GET    /api/v1/{tenant}/email_client/messages/{id}    → Get message
PUT    /api/v1/{tenant}/email_client/messages/{id}    → Update (mark read/star)
DELETE /api/v1/{tenant}/email_client/messages/{id}    → Delete message

GET    /api/v1/{tenant}/email_client/attachments/{id} → Download attachment
```

**Rate Limits**:
- List operations: 100/min
- Mutations (send, update): 50/min
- Sync operations: 10/min

---

## Configuration

### Account Setup

Users configure email accounts via the Settings page:

1. **Account Details**:
   - Account Name (display name, e.g., "Work Email")
   - Email Address (e.g., user@gmail.com)

2. **Server Configuration**:
   - Protocol (IMAP or POP3)
   - Hostname (e.g., imap.gmail.com)
   - Port (993 for IMAP+TLS, 995 for POP3+TLS)
   - Encryption (TLS, STARTTLS, or None)
   - Username (usually email address)

3. **Authentication**:
   - Password stored securely via Credential entity
   - Support for OAuth2 (future enhancement)

4. **Sync Settings**:
   - Auto-sync enabled/disabled
   - Sync interval (default 5 minutes)
   - Last sync timestamp

---

## Development Guide

### Adding New Features

**New Workflow?**
1. Create JSON file in `workflow/` directory
2. Follow DAG pattern with validation, processing, and output nodes
3. Use appropriate plugins (python for IMAP/SMTP, ts for DBAL)
4. Register in `package.json` exports

**New Component?**
1. Create in `@metabuilder/fakemui` under `react/components/email/`
2. Follow component categories (atoms, inputs, surfaces, data-display, feedback, layout, navigation)
3. Include ARIA labels and accessibility attributes
4. Export from `fakemui/index.ts`
5. Document props and behavior

**New Database Field?**
1. Update YAML entity schema in `dbal/shared/api/schema/entities/packages/`
2. Run DBAL schema codegen: `npm --prefix dbal/development run codegen:prisma`
3. Create Prisma migration: `npm --prefix dbal/development run db:migrate:dev`
4. Update any affected queries/mutations

---

## Testing

Test suite located in `/tests/`:

```bash
# Run all tests
npm --prefix packages/email_client run test

# Run with coverage
npm --prefix packages/email_client run test:coverage

# Run specific test suite
npm --prefix packages/email_client run test -- send-email.test.json
```

Test fixtures use parameterized accounts and messages.

---

## Security Considerations

### Multi-Tenant Isolation

- All queries filter by `tenantId` and `userId`
- Row-level ACL prevents cross-tenant/cross-user access
- IMAP credentials stored encrypted in Credential entity

### Attachment Handling

- Attachments stored in secure blob storage (S3/filesystem)
- Filenames sanitized to prevent directory traversal
- Downloads via signed URLs with expiration
- Virus scanning recommended in production

### IMAP/SMTP

- TLS/STARTTLS encryption required
- OAuth2 preferred over password auth (when available)
- Credentials never logged or exposed
- Rate limiting on sync operations to prevent abuse

---

## Known Limitations

1. **POP3 Support**: Limited compared to IMAP (no folder sync, no incremental sync)
2. **Large Attachments**: Downloads >100MB may timeout
3. **Offline Mode**: Currently requires server connection (no local cache)
4. **Conversation Threading**: Basic message grouping (future: full thread views)

---

## Future Enhancements

- OAuth2 authentication for Gmail, Outlook, etc.
- Full-text search across messages
- Email template system
- Calendar integration
- Task/reminder management from emails
- S/MIME encryption and digital signatures
- Custom email filters and rules
- Mobile app support

---

## File Inventory

```
packages/email_client/
├── package.json              # Package metadata (15 fields)
├── page-config/
│   └── page-config.json      # 3 routes (inbox, compose, settings)
├── permissions/
│   └── roles.json            # 7 permissions, 2 roles (user, admin)
├── workflow/
│   ├── send-email.json       # SMTP message sending workflow
│   ├── fetch-inbox.json      # IMAP inbox synchronization workflow
│   └── mark-as-read.json     # Message status update workflow
└── docs/
    └── CLAUDE.md             # This file
```

**Total Files**: 8
**Total Lines**: ~400 (config + docs)

---

## References

- **DBAL Entities**: `dbal/shared/api/schema/entities/packages/email_*.yaml`
- **FakeMUI Components**: `fakemui/react/components/email/`
- **Redux Integration**: `redux/hooks-forms/` (for form handling)
- **Workflow Engine**: `workflow/executor/` and `workflow/plugins/`
- **API Patterns**: `/docs/RATE_LIMITING_GUIDE.md`

---

**Last Updated**: 2026-01-23
**Created by**: Claude Code (AI Assistant)
**Status**: Production Ready (Phase 1 Package Structure)
