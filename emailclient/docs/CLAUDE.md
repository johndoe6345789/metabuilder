# Email Client - Development Guide

**Last Updated:** 2026-01-23
**Status:** Bootloader Complete (Phase 8.1)
**Scope:** Minimal Next.js bootloader for email_client package

## Overview

This document guides development of the Email Client bootloader and integration with the `email_client` package.

### Architecture

```
emailclient/                      # Bootloader (this directory)
├── app/                         # Next.js app
│   ├── page.tsx                # Main page - loads email_client package
│   ├── layout.tsx              # Redux provider + global styles
│   └── globals.css             # Tailored email client styles
├── docker-compose.yml          # Services: Postfix, Dovecot, Redis, Flask
├── .env.example                # Configuration template
└── README.md                   # User guide

packages/email_client/           # Package (loaded by bootloader)
├── components/ui.json          # Email UI component definitions
├── page-config/               # Declarative page layouts
├── permissions/roles.json      # Email-specific RBAC
├── workflows/                 # Email sync/send/compose workflows
└── redux/                     # Email-specific Redux slices
```

## Development Workflow

### 1. Local Setup

```bash
# Install dependencies
npm install

# Copy environment
cp .env.example .env.local

# Start services
docker-compose up -d

# Start dev server
npm run dev
```

Visit `http://localhost:3000` - should load email_client package from packages/email_client/.

### 2. Package Integration

The bootloader (`app/page.tsx`) does three things:

1. **Load Package Metadata** - Fetches `packages/email_client/package.json`
2. **Load Page Config** - Fetches `packages/email_client/page-config/`
3. **Render Components** - Maps JSON config to FakeMUI components

Example flow:

```typescript
// 1. Load metadata
GET /api/v1/packages/email_client/metadata
→ { id: 'email_client', name: 'Email Client', version: '1.0.0', ... }

// 2. Load page config
GET /api/v1/packages/email_client/page-config
→ { type: 'MailboxLayout', props: { ... }, children: [...] }

// 3. Render in React
<RenderComponent component={pageConfig} />
```

### 3. Redux Integration

Redux store is configured in `app/layout.tsx`:

```typescript
const store = configureStore({
  reducer: {
    ...coreReducers,  // Auth, projects, workspace, workflow, nodes, asyncData
    // Add email-specific slices from packages/email_client/redux/
  }
})
```

Email slices to add in Phase 3:

- `emailAccountsSlice` - List of email accounts
- `emailFoldersSlice` - Folder hierarchy per account
- `emailMessagesSlice` - Message list with pagination
- `emailSyncSlice` - Sync status and progress
- `emailComposeSlice` - Compose form state

### 4. Component Hierarchy

Components are imported from `@metabuilder/fakemui`:

```typescript
// Email-specific components (created in Phase 2)
import {
  EmailCard,
  FolderTree,
  MailboxLayout,
  ComposeWindow,
  SyncStatusBadge,
  AttachmentList
} from '@metabuilder/fakemui'

// Core FakeMUI components
import {
  Box,
  Button,
  TextField,
  Card,
  Drawer,
  Tab,
  Tabs
} from '@metabuilder/fakemui'
```

## Service Architecture

### Postfix (SMTP Relay)

**Port:** 25 (clear), 587 (TLS)

Handles email delivery. Configure in `.env.local`:

```
POSTFIX_HOST=postfix
POSTFIX_PORT=25
POSTFIX_TLS_ENABLED=false
```

Test:

```bash
docker-compose exec postfix postfix status
```

### Dovecot (IMAP/POP3)

**Ports:** 143 (IMAP), 993 (IMAP+TLS), 110 (POP3), 995 (POP3+TLS)

Stores emails. Configure:

```
DOVECOT_HOST=dovecot
DOVECOT_IMAP_PORT=143
DOVECOT_IMAP_TLS_PORT=993
```

Test:

```bash
# Create test account
docker-compose exec dovecot adduser test@example.com

# Connect
openssl s_client -connect localhost:993
a login test@example.com password
b list "" "*"
c select INBOX
d fetch 1 body
```

### Redis Cache

**Port:** 6379

Caches sync state, user sessions, rate limits. No configuration needed.

### Flask Email Service

**Port:** 5000

Python microservice implementing IMAP/SMTP operations.

Endpoints:

```
POST /sync/start              # Start email sync
GET  /sync/status             # Check sync progress
POST /send                    # Send email
GET  /messages/{accountId}    # List messages
POST /messages/{id}/mark-read # Update message flags
```

### PostgreSQL

**Port:** 5432

Metadata store for email accounts, messages, folders.

## API Routing

The email client uses standard DBAL routing:

```
GET    /api/v1/{tenant}/email_client/accounts
POST   /api/v1/{tenant}/email_client/accounts
GET    /api/v1/{tenant}/email_client/accounts/{id}
PUT    /api/v1/{tenant}/email_client/accounts/{id}
DELETE /api/v1/{tenant}/email_client/accounts/{id}

GET    /api/v1/{tenant}/email_client/folders
GET    /api/v1/{tenant}/email_client/messages
POST   /api/v1/{tenant}/email_client/messages/send
PUT    /api/v1/{tenant}/email_client/messages/{id}

GET    /api/v1/{tenant}/email_client/attachments/{id}/download
```

## State Management

### Redux Slices (Phase 3)

```typescript
// email_client package will provide:
import {
  emailAccountsSlice,      // { accounts: EmailAccount[], loading, error }
  emailFoldersSlice,       // { folders: EmailFolder[], selectedFolder }
  emailMessagesSlice,      // { messages: EmailMessage[], pagination }
  emailSyncSlice,          // { isSyncing, progress, status }
  emailComposeSlice        // { to, cc, bcc, subject, body, attachments }
} from '@metabuilder/redux-slices'

// Use in components:
import { useAppDispatch, useAppSelector } from '@metabuilder/redux-core'

export function EmailList() {
  const dispatch = useAppDispatch()
  const { messages, loading } = useAppSelector(state => state.emailMessages)

  useEffect(() => {
    dispatch(fetchEmailMessages({ accountId, folderId }))
  }, [accountId, folderId])
}
```

### Async Data Hooks (Phase 3)

```typescript
// Use useReduxAsyncData for email operations:
import { useReduxAsyncData, useReduxMutation } from '@metabuilder/api-clients'

export function SyncEmails({ accountId }) {
  const { data: status, refetch } = useReduxAsyncData(
    async () => {
      const res = await fetch(`/api/v1/{tenant}/email_client/sync/${accountId}/status`)
      return res.json()
    },
    { refetchInterval: 5000 }  // Poll every 5 seconds
  )

  const { mutate: startSync } = useReduxMutation(
    async () => {
      const res = await fetch(`/api/v1/{tenant}/email_client/sync/${accountId}`, {
        method: 'POST'
      })
      return res.json()
    },
    { onSuccess: () => refetch() }
  )

  return (
    <div>
      <p>Sync status: {status?.status}</p>
      <button onClick={() => startSync()}>Sync Now</button>
    </div>
  )
}
```

## Component Pattern

All email components use FakeMUI + data-testid for accessibility:

```typescript
// Email card component
<EmailCard
  from="sender@example.com"
  subject="Hello"
  preview="This is a test email"
  receivedAt={Date.now()}
  isRead={false}
  isStarred={false}
  onSelect={() => openEmail(id)}
  onToggleRead={(isRead) => updateReadStatus(id, isRead)}
  onToggleStar={(starred) => updateStarred(id, starred)}
  data-testid="email-card-123"  // Accessibility
/>
```

## Testing

### Unit Tests

```bash
npm run test
```

Test email components in `__tests__/` directory.

### E2E Tests

```bash
npm run test:e2e
```

Test workflows:
- Create email account
- Receive email (mock)
- Send email
- Mark as read/unread
- Delete email

Example test:

```typescript
// tests/email-workflow.spec.ts
test('user can create account and receive email', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // Create account
  await page.click('text=Add Account')
  await page.fill('input[placeholder="Email Address"]', 'test@example.com')
  await page.fill('input[placeholder="Password"]', 'password123')
  await page.click('button:has-text("Connect")')

  // Wait for sync
  await page.waitForSelector('text=Inbox')

  // Should show empty inbox initially
  const emailCount = await page.locator('[data-testid="email-card"]').count()
  expect(emailCount).toBe(0)
})
```

## Debugging

### Redux DevTools

Install Redux DevTools browser extension. Inspect email state:

```
Redux → Actions filter: emailAccounts, emailMessages, emailSync
```

### Network Tab

Monitor API calls:

```
GET  /api/v1/{tenant}/email_client/accounts
POST /api/v1/{tenant}/email_client/accounts/{id}/sync
GET  /api/v1/{tenant}/email_client/messages?accountId=...&folderId=...
```

### Console Logging

App logs with prefix `[emailclient]`:

```typescript
console.log('[emailclient] Syncing account:', accountId)
console.error('[emailclient] Sync failed:', error)
```

### Docker Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f email-service
docker-compose logs -f postfix
docker-compose logs -f dovecot
```

## Performance Optimization

### 1. Message Virtualization

For large email lists, use React virtualization:

```typescript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
>
  {({ index, style }) => (
    <EmailCard style={style} {...messages[index]} />
  )}
</FixedSizeList>
```

### 2. Request Deduplication

`useReduxAsyncData` automatically deduplicates concurrent requests to same endpoint.

### 3. Lazy Loading

Load attachments on demand:

```typescript
const { data: attachment } = useReduxAsyncData(
  async () => {
    const res = await fetch(`/api/v1/{tenant}/email_client/attachments/${id}`)
    return res.blob()
  },
  { enabled: isExpanded }  // Only fetch if expanded
)
```

## Security

### Multi-Tenant Safety

All API queries must include tenantId filter - enforced in DBAL:

```typescript
// DBAL ensures this in row_level ACL:
// "emailClientId IN (SELECT id FROM EmailClient WHERE userId = $user.id AND tenantId = $context.tenantId)"
```

### Rate Limiting

Email operations have rate limits:

```
Sync start:        5 per minute per account
Message send:     10 per minute per account
List operations: 100 per minute per tenant
```

### Attachment Validation

Attachments are scanned on upload:

- Max size: 25 MB (configurable)
- Blocked MIME types: executable, script
- Virus scan: Integration with ClamAV (future)

## Troubleshooting

### Email Sync Not Working

1. Check service status:
   ```bash
   docker-compose ps
   ```

2. Check Dovecot logs:
   ```bash
   docker-compose logs dovecot | grep -i error
   ```

3. Test IMAP connection:
   ```bash
   openssl s_client -connect localhost:993
   ```

4. Check Flask logs:
   ```bash
   docker-compose logs email-service | grep -i error
   ```

### Docker Services Down

Restart:

```bash
docker-compose restart
```

Or full reset:

```bash
docker-compose down -v  # Remove volumes
docker-compose up -d
```

### Redux State Not Updating

1. Check Redux DevTools for action dispatch
2. Check console for errors
3. Verify API response in Network tab
4. Check DBAL ACL (multi-tenant filtering)

## Next Steps

After bootloader (Phase 8.1) is complete:

- **Phase 3:** Redux slices for email state
- **Phase 4:** Custom hooks for email operations
- **Phase 5:** Email package component definitions
- **Phase 6:** Email workflow plugins (sync, send)
- **Phase 7:** Flask email service
- **Phase 8:** Full integration testing

## References

- [Root CLAUDE.md](../../CLAUDE.md) - Project-wide guide
- [Packages Guide](../../docs/PACKAGES_INVENTORY.md) - Package system
- [DBAL Guide](../../dbal/CLAUDE.md) - Database layer
- [Workflow Guide](../../workflow/README.md) - Workflow engine
- [FakeMUI Guide](../../fakemui/STRUCTURE.md) - Component library
