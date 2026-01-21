# Notification Center - Detailed File Locations & Code References

**Generated**: 2026-01-21
**Purpose**: Complete mapping of notification system components with absolute file paths

---

## YAML Schema Files

### Primary Schema Definition
**File**: `/Users/rmac/Documents/metabuilder/dbal/shared/api/schema/entities/packages/notification.yaml`

**Content**: Notification entity definition for DBAL
```yaml
entity: Notification
version: "1.0"
package: notification_center

fields:
  - id (cuid, primary)
  - tenantId (uuid, required, indexed)
  - userId (uuid, required, indexed)
  - type (enum: info, warning, success, error, mention, reply, follow, like, system)
  - title (string, max 200)
  - message (string)
  - icon (string, nullable)
  - read (boolean, default: false, indexed)
  - data (json, nullable)
  - createdAt (bigint, required, indexed)
  - expiresAt (bigint, nullable, indexed)

indexes:
  - [userId, read] → idx_notification_user_read
  - [tenantId, createdAt] → idx_notification_tenant_time

acl:
  - create: [system, admin]
  - read: [self]
  - update: [self]
  - delete: [self]
```

**Status**: ✅ Complete
**To Generate Prisma**: `npm --prefix dbal/development run codegen:prisma`

---

## Package Configuration Files

### 1. Package Metadata
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/package.json`

```json
{
  "packageId": "notification_center",
  "name": "Notification Center",
  "version": "1.0.0",
  "description": "Notification center components and summary cards",
  "exports": {
    "components": ["NotificationSummary", "NotificationList", "NotificationToast"],
    "scripts": ["init", "toast", "list", "summary"]
  }
}
```

**Status**: ✅ Complete

### 2. Entity Schema (Package-Level)
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/entities/schema.json`

**Content**: Entity definition mirror (114 lines)
- Mirrors YAML schema at package level
- Includes relations to User and Tenant
- ACL definitions in JSON format

**Status**: ✅ Complete

---

## Workflow Files (4 Total)

### Workflow 1: Dispatch Notification
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/workflow/dispatch.jsonscript`

**Type**: HTTP Trigger
**Method**: POST
**Endpoint**: `/notifications/dispatch`
**Size**: 149 lines

**Nodes** (11 total):
1. `validate_context` - Check tenantId present
2. `validate_input` - Validate userId, type, title, message, channels
3. `fetch_user_preferences` - Query NotificationPreference (line 32-41) **← MISSING ENTITY**
4. `create_notification_record` - Insert Notification (line 44-59)
5. `dispatch_in_app` - Conditional check (line 61-65)
6. `emit_in_app_notification` - WebSocket emit (line 67-78)
7. `check_email_rate_limit` - Conditional check (line 81-84)
8. `apply_email_rate_limit` - Rate limit: 10/3600000ms (line 86-92) **← WORKS**
9. `fetch_user_email` - Query user email (line 94-104)
10. `send_email` - Email send operation (line 106-113)
11. `dispatch_push` - Conditional check (line 115-119) **← NO PUSH RATE LIMIT**
12. `send_push_notification` - FCM HTTP call (line 121-136) **← Requires FCM_KEY env var**
13. `return_success` - 202 response (line 138-146)

**Issues**:
- ⚠️ NotificationPreference entity undefined
- ⚠️ No push notification rate limit
- ⚠️ FCM token fetched from User (not normalized)
- ⚠️ Requires FCM_KEY environment variable

**Status**: ⚠️ 90% Complete

---

### Workflow 2: Mark as Read
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/workflow/mark-as-read.jsonscript`

**Type**: HTTP Trigger
**Method**: POST
**Endpoint**: `/notifications/mark-read`
**Size**: 87 lines

**Nodes** (7 total):
1. `validate_context` - Check tenantId
2. `validate_user` - Check userId
3. `check_bulk_vs_single` - Array check (line 28-30)
4. `mark_single` - Single notification update (line 32-47)
5. `mark_bulk` - Bulk update many (line 49-66)
6. `emit_read_event` - Event emission (line 68-76)
7. `return_success` - 200 response (line 78-85)

**Features**:
- ✅ Supports bulk and single operations
- ✅ Multi-tenant filtering (userId + tenantId)
- ✅ Event emission on read
- ✅ Timestamp recording

**Status**: ✅ 100% Complete

---

### Workflow 3: List Unread Notifications
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/workflow/list-unread.jsonscript`

**Type**: HTTP Trigger
**Method**: GET
**Endpoint**: `/notifications/unread`
**Size**: 78 lines

**Nodes** (5 total):
1. `validate_context` - Check user.id
2. `extract_pagination` - Calc limit/offset (line 20-26)
3. `fetch_unread` - Query unread notifications (line 28-42)
4. `count_unread` - Count total unread (line 44-55)
5. `format_response` - Build response (line 57-69)
6. `return_success` - 200 with data (line 71-76)

**Features**:
- ✅ Pagination support (limit, page)
- ✅ User-scoped query (userId + tenantId)
- ✅ Unread count aggregation
- ✅ hasMore indicator

**Status**: ✅ 100% Complete

---

### Workflow 4: Cleanup Expired Notifications
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/workflow/cleanup-expired.jsonscript`

**Type**: Scheduled Trigger
**Schedule**: `0 2 * * *` (Daily @ 2 AM UTC)
**Size**: 92 lines

**Nodes** (6 total):
1. `get_current_time` - Current timestamp (line 11-15)
2. `find_expired` - Query expired (line 17-29) **← MISSING tenantId**
3. `delete_expired` - Delete batch (line 31-42) **← MISSING tenantId**
4. `find_old_read` - Query 90+ day old (line 44-57) **← MISSING tenantId**
5. `delete_old_read` - Delete old (line 59-71) **← MISSING tenantId**
6. `emit_cleanup_complete` - Event log (line 73-83)
7. `return_summary` - Log summary (line 85-90)

**CRITICAL BUG**:
```jsonscript
// Lines 21-27: Missing tenantId filter
"filter": {
  "expiresAt": { "$lt": "{{ $steps.get_current_time.output }}" }
  // Should be:
  // "tenantId": "{{ $context.tenantId }}"  ← MISSING
}
```

**Impact**: Deletes notifications from ALL tenants (data leak)

**Status**: ⚠️ 70% Complete (Security bug)

---

## UI Component Files

### File: Components Definition
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/components/ui.json`

**Size**: 282 lines

### Component 1: NotificationSummary
**Name**: `notification_summary`
**Props**:
- title (string, default: "Notification Summary")
- subtitle (string, optional)
- totalLabel (string, default: "Total")

**State**:
- total (number, default: 0)
- items (array, default: [])

**Handlers**:
- init → summary.prepareSummary

**Render**: Card with Badge counts by severity
- Shows total count
- Lists notification types with counts
- Responsive layout

**Status**: ✅ 100% Complete

### Component 2: NotificationToast
**Name**: `notification_toast`
**Props**:
- type (enum: info, success, warning, error)
- title (required)
- message (required)
- duration (number, default: 5000ms)

**Handlers**:
- onDismiss → toast.dismiss

**Render**: Box with icon, text, dismiss button
- Auto-dismiss after 5 seconds
- Icon changes based on type
- Manual dismiss available

**Status**: ✅ 100% Complete

### Component 3: NotificationList
**Name**: `notification_list`
**Props**:
- notifications (array, default: [])
- showUnreadOnly (boolean, default: false)

**Handlers**:
- markAsRead → list.markAsRead
- dismiss → list.dismiss

**Render**: List with item template
- Icons and badges for unread
- Timestamp display
- Read/unread styling

**Status**: ✅ 100% Complete

---

## Page Configuration Files

### File: Page Routes
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/page-config/page-config.json`

**Size**: 24 lines

### Page 1: Notifications Inbox
```json
{
  "id": "page_notifications_inbox",
  "path": "/notifications",
  "title": "Notifications",
  "packageId": "notification_center",
  "component": "notifications_inbox",  // ← Component implementation MISSING
  "level": 1,
  "requiresAuth": true,
  "isPublished": true,
  "sortOrder": 30
}
```

**Status**: ⚠️ 50% Complete (Route defined, component not implemented)

### Page 2: Notification Settings
```json
{
  "id": "page_notifications_settings",
  "path": "/settings/notifications",
  "title": "Notification Settings",
  "packageId": "notification_center",
  "component": "notification_settings",  // ← Component implementation MISSING
  "level": 1,
  "requiresAuth": true,
  "isPublished": true,
  "sortOrder": 31
}
```

**Status**: ⚠️ 50% Complete (Route defined, component not implemented)

---

## Event Handler Files

### File: Event Definitions
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/events/handlers.json`

**Size**: 48 lines

**Events** (3 total):
1. `notification.created`
   - Triggered when new notification created
   - Payload: Notification entity
   - Handler: `toast.showToast`

2. `notification.read`
   - Triggered when marked as read
   - Payload: {notificationId, userId}
   - Handler: `summary.prepareSummary`

3. `notification.dismissed`
   - Triggered when dismissed
   - Payload: {notificationId, userId}
   - Handler: (None currently)

**Subscribers** (2 total):
1. `show_toast_on_create` → Show notification toast
2. `update_count_on_read` → Update summary counts

**Status**: ✅ 100% Complete

---

## Permission Files

### File: Permissions & Roles
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/permissions/roles.json`

**Size**: 44 lines

**Permissions** (3 total):
1. `notification_center.view`
   - Action: read
   - Scope: global
   - MinLevel: 1

2. `notification_center.dismiss`
   - Action: update
   - Scope: user
   - MinLevel: 1

3. `notification_center.clear`
   - Action: delete
   - Scope: user
   - MinLevel: 1

**Resources** (1 total):
- `notification_center` component resource
- Actions: [read, update, delete]

**Status**: ✅ 100% Complete

---

## Seed & Test Files

### Seed Metadata
**File**: `/Users/rmac/Documents/metabuilder/packages/notification_center/seed/metadata.json`

**Size**: 12 lines
**Content**: Package metadata for seeding

**Status**: ✅ Complete

### Test Metadata
**Files**:
- `/Users/rmac/Documents/metabuilder/packages/notification_center/tests/metadata.test.json`
- `/Users/rmac/Documents/metabuilder/packages/notification_center/tests/metadata.params.json`

**Status**: ⚠️ Defined but no implementations

---

## Rate Limiting Middleware

### Existing Rate Limit Implementation
**File**: `/Users/rmac/Documents/metabuilder/frontends/nextjs/src/lib/middleware/rate-limit.ts`

**Size**: 316 lines

**Existing Limiters**:
```typescript
export const rateLimiters = {
  login: 5/minute,           // 1 minute window
  register: 3/minute,        // 1 minute window
  list: 100/minute,          // 1 minute window
  mutation: 50/minute,       // 1 minute window
  public: 1000/hour,         // 1 hour window
  bootstrap: 1/hour          // 1 hour window
}
```

**Missing**: Notification-specific limits
- emailDispatch (10/hour/user)
- pushDispatch (20/hour/user)
- inAppDispatch (100/hour/user)
- dispatchEndpoint (50/minute/tenant)

**Status**: ⚠️ Foundation exists, notification limits needed

---

## API Route Structure

### Main REST Handler
**File**: `/Users/rmac/Documents/metabuilder/frontends/nextjs/src/app/api/v1/[...slug]/route.ts`

**Size**: 232 lines

**Current Flow**:
1. Parse RESTful route
2. Apply rate limiting (generic)
3. Validate package/entity
4. Validate tenant access
5. Execute DBAL operation or package action
6. Return response

**Supports**:
- Pattern: `/api/v1/{tenant}/{package}/{entity}[/{id}[/{action}]]`
- Methods: GET, POST, PUT, PATCH, DELETE
- Rate limiting: Per-request type
- Auth: Session-based

**What's Used**:
- `parseRestfulRequest()` - Route parsing
- `validatePackageRoute()` - Package validation
- `validateTenantAccess()` - Tenant access
- `executePackageAction()` - Custom actions
- `executeDbalOperation()` - CRUD operations

**Missing**: Package action handlers for notification_center

**Status**: ✅ Infrastructure ready, need handlers

---

## Directory Structure

```
/packages/notification_center/
├── components/
│   └── ui.json                          (3 components)
├── entities/
│   └── schema.json                      (Entity definition)
├── events/
│   └── handlers.json                    (Event subscriptions)
├── page-config/
│   └── page-config.json                 (2 page routes)
├── permissions/
│   └── roles.json                       (3 permissions)
├── seed/
│   └── metadata.json
├── static_content/
│   └── icon.svg
├── storybook/
│   └── config.json
├── styles/
│   └── tokens.json
├── tests/
│   ├── metadata.test.json
│   └── metadata.params.json
├── workflow/                            (4 workflows)
│   ├── dispatch.jsonscript              (Multi-channel dispatch)
│   ├── mark-as-read.jsonscript          (Bulk mark read)
│   ├── list-unread.jsonscript           (Paginated fetch)
│   └── cleanup-expired.jsonscript       (Scheduled cleanup)
└── package.json                         (Package metadata)
```

---

## External Service Integration Points

### Email Service Integration
**Location**: `/packages/notification_center/workflow/dispatch.jsonscript` line 106-113

**Current**: `email_send` operation
**Required**: SMTP configuration or service integration

**Environment Variables Needed**:
```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM_EMAIL
```

### Push Notification Service
**Location**: `/packages/notification_center/workflow/dispatch.jsonscript` line 124

**Current**: Firebase Cloud Messaging (FCM)
**API**: `https://fcm.googleapis.com/fcm/send`
**Required**: FCM credentials and user device tokens

**Environment Variables Needed**:
```
FCM_KEY          (Bearer token)
FCM_PROJECT_ID
FCM_PRIVATE_KEY
```

**Issue**: User entity needs `fcmToken` field (not yet added to schema)

### WebSocket Integration
**Location**: Workflow event emissions

**Current**: Events emitted to channels (e.g., `user:${userId}`)
**Required**: WebSocket bridge implementation

**Missing**:
- `/frontends/nextjs/src/lib/websocket/` (bridge not implemented)
- Event subscription mechanism
- Real-time channel handling

---

## Database Queries Generated

### User's Unread Count
**Workflow**: `list-unread.jsonscript` lines 44-55

```sql
SELECT COUNT(*) as count
FROM "Notification"
WHERE "userId" = $1
  AND "tenantId" = $2
  AND "read" = false
```

### Expired Notification Cleanup
**Workflow**: `cleanup-expired.jsonscript` lines 17-42

```sql
DELETE FROM "Notification"
WHERE "expiresAt" < $1
LIMIT 10000

-- ⚠️ MISSING: AND "tenantId" = $context.tenantId
```

### Mark Multiple as Read
**Workflow**: `mark-as-read.jsonscript` lines 49-66

```sql
UPDATE "Notification"
SET "read" = true, "readAt" = $1
WHERE "id" IN ($2...)
  AND "userId" = $3
  AND "tenantId" = $4
```

---

## Old System References (Deprecated)

### Sonner Toast Library
**Location**: `/Users/rmac/Documents/metabuilder/old/src/components/ui/sonner.tsx`

**Old Pattern**:
```tsx
import { Toaster as Sonner } from "sonner"
<Sonner theme={theme} />
```

**New Pattern**:
```json
// NotificationToast component in components/ui.json
{
  "id": "notification_toast",
  "type": "NotificationToast"
}
```

**Status**: No longer used (replaced by JSON-first components)

---

## Environment Configuration Checklist

**Required for Production**:

```bash
# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx

# Push Notifications
FCM_PROJECT_ID=your-project-id
FCM_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FCM_CLIENT_EMAIL=firebase@your-project.iam.gserviceaccount.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/metabuilder

# Redis (for distributed rate limiting)
REDIS_URL=redis://localhost:6379

# Webhook (for external notification services)
WEBHOOK_SECRET=your-secret-key
```

---

## Summary Table

| Component | Type | Location | Status | Lines |
|-----------|------|----------|--------|-------|
| Notification Schema | YAML | `/dbal/shared/api/schema/entities/packages/notification.yaml` | ✅ | 89 |
| Entity Definition | JSON | `/packages/notification_center/entities/schema.json` | ✅ | 115 |
| Dispatch Workflow | JSONScript | `/packages/notification_center/workflow/dispatch.jsonscript` | ⚠️ | 148 |
| Mark Read Workflow | JSONScript | `/packages/notification_center/workflow/mark-as-read.jsonscript` | ✅ | 87 |
| List Unread Workflow | JSONScript | `/packages/notification_center/workflow/list-unread.jsonscript` | ✅ | 78 |
| Cleanup Workflow | JSONScript | `/packages/notification_center/workflow/cleanup-expired.jsonscript` | ⚠️ | 92 |
| UI Components | JSON | `/packages/notification_center/components/ui.json` | ✅ | 282 |
| Page Routes | JSON | `/packages/notification_center/page-config/page-config.json` | ⚠️ | 24 |
| Events | JSON | `/packages/notification_center/events/handlers.json` | ✅ | 48 |
| Permissions | JSON | `/packages/notification_center/permissions/roles.json` | ✅ | 44 |
| Rate Limiters | TypeScript | `/frontends/nextjs/src/lib/middleware/rate-limit.ts` | ⚠️ | 316 |
| API Routes | TypeScript | `/frontends/nextjs/src/app/api/v1/[...slug]/route.ts` | ⚠️ | 232 |

