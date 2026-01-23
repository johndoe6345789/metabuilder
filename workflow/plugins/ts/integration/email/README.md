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

### imap-search

Executes IMAP SEARCH commands to find messages matching criteria.

**Inputs:**
- `imapId` (string, required) - UUID of email account configuration
- `folderId` (string, required) - UUID of email folder to search
- `criteria` (string, required) - IMAP SEARCH criteria (e.g., "UNSEEN SINCE 01-Jan-2026")
- `limit` (number, optional, default: 100) - Maximum results to return

**Outputs:**
- `status` (string) - 'found' or 'error'
- `data` (object) - Contains:
  - `messageIds`: Array of matching message IDs
  - `totalCount`: Total matching messages
  - `criteria`: Search criteria used
  - `executedAt`: Timestamp of search

**IMAP Search Criteria Keywords:**
- ALL, ANSWERED, BCC, BEFORE, BODY, CC, DELETED, DRAFT, FLAGGED, FROM
- HEADER, KEYWORD, LARGER, NEW, NOT, OLD, ON, RECENT, SEEN, SINCE
- SMALLER, SUBJECT, TEXT, TO, UID, UNANSWERED, UNDELETED, UNDRAFT
- UNFLAGGED, UNKEYWORD, UNSEEN, OR

**Usage:**
```json
{
  "id": "find-unread",
  "nodeType": "imap-search",
  "parameters": {
    "imapId": "acme-gmail-account-id",
    "folderId": "inbox-folder-id",
    "criteria": "UNSEEN SINCE 01-Jan-2026",
    "limit": 50
  }
}
```

## Building

Each plugin has its own build:

```bash
cd imap-sync && npm run build
cd imap-search && npm run build
```

## Installation

Add to workflow package.json:

```json
{
  "devDependencies": {
    "@metabuilder/workflow-plugin-imap-sync": "workspace:*",
    "@metabuilder/workflow-plugin-imap-search": "workspace:*"
  }
}
```

## See Also

- Email Parser: `/workflow/plugins/ts/utility/email-parser/`
- Email Send: `/workflow/plugins/ts/integration/email-send/`
- Plugin Registry: `/workflow/plugins/ts/email-plugins.ts`
