# Phase 7: Email Folders API Documentation

## Overview

Phase 7 implements complete email folder/mailbox management endpoints with:
- Folder CRUD operations
- Folder hierarchy support (parent/child relationships)
- Special folder types (Inbox, Sent, Drafts, Trash, Spam)
- Message counts (unread and total) with sync tracking
- Multi-tenant safety and row-level access control
- Comprehensive error handling and validation

## API Endpoints

### 1. List Folders with Message Counts

**Endpoint**: `GET /api/accounts/:id/folders`

**Authentication**: Required (X-Tenant-ID, X-User-ID)

**Query Parameters**:
- `tenant_id` (string, required): Tenant ID for multi-tenant filtering
- `user_id` (string, required): User ID for row-level access control
- `parent_id` (string, optional): Filter by parent folder for hierarchy
- `include_counts` (boolean, optional, default=true): Include message counts

**Response** (200 OK):
```json
{
  "folders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "tenantId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "accountId": "550e8400-e29b-41d4-a716-446655440003",
      "folderName": "INBOX",
      "displayName": "Inbox",
      "parentFolderId": null,
      "folderType": "inbox",
      "imapName": "INBOX",
      "isSystemFolder": true,
      "unreadCount": 42,
      "totalCount": 157,
      "isSelectable": true,
      "hasChildren": false,
      "isVisible": true,
      "lastSyncedAt": 1706033200000,
      "createdAt": 1706033200000,
      "updatedAt": 1706033200000,
      "children": []
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "tenantId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440002",
      "accountId": "550e8400-e29b-41d4-a716-446655440003",
      "folderName": "Projects",
      "displayName": "My Projects",
      "parentFolderId": null,
      "folderType": "custom",
      "imapName": "Projects",
      "isSystemFolder": false,
      "unreadCount": 5,
      "totalCount": 23,
      "isSelectable": true,
      "hasChildren": true,
      "isVisible": true,
      "lastSyncedAt": 1706033200000,
      "createdAt": 1706033200000,
      "updatedAt": 1706033200000,
      "children": []
    }
  ],
  "count": 2,
  "accountId": "550e8400-e29b-41d4-a716-446655440003"
}
```

**Error Responses**:
- `400 Bad Request`: Missing tenant_id or user_id
- `404 Not Found`: Account does not exist or user has no access
- `500 Internal Server Error`: Database or server error

---

### 2. Create Folder

**Endpoint**: `POST /api/accounts/:id/folders`

**Authentication**: Required (X-Tenant-ID, X-User-ID headers)

**Request Body**:
```json
{
  "folderName": "Projects",
  "displayName": "My Projects",
  "parentFolderId": null,
  "folderType": "custom",
  "imapName": "Projects",
  "isSystemFolder": false
}
```

**Field Descriptions**:
- `folderName` (string, required): Internal folder name (max 255 chars)
- `displayName` (string, optional): User-friendly folder name (defaults to folderName)
- `parentFolderId` (string, optional): Parent folder ID for nesting
- `folderType` (string, optional, default='custom'): Type of folder
  - Valid values: `inbox`, `sent`, `drafts`, `trash`, `spam`, `custom`
- `imapName` (string, optional): IMAP path (e.g., "Projects" or "Parent/Projects")
- `isSystemFolder` (boolean, optional, default=false): System folders cannot be deleted

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "tenantId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "accountId": "550e8400-e29b-41d4-a716-446655440003",
  "folderName": "Projects",
  "displayName": "My Projects",
  "parentFolderId": null,
  "folderType": "custom",
  "imapName": "Projects",
  "isSystemFolder": false,
  "unreadCount": 0,
  "totalCount": 0,
  "isSelectable": true,
  "hasChildren": false,
  "isVisible": true,
  "lastSyncedAt": null,
  "createdAt": 1706033200000,
  "updatedAt": 1706033200000,
  "children": []
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body or validation errors
- `401 Unauthorized`: Missing X-Tenant-ID or X-User-ID header
- `404 Not Found`: Account does not exist
- `409 Conflict`: Folder with same name already exists
- `500 Internal Server Error`: Database or server error

**Validation Rules**:
- `folderName`: Required, non-empty, max 255 characters
- `folderType`: Must be one of `inbox`, `sent`, `drafts`, `trash`, `spam`, `custom`
- Duplicate folder names within account are rejected

---

### 3. Get Folder Details

**Endpoint**: `GET /api/accounts/:id/folders/:folderId`

**Authentication**: Required (tenant_id and user_id query params)

**Query Parameters**:
- `tenant_id` (string, required): Tenant ID
- `user_id` (string, required): User ID
- `include_hierarchy` (boolean, optional, default=false): Include parent path and children

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "tenantId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440002",
  "accountId": "550e8400-e29b-41d4-a716-446655440003",
  "folderName": "Projects",
  "displayName": "My Projects",
  "parentFolderId": null,
  "folderType": "custom",
  "imapName": "Projects",
  "isSystemFolder": false,
  "unreadCount": 5,
  "totalCount": 23,
  "isSelectable": true,
  "hasChildren": true,
  "isVisible": true,
  "lastSyncedAt": 1706033200000,
  "createdAt": 1706033200000,
  "updatedAt": 1706033200000,
  "children": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "folderName": "Q1",
      "displayName": "Q1 2024",
      "parentFolderId": "550e8400-e29b-41d4-a716-446655440004"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Missing tenant_id or user_id
- `404 Not Found`: Folder does not exist or user has no access
- `500 Internal Server Error`: Database or server error

---

### 4. Update Folder

**Endpoint**: `PUT /api/accounts/:id/folders/:folderId`

**Authentication**: Required (X-Tenant-ID, X-User-ID headers)

**Request Body** (all fields optional):
```json
{
  "displayName": "Important Projects",
  "unreadCount": 10,
  "totalCount": 50,
  "isVisible": true,
  "syncStateUidvalidity": "123456789",
  "syncStateUidnext": 1000
}
```

**Field Descriptions**:
- `displayName` (string, optional): New display name (cannot be changed for system folders)
- `unreadCount` (integer, optional): Number of unread messages
- `totalCount` (integer, optional): Total number of messages
- `isVisible` (boolean, optional): Visibility flag
- `syncStateUidvalidity` (string, optional): IMAP UIDVALIDITY state
- `syncStateUidnext` (integer, optional): IMAP UIDNEXT state

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "displayName": "Important Projects",
  "unreadCount": 10,
  "totalCount": 50,
  ...
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body or validation errors
- `401 Unauthorized`: Missing X-Tenant-ID or X-User-ID header
- `403 Forbidden`: Attempted to rename system folder
- `404 Not Found`: Folder does not exist
- `500 Internal Server Error`: Database or server error

**Validation Rules**:
- `displayName`: Max 255 characters
- `unreadCount`, `totalCount`: Must be non-negative integers
- System folders (`isSystemFolder: true`) cannot have `displayName` changed
- Counts cannot be negative

---

### 5. Delete Folder

**Endpoint**: `DELETE /api/accounts/:id/folders/:folderId`

**Authentication**: Required (tenant_id and user_id query params)

**Query Parameters**:
- `tenant_id` (string, required): Tenant ID
- `user_id` (string, required): User ID
- `hard_delete` (boolean, optional, default=false): Permanently delete instead of soft delete

**Response** (200 OK):
```json
{
  "message": "Folder deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "hardDeleted": false
}
```

**Error Responses**:
- `400 Bad Request`: Missing tenant_id or user_id
- `403 Forbidden`: Attempted to delete system folder
- `404 Not Found`: Folder does not exist
- `500 Internal Server Error`: Database or server error

**Deletion Behavior**:
- **Soft Delete** (default): Sets `isVisible: false`, folder can be recovered
- **Hard Delete**: Permanently removes folder from database, non-recoverable
- System folders (Inbox, Sent, Drafts, Trash, Spam) cannot be deleted

---

### 6. List Folder Messages

**Endpoint**: `GET /api/accounts/:id/folders/:folderId/messages`

**Authentication**: Required (tenant_id and user_id query params)

**Query Parameters**:
- `tenant_id` (string, required): Tenant ID
- `user_id` (string, required): User ID
- `limit` (integer, optional, default=50): Page size (1-500)
- `offset` (integer, optional, default=0): Number of messages to skip
- `sort_by` (string, optional, default=date): Sort field (date, from, subject)
- `sort_order` (string, optional, default=desc): Sort direction (asc, desc)
- `filter_unread` (boolean, optional): Show unread messages only
- `search_query` (string, optional): Search in subject and from

**Response** (200 OK):
```json
{
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440006",
      "folderId": "550e8400-e29b-41d4-a716-446655440004",
      "from": "alice@example.com",
      "to": "bob@example.com",
      "subject": "Project Update",
      "body": "Here is the latest update...",
      "receivedAt": 1706033200000,
      "isUnread": false,
      "hasAttachments": true
    }
  ],
  "count": 1,
  "total": 23,
  "limit": 50,
  "offset": 0,
  "folderId": "550e8400-e29b-41d4-a716-446655440004",
  "accountId": "550e8400-e29b-41d4-a716-446655440003",
  "note": "Message listing requires EmailMessage model (Phase 8)"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid pagination parameters
- `401 Unauthorized`: Missing tenant_id or user_id
- `404 Not Found`: Folder does not exist
- `500 Internal Server Error`: Database or server error

**Pagination Rules**:
- `limit`: Must be between 1 and 500
- `offset`: Must be non-negative
- Default page size: 50 messages

**Note**: Message listing is implemented as a placeholder. Full message retrieval requires Phase 8 EmailMessage model implementation.

---

### 7. Get Folder Hierarchy

**Endpoint**: `GET /api/accounts/:id/folders/:folderId/hierarchy`

**Authentication**: Required (tenant_id and user_id query params)

**Query Parameters**:
- `tenant_id` (string, required): Tenant ID
- `user_id` (string, required): User ID

**Response** (200 OK):
```json
{
  "folder": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "folderName": "Q1",
    "displayName": "Q1 2024",
    "parentFolderId": "550e8400-e29b-41d4-a716-446655440007",
    ...
  },
  "parentPath": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "displayName": "Projects"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "displayName": "2024"
    }
  ],
  "children": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "folderName": "Issues",
      "displayName": "Q1 Issues",
      "parentFolderId": "550e8400-e29b-41d4-a716-446655440004"
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Missing tenant_id or user_id
- `404 Not Found`: Folder does not exist
- `500 Internal Server Error`: Database or server error

---

## Folder Types

### Special Folders
These folders are system-managed and have special behavior:

| Type | Purpose | Can Delete | Can Rename |
|------|---------|-----------|-----------|
| `inbox` | Incoming mail | ✗ No | ✗ No |
| `sent` | Sent messages | ✗ No | ✗ No |
| `drafts` | Draft messages | ✗ No | ✗ No |
| `trash` | Deleted messages | ✗ No | ✗ No |
| `spam` | Spam messages | ✗ No | ✗ No |
| `custom` | User-created folder | ✓ Yes | ✓ Yes |

---

## Authentication & Multi-Tenancy

### Header Authentication (POST, PUT)
```
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440001
X-User-ID: 550e8400-e29b-41d4-a716-446655440002
```

### Query Parameter Authentication (GET, DELETE)
```
GET /api/accounts/123/folders?tenant_id=xyz&user_id=abc
```

### Multi-Tenant Safety
- All queries filter by `tenant_id` and `user_id`
- Row-level access control prevents cross-tenant data access
- Missing credentials return 401 Unauthorized
- Access to non-owned resources returns 404 Not Found

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error Category",
  "message": "Detailed error message"
}
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Folder successfully created |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Missing or invalid credentials |
| 403 | Forbidden - Operation not allowed on this resource |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Duplicate or conflicting resource |
| 500 | Internal Server Error - Server error |

---

## Data Models

### EmailFolder
```typescript
interface EmailFolder {
  id: string;                          // UUID
  tenantId: string;                    // UUID - multi-tenant identifier
  userId: string;                      // UUID - user who owns folder
  accountId: string;                   // UUID - email account
  folderName: string;                  // e.g., "INBOX", "Projects"
  displayName: string;                 // User-visible name
  parentFolderId: string | null;       // For hierarchy
  folderType: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
  imapName: string;                    // IMAP path, e.g., "INBOX" or "Projects/Q1"
  isSystemFolder: boolean;             // Cannot delete/rename if true
  unreadCount: number;                 // Unread message count
  totalCount: number;                  // Total message count
  isSelectable: boolean;               // Can contain messages (IMAP)
  hasChildren: boolean;                // Has subfolders
  isVisible: boolean;                  // Visible in UI (soft-delete flag)
  lastSyncedAt: number | null;         // Milliseconds since epoch
  syncStateUidvalidity: string | null; // IMAP UIDVALIDITY for sync tracking
  syncStateUidnext: number | null;     // IMAP UIDNEXT for sync tracking
  createdAt: number;                   // Milliseconds since epoch
  updatedAt: number;                   // Milliseconds since epoch
}
```

---

## Examples

### Create a Custom Folder with Hierarchy
```bash
curl -X POST http://localhost:5000/api/accounts/acc-123/folders \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-456" \
  -H "X-User-ID: user-789" \
  -d '{
    "folderName": "Q1",
    "displayName": "Q1 2024",
    "parentFolderId": "projects-folder-id",
    "folderType": "custom",
    "imapName": "Projects/Q1"
  }'
```

### Update Folder Message Counts
```bash
curl -X PUT http://localhost:5000/api/accounts/acc-123/folders/folder-id \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-456" \
  -H "X-User-ID: user-789" \
  -d '{
    "unreadCount": 15,
    "totalCount": 42,
    "syncStateUidvalidity": "123456789",
    "syncStateUidnext": 1000
  }'
```

### List Folders with Children
```bash
curl -X GET "http://localhost:5000/api/accounts/acc-123/folders?tenant_id=tenant-456&user_id=user-789"
```

### Get Folder Hierarchy
```bash
curl -X GET "http://localhost:5000/api/accounts/acc-123/folders/folder-id/hierarchy?tenant_id=tenant-456&user_id=user-789"
```

### Delete Folder (Soft Delete)
```bash
curl -X DELETE "http://localhost:5000/api/accounts/acc-123/folders/folder-id?tenant_id=tenant-456&user_id=user-789"
```

### Delete Folder (Hard Delete)
```bash
curl -X DELETE "http://localhost:5000/api/accounts/acc-123/folders/folder-id?tenant_id=tenant-456&user_id=user-789&hard_delete=true"
```

---

## Implementation Details

### Database Schema
The `EmailFolder` model uses SQLAlchemy with PostgreSQL:
- Composite index on `(user_id, tenant_id)` for multi-tenant queries
- Index on `(account_id, tenant_id)` for account filtering
- Index on `(folder_type, tenant_id)` for special folder lookups
- Index on `(parent_folder_id, account_id)` for hierarchy
- Soft delete via `isVisible` column

### Folder Hierarchy
- Folders can be nested using `parentFolderId`
- `hasChildren` flag indicates if folder has subfolders
- `get_hierarchy_path()` returns full ancestor chain
- `get_child_folders()` returns direct children only

### Message Counting
- `unreadCount`: Number of unread messages in folder
- `totalCount`: Total number of messages in folder
- Counts updated by increment/decrement methods
- Sync timestamp auto-updated when counts change

### Soft Delete vs Hard Delete
- **Soft Delete**: Sets `isVisible: false`, folder preserved in database
- **Hard Delete**: Permanently removes folder (non-recoverable)
- By default, only soft deletes (lists exclude invisible folders)

---

## Testing

Run the comprehensive test suite:
```bash
pytest tests/test_folders.py -v --cov=src/routes/folders
```

Test coverage includes:
- All CRUD operations
- Multi-tenant safety
- Error handling and validation
- Folder hierarchy operations
- Message counting and sync state
- Special folder constraints

Total: 30+ test cases covering all endpoints and edge cases.
