# Email Operation Plugins

Email synchronization and search plugins for MetaBuilder workflow engine.

## Plugins

### imap-sync

Performs incremental synchronization of emails from IMAP servers.

**Inputs:**
- `imapId` (string, required) - UUID of email account configuration
- `folderId` (string, required) - UUID of email folder to sync
- `syncToken` (string, optional) - IMAP sync token from previous sync
- `maxMessages` (number, optional, default: 100) - Maximum messages to sync per execution

**Outputs:**
- `status` (string) - 'synced' or 'error'
- `data` (object) - Contains:
  - `syncedCount`: Number of messages synced
  - `errors`: Array of sync errors
  - `newSyncToken`: Updated sync token for next execution
  - `lastSyncAt`: Timestamp of sync completion

**Usage:**
```json
{
  "id": "sync-inbox",
  "nodeType": "imap-sync",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "maxMessages": 50
  }
}
```

### imap-search (Phase 6)

Executes IMAP SEARCH commands with full-text search capabilities and complex query support.

**Features:**
- Full-text search: from, to, subject, body, date ranges, flags
- Complex queries: AND/OR/NOT logical operators
- Structured criteria objects or raw IMAP SEARCH strings
- Folder-specific searches returning UID lists
- Empty result handling with zero-length arrays
- RFC 3501 (IMAP4rev1) compliant SEARCH command building
- Result pagination with offset/limit
- Result sorting by UID, date, from, subject, or size

**Inputs:**
- `imapId` (string, required) - UUID of email account configuration (FK to EmailClient)
- `folderId` (string, required) - UUID of email folder to search (FK to EmailFolder)
- `criteria` (string | SearchCriteria, required) - Raw IMAP SEARCH string or structured criteria object
- `limit` (number, optional, default: 100, range: 1-1000) - Maximum results to return
- `offset` (number, optional, default: 0) - Result pagination offset
- `sortBy` (string, optional, default: 'uid') - Sort field: 'uid', 'date', 'from', 'subject', 'size'
- `descending` (boolean, optional, default: false) - Reverse sort order

**Outputs:**
- `status` (string) - 'success' or 'error'
- `output.status` (string) - 'found' or 'no-results'
- `output.data` (object) - SearchResult containing:
  - `uids`: Array of message UIDs (empty array if no matches)
  - `totalCount`: Total matching messages (may exceed limit)
  - `criteria`: Converted IMAP SEARCH command string
  - `executedAt`: Timestamp of search execution
  - `isLimited`: Whether result was limited by limit parameter
  - `executionDuration`: Search duration in milliseconds

**SearchCriteria Object (Structured Queries):**
```typescript
{
  // Address searches
  from?: string;              // FROM header email address
  to?: string;                // TO/CC/BCC headers
  cc?: string;                // CC header only
  bcc?: string;               // BCC header only

  // Content searches
  subject?: string;           // Subject line
  body?: string;              // Message body
  text?: string;              // Full text (entire message)

  // Size constraints
  minSize?: number;           // Minimum size in bytes
  maxSize?: number;           // Maximum size in bytes

  // Date range
  since?: string;             // Start date (ISO 8601 or DD-Mon-YYYY)
  before?: string;            // End date (ISO 8601 or DD-Mon-YYYY)

  // Flag states
  answered?: boolean;         // Message answered flag
  flagged?: boolean;          // Message flagged for follow-up
  deleted?: boolean;          // Message deleted flag
  draft?: boolean;            // Message draft flag
  seen?: boolean;             // Message read/seen flag
  recent?: boolean;           // Message recent flag

  // Advanced
  keywords?: string[];        // Custom IMAP keywords
  rawCriteria?: string;       // Additional raw IMAP criteria
  operator?: 'AND' | 'OR';    // Logical operator (default: AND)
}
```

**IMAP Search Criteria Keywords (Raw Strings):**
- Logical: ALL, AND, OR, NOT
- Flags: ANSWERED, FLAGGED, DELETED, DRAFT, SEEN, RECENT, NEW, OLD
- Negated: UNANSWERED, UNFLAGGED, UNDELETED, UNDRAFT, UNSEEN
- Search: FROM, TO, CC, BCC, SUBJECT, BODY, TEXT, HEADER
- Size: LARGER, SMALLER
- Date: SINCE, BEFORE, ON
- Other: UID, KEYWORD, UNKEYWORD

**Simple Query Examples:**

```json
{
  "id": "find-unread",
  "nodeType": "imap-search",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "criteria": "UNSEEN",
    "limit": 50
  }
}
```

```json
{
  "id": "find-from-user",
  "nodeType": "imap-search",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "criteria": {
      "from": "alice@example.com"
    },
    "limit": 100
  }
}
```

**Complex Query Examples:**

```json
{
  "id": "find-urgent-from-boss",
  "nodeType": "imap-search",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "criteria": {
      "from": "boss@example.com",
      "subject": "urgent",
      "flagged": true,
      "operator": "AND"
    }
  }
}
```

```json
{
  "id": "find-monthly-reports",
  "nodeType": "imap-search",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "criteria": {
      "since": "2026-01-01",
      "before": "2026-01-31",
      "from": "reports@company.com",
      "subject": "monthly",
      "operator": "AND"
    },
    "sortBy": "date",
    "descending": true
  }
}
```

```json
{
  "id": "find-large-attachments",
  "nodeType": "imap-search",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "criteria": {
      "minSize": 5000000,
      "maxSize": 50000000
    },
    "limit": 25
  }
}
```

**Raw IMAP String Examples:**

```json
{
  "id": "complex-raw-search",
  "nodeType": "imap-search",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "criteria": "FROM \"alice@example.com\" OR FROM \"bob@example.com\" SINCE 01-Jan-2026 UNFLAGGED"
  }
}
```

**Empty Result Handling:**

The plugin gracefully handles searches with no matching messages:
- Returns `status: 'success'` even when `uids: []`
- Output status is `'no-results'` when totalCount === 0
- All result fields are valid (totalCount, criteria, timestamps, etc.)
- Pagination with offset beyond result set returns empty array

### pop3-sync (Phase 6)

Performs email synchronization from POP3 servers (legacy mail support).

**Features:**
- POP3 protocol implementation (RFC 1939) with stateless interactions
- Download complete messages (no incremental sync)
- Message deletion marking with DELE command
- No folder support (inbox only - POP3 limitation)
- Connection pooling and TLS encryption support
- Error recovery with exponential backoff retry
- Transaction tracking with unique session IDs
- Server statistics and partial sync metrics

**Inputs:**
- `pop3Id` (string, required) - UUID of email account configuration (FK to EmailClient)
- `server` (string, required) - POP3 server hostname or IP address
- `port` (number, required) - POP3 server port (typically 110 or 995)
- `username` (string, required) - Username for authentication
- `useTls` (boolean, optional, default: true) - Use TLS encryption (port 995)
- `maxMessages` (number, optional, default: 100) - Maximum messages to download (1-500)
- `markForDeletion` (boolean, optional, default: true) - Mark messages for deletion after download
- `retryCount` (number, optional, default: 2) - Retry attempts for network failures (0-3)
- `timeout` (number, optional, default: 30000) - Connection timeout in milliseconds (5000-300000)

**Outputs:**
- `status` (string) - 'synced', 'partial', or 'error'
- `output.status` (string) - 'synced', 'partial', or error description
- `output.data` (object) - POP3SyncData containing:
  - `downloadedCount`: Number of messages successfully downloaded
  - `markedForDeletion`: Number of messages marked for deletion
  - `errors`: Array of sync errors with error codes
  - `syncedAt`: Timestamp of sync completion
  - `sessionId`: Unique session ID for transaction tracking
  - `serverStats`: Server statistics (totalMessages, totalBytes, bytesDownloaded)
  - `isComplete`: Whether sync covered all messages on server
  - `nextMessageNumber`: Next message to fetch (for partial sync resumption)

**POP3 Server Examples:**
- Gmail: `pop.gmail.com:995` (TLS required)
- Outlook: `pop-mail.outlook.com:995` (TLS required)
- AOL: `pop.aol.com:110` (no TLS)
- Yahoo: `pop.mail.yahoo.com:995` (TLS required)

**Usage Examples:**

Basic sync:
```json
{
  "id": "sync-legacy-mail",
  "nodeType": "pop3-sync",
  "parameters": {
    "pop3Id": "acme-pop3-account-id",
    "server": "pop.gmail.com",
    "port": 995,
    "username": "user@gmail.com",
    "useTls": true,
    "maxMessages": 100
  }
}
```

Without deletion:
```json
{
  "id": "download-only",
  "nodeType": "pop3-sync",
  "parameters": {
    "pop3Id": "acme-account-id",
    "server": "mail.example.com",
    "port": 110,
    "username": "user@example.com",
    "useTls": false,
    "markForDeletion": false,
    "maxMessages": 50
  }
}
```

With custom timeout:
```json
{
  "id": "sync-with-timeout",
  "nodeType": "pop3-sync",
  "parameters": {
    "pop3Id": "acme-account-id",
    "server": "slow.mail.server",
    "port": 995,
    "username": "user@example.com",
    "timeout": 60000,
    "retryCount": 3
  }
}
```

**Key Differences from IMAP:**
- Downloads entire messages (no incremental sync or UID tracking)
- No folder structure (inbox only - POP3 limitation)
- Stateless protocol (each session is independent)
- Simpler authentication (USER + PASS commands)
- Better for legacy mail servers and mobile scenarios
- Messages marked for deletion are removed only after QUIT
- No search capability (handled by separate email-parser plugin)

## Building

Each plugin has its own build:

```bash
cd imap-sync && npm run build
cd imap-search && npm run build
cd pop3-sync && npm run build
```

## Installation

Add to workflow package.json:

```json
{
  "devDependencies": {
    "@metabuilder/workflow-plugin-imap-sync": "workspace:*",
    "@metabuilder/workflow-plugin-imap-search": "workspace:*",
    "@metabuilder/workflow-plugin-pop3-sync": "workspace:*"
  }
}
```

## See Also

- Email Parser: `/workflow/plugins/ts/utility/email-parser/`
- Email Send: `/workflow/plugins/ts/integration/email-send/`
- SMTP Send: `/workflow/plugins/ts/integration/email/smtp-send/`
- Plugin Registry: `/workflow/plugins/ts/email-plugins.ts`
