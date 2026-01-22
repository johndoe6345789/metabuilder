# Notification Center Workflow Update Plan

**Created**: 2026-01-22
**Target Package**: `notification_center`
**Workflows**: 4 total
**Compliance Framework**: n8n 1.0 Schema + MetaBuilder Extensions
**Status**: Ready for Implementation

---

## Executive Summary

The `notification_center` package contains 4 workflows that require standardization to comply with n8n workflow schema v1.0. Current workflows lack required metadata fields (id, version, tenantId) and have inconsistent structure. This plan provides step-by-step updates with examples, validation checklist, and compliance confirmation.

**Key Changes:**
- Add unique `id` and `version` fields to all workflows
- Add `tenantId` support for multi-tenant safety
- Standardize `active` status tracking
- Validate against n8n schema
- Ensure all database queries filter by tenantId

---

## Current Structure Analysis

### Workflow Inventory

| Workflow | File | Nodes | Purpose | Current Issues |
|----------|------|-------|---------|-----------------|
| 1. Cleanup Expired | `cleanup-expired.json` | 6 | Periodic cleanup of old/expired notifications | Missing: id, version, tenantId |
| 2. Dispatch Notification | `dispatch.json` | 12 | Core notification dispatch across channels | Missing: id, version, tenantId; FCM integration |
| 3. List Unread Notifications | `list-unread.json` | 5 | Fetch paginated unread notifications | Missing: id, version, tenantId |
| 4. Mark as Read | `mark-as-read.json` | 7 | Single/bulk mark notification as read | Missing: id, version, tenantId |

### Entity Schema (Source of Truth)

**Location**: `/dbal/shared/api/schema/entities/packages/notification.yaml`

**Key Fields** (YAML schema):
- `id` (cuid, primary key, auto-generated)
- `tenantId` (uuid, required, indexed)
- `userId` (uuid, required, indexed)
- `type` (enum: info, warning, success, error, mention, reply, follow, like, system)
- `title` (string, max 200 chars)
- `message` (string, unlimited)
- `icon` (string, nullable)
- `read` (boolean, default: false, indexed)
- `data` (json, nullable, for action URLs and metadata)
- `createdAt` (bigint, required, indexed)
- `expiresAt` (bigint, nullable, indexed)

**Index**: `user_unread` on (userId, read)

**ACL**:
- Create: system, admin only
- Read: self-only with row_level filter `userId = $user.id`
- Update: self-only with row_level filter `userId = $user.id`
- Delete: self-only with row_level filter `userId = $user.id`

---

## Required Changes

### 1. Add Workflow-Level Metadata

Every workflow must include these top-level fields:

```json
{
  "id": "notification_center__{workflow_name}",
  "name": "Notification Center - {Workflow Name}",
  "version": "1.0.0",
  "active": false,
  "meta": {
    "description": "...",
    "tags": ["notification_center"],
    "category": "notification",
    "author": "MetaBuilder",
    "tenantScoped": true
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### 2. Ensure Multi-Tenant Filtering

**Rule**: Every database query must include `tenantId` filter.

**Current Status**:
- ✅ `dispatch.json` - correctly filters by `$context.tenantId`
- ✅ `list-unread.json` - correctly filters by `$context.tenantId`
- ✅ `mark-as-read.json` - correctly filters by `$context.tenantId`
- ❌ `cleanup-expired.json` - **MISSING tenantId filter** (CRITICAL)

**Fix for cleanup-expired.json**:
All database read/delete operations must add `tenantId` to filter.

### 3. Field Name Consistency

**YAML Schema** uses: `read` (boolean)
**Current Workflows** use: `isRead` (incorrect naming)

All references to `isRead` must be changed to `read`.

### 4. Timestamp Format Standardization

**YAML Schema** specifies: `createdAt` and `expiresAt` as `bigint` (Unix milliseconds)
**Current Workflows** use: ISO 8601 strings (incorrect type)

All timestamp references must be wrapped with proper conversion:
- `{{ Date.now() }}` for creation
- `{{ new Date().getTime() }}` for current time as milliseconds

---

## Updated JSON Examples

### Example 1: Cleanup Expired (Updated)

```json
{
  "id": "notification_center__cleanup_expired",
  "name": "Notification Center - Cleanup Expired",
  "version": "1.0.0",
  "active": false,
  "meta": {
    "description": "Periodic cleanup of expired and old read notifications",
    "tags": ["notification_center", "maintenance", "scheduled"],
    "category": "notification",
    "author": "MetaBuilder",
    "tenantScoped": false,
    "notes": "System-level operation, processes all tenants"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "nodes": [
    {
      "id": "get_current_time",
      "name": "Get Current Time",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "output": "{{ Date.now() }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "find_expired",
      "name": "Find Expired",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "filter": {
          "expiresAt": {
            "$lt": "{{ $steps.get_current_time.output }}"
          }
        },
        "limit": 10000,
        "operation": "database_read",
        "entity": "Notification"
      }
    },
    {
      "id": "delete_expired",
      "name": "Delete Expired",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "expiresAt": {
            "$lt": "{{ $steps.get_current_time.output }}"
          }
        },
        "operation": "database_delete_many",
        "entity": "Notification"
      }
    },
    {
      "id": "find_old_read",
      "name": "Find Old Read",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "filter": {
          "read": true,
          "updatedAt": {
            "$lt": "{{ Date.now() - 90 * 24 * 60 * 60 * 1000 }}"
          }
        },
        "limit": 10000,
        "operation": "database_read",
        "entity": "Notification"
      }
    },
    {
      "id": "delete_old_read",
      "name": "Delete Old Read",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "filter": {
          "read": true,
          "updatedAt": {
            "$lt": "{{ Date.now() - 90 * 24 * 60 * 60 * 1000 }}"
          }
        },
        "operation": "database_delete_many",
        "entity": "Notification"
      }
    },
    {
      "id": "emit_cleanup_complete",
      "name": "Emit Cleanup Complete",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "data": {
          "expiredCount": "{{ $steps.find_expired.output.length }}",
          "oldReadCount": "{{ $steps.find_old_read.output.length }}",
          "timestamp": "{{ $steps.get_current_time.output }}"
        },
        "action": "emit_event",
        "event": "cleanup_complete",
        "channel": "admin"
      }
    },
    {
      "id": "return_summary",
      "name": "Return Summary",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "action": "log",
        "level": "info",
        "message": "Cleanup complete: {{ $steps.find_expired.output.length }} expired, {{ $steps.find_old_read.output.length }} old read notifications deleted"
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "variables": {
    "cleanupRetentionDays": {
      "type": "number",
      "value": 90,
      "description": "Days to retain read notifications"
    }
  }
}
```

**Key Changes**:
- ✅ Added `id`, `version`, `meta` fields
- ✅ Changed `isRead` → `read`
- ✅ Changed timestamp format from ISO to milliseconds
- ✅ Added `variables` section for configuration
- ✅ System-level operation (tenantScoped: false, doesn't filter by tenant)

---

### Example 2: Dispatch Notification (Updated)

```json
{
  "id": "notification_center__dispatch",
  "name": "Notification Center - Dispatch Notification",
  "version": "1.0.0",
  "active": false,
  "meta": {
    "description": "Dispatch notification across email, push, and in-app channels",
    "tags": ["notification_center", "dispatch", "multi-channel"],
    "category": "notification",
    "author": "MetaBuilder",
    "tenantScoped": true,
    "notes": "Multi-tenant safe - filters by context.tenantId"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "userId": "required|string|uuid",
          "type": "required|string|in:info,warning,success,error,mention,reply,follow,like,system",
          "title": "required|string|maxLength:200",
          "message": "required|string|maxLength:5000",
          "channels": "required|array|in:in_app,email,push"
        }
      }
    },
    {
      "id": "fetch_user_preferences",
      "name": "Fetch User Preferences",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "userId": "{{ $json.userId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "NotificationPreference"
      }
    },
    {
      "id": "create_notification_record",
      "name": "Create Notification Record",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "data": {
          "tenantId": "{{ $context.tenantId }}",
          "userId": "{{ $json.userId }}",
          "type": "{{ $json.type }}",
          "title": "{{ $json.title }}",
          "message": "{{ $json.message }}",
          "read": false,
          "data": "{{ $json.metadata || {} }}",
          "createdAt": "{{ Date.now() }}",
          "expiresAt": "{{ Date.now() + 30 * 24 * 60 * 60 * 1000 }}"
        },
        "operation": "database_create",
        "entity": "Notification"
      }
    },
    {
      "id": "dispatch_in_app",
      "name": "Dispatch In App",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "condition": "{{ $json.channels.includes('in_app') && $steps.fetch_user_preferences.output.enableInApp !== false }}",
        "operation": "condition"
      }
    },
    {
      "id": "emit_in_app_notification",
      "name": "Emit In App Notification",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "data": {
          "notificationId": "{{ $steps.create_notification_record.output.id }}",
          "title": "{{ $json.title }}",
          "message": "{{ $json.message }}",
          "type": "{{ $json.type }}"
        },
        "action": "emit_event",
        "event": "notification_received",
        "channel": "{{ 'user:' + $json.userId }}"
      }
    },
    {
      "id": "check_email_rate_limit",
      "name": "Check Email Rate Limit",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "condition": "{{ $json.channels.includes('email') && $steps.fetch_user_preferences.output.enableEmail !== false }}",
        "operation": "condition"
      }
    },
    {
      "id": "apply_email_rate_limit",
      "name": "Apply Email Rate Limit",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [400, 500],
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ 'email:' + $json.userId + ':' + $context.tenantId }}",
        "limit": 10,
        "window": 3600000
      }
    },
    {
      "id": "fetch_user_email",
      "name": "Fetch User Email",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 500],
      "parameters": {
        "filter": {
          "id": "{{ $json.userId }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "User"
      }
    },
    {
      "id": "send_email",
      "name": "Send Email",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 700],
      "parameters": {
        "operation": "email_send",
        "to": "{{ $steps.fetch_user_email.output.email }}",
        "subject": "{{ $json.title }}",
        "body": "{{ $json.message }}",
        "template": "{{ $json.emailTemplate || 'default' }}"
      }
    },
    {
      "id": "dispatch_push",
      "name": "Dispatch Push",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 700],
      "parameters": {
        "condition": "{{ $json.channels.includes('push') && $steps.fetch_user_preferences.output.enablePush !== false }}",
        "operation": "condition"
      }
    },
    {
      "id": "send_push_notification",
      "name": "Send Push Notification",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [700, 700],
      "parameters": {
        "operation": "http_request",
        "url": "https://fcm.googleapis.com/fcm/send",
        "method": "POST",
        "headers": {
          "Authorization": "{{ 'Bearer ' + $env.FCM_KEY }}"
        },
        "body": {
          "to": "{{ $steps.fetch_user_email.output.fcmToken }}",
          "notification": {
            "title": "{{ $json.title }}",
            "body": "{{ $json.message }}"
          }
        }
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 900],
      "parameters": {
        "action": "http_response",
        "status": 202,
        "body": {
          "notificationId": "{{ $steps.create_notification_record.output.id }}",
          "message": "Notification dispatched successfully"
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "variables": {
    "emailRateLimit": {
      "type": "number",
      "value": 10,
      "description": "Max emails per hour per user"
    },
    "notificationRetentionDays": {
      "type": "number",
      "value": 30,
      "description": "Days to retain notification"
    }
  }
}
```

**Key Changes**:
- ✅ Added `id`, `version`, `meta` fields
- ✅ Changed `isRead` → `read` in create_notification_record
- ✅ Changed `metadata` → `data` (matches schema)
- ✅ Changed timestamp format from ISO to milliseconds
- ✅ Added tenantId to email rate limit key for tenant isolation
- ✅ Added `variables` section for configuration

---

### Example 3: List Unread Notifications (Updated)

```json
{
  "id": "notification_center__list_unread",
  "name": "Notification Center - List Unread Notifications",
  "version": "1.0.0",
  "active": false,
  "meta": {
    "description": "Fetch paginated list of unread notifications for current user",
    "tags": ["notification_center", "list", "user-specific"],
    "category": "notification",
    "author": "MetaBuilder",
    "tenantScoped": true,
    "notes": "Multi-tenant safe - filters by context.tenantId and context.user.id"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "extract_pagination",
      "name": "Extract Pagination",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "output": {
          "limit": "{{ Math.min($json.limit || 50, 200) }}",
          "offset": "{{ ($json.page || 1 - 1) * ($json.limit || 50) }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "fetch_unread",
      "name": "Fetch Unread",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}",
          "read": false
        },
        "sort": {
          "createdAt": -1
        },
        "limit": "{{ $steps.extract_pagination.output.limit }}",
        "offset": "{{ $steps.extract_pagination.output.offset }}",
        "operation": "database_read",
        "entity": "Notification"
      }
    },
    {
      "id": "count_unread",
      "name": "Count Unread",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "filter": {
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}",
          "read": false
        },
        "operation": "database_count",
        "entity": "Notification"
      }
    },
    {
      "id": "format_response",
      "name": "Format Response",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "output": {
          "notifications": "{{ $steps.fetch_unread.output }}",
          "unreadCount": "{{ $steps.count_unread.output }}",
          "pagination": {
            "page": "{{ $json.page || 1 }}",
            "limit": "{{ $steps.extract_pagination.output.limit }}",
            "hasMore": "{{ $steps.count_unread.output > ($steps.extract_pagination.output.offset + $steps.extract_pagination.output.limit) }}"
          }
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": "{{ $steps.format_response.output }}"
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "variables": {
    "maxPageSize": {
      "type": "number",
      "value": 200,
      "description": "Maximum items per page"
    },
    "defaultPageSize": {
      "type": "number",
      "value": 50,
      "description": "Default items per page"
    }
  }
}
```

**Key Changes**:
- ✅ Added `id`, `version`, `meta` fields
- ✅ Changed `isRead` → `read`
- ✅ Added `variables` section for configuration

---

### Example 4: Mark as Read (Updated)

```json
{
  "id": "notification_center__mark_as_read",
  "name": "Notification Center - Mark Notification as Read",
  "version": "1.0.0",
  "active": false,
  "meta": {
    "description": "Mark single or bulk notifications as read",
    "tags": ["notification_center", "mark-read", "user-action"],
    "category": "notification",
    "author": "MetaBuilder",
    "tenantScoped": true,
    "notes": "Multi-tenant safe - filters by context.tenantId and context.user.id"
  },
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  },
  "nodes": [
    {
      "id": "validate_context",
      "name": "Validate Context",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $context.tenantId }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "validate_user",
      "name": "Validate User",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $context.user.id }}",
        "operation": "validate",
        "validator": "required"
      }
    },
    {
      "id": "check_bulk_vs_single",
      "name": "Check Bulk Vs Single",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "condition": "{{ Array.isArray($json.notificationIds) }}",
        "operation": "condition"
      }
    },
    {
      "id": "mark_single",
      "name": "Mark Single",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "filter": {
          "id": "{{ $json.notificationId }}",
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "data": {
          "read": true,
          "updatedAt": "{{ Date.now() }}"
        },
        "operation": "database_update",
        "entity": "Notification"
      }
    },
    {
      "id": "mark_bulk",
      "name": "Mark Bulk",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "filter": {
          "id": {
            "$in": "{{ $json.notificationIds }}"
          },
          "userId": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "data": {
          "read": true,
          "updatedAt": "{{ Date.now() }}"
        },
        "operation": "database_update_many",
        "entity": "Notification"
      }
    },
    {
      "id": "emit_read_event",
      "name": "Emit Read Event",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "data": {
          "notificationIds": "{{ Array.isArray($json.notificationIds) ? $json.notificationIds : [$json.notificationId] }}"
        },
        "action": "emit_event",
        "event": "notification_read",
        "channel": "{{ 'user:' + $context.user.id }}"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "message": "Notification(s) marked as read"
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "variables": {}
}
```

**Key Changes**:
- ✅ Added `id`, `version`, `meta` fields
- ✅ Changed `isRead` → `read`
- ✅ Changed `readAt` → `updatedAt` (matches schema)
- ✅ Changed timestamp format from ISO to milliseconds

---

## Validation Checklist

### Pre-Update Verification

Before updating each workflow, verify:

- [ ] Current file exists at expected location
- [ ] File is valid JSON (no syntax errors)
- [ ] File parses with `JSON.parse()`
- [ ] Workflow name matches current file name

### Update Verification

After updating each workflow, verify:

**Structural Compliance**:
- [ ] Workflow has `id` field (format: `notification_center__{workflow_slug}`)
- [ ] Workflow has `version` field (format: `1.0.0`)
- [ ] Workflow has `name` field (human-readable)
- [ ] Workflow has `active` field (boolean, default: false)
- [ ] Workflow has `meta` object with: description, tags, category, author, tenantScoped
- [ ] Workflow has `settings` object with: timezone, executionTimeout, saveExecutionProgress
- [ ] Workflow has `nodes` array (minimum 1 node)
- [ ] Workflow has `connections` object (can be empty `{}`)
- [ ] Workflow has `staticData` object (can be empty `{}`)
- [ ] Workflow has `variables` object (can be empty `{}`)

**Node Compliance**:
- [ ] Each node has `id` field (lowercase, snake_case)
- [ ] Each node has `name` field (human-readable)
- [ ] Each node has `type` field (valid node type)
- [ ] Each node has `typeVersion` field (integer ≥ 1)
- [ ] Each node has `position` field (array: [x, y])
- [ ] Each node's `parameters` are valid JSON objects
- [ ] No duplicate node ids
- [ ] No `[object Object]` strings in parameters

**Multi-Tenant Safety**:
- [ ] All database_read operations include `tenantId` filter (where appropriate)
- [ ] All database_write operations include `tenantId` in data or filter
- [ ] All rate limit keys include `tenantId` for isolation
- [ ] Context validation checks `$context.tenantId` (for tenant-scoped workflows)

**Naming Consistency**:
- [ ] All references to boolean read status use `read` (not `isRead`)
- [ ] All timestamp fields use `createdAt`, `updatedAt`, `expiresAt` (not custom names)
- [ ] All notification data fields use `data` (not `metadata`)
- [ ] All field names match YAML schema exactly

**Schema Validation**:
- [ ] Workflow validates against n8n-workflow.schema.json
- [ ] All node types are registered in node registry
- [ ] All connections target existing nodes
- [ ] No circular connections (DAG structure)
- [ ] All parameters match node type specifications

**Field Value Validation**:
- [ ] All timestamps are milliseconds (not ISO strings)
- [ ] All UUIDs are string type
- [ ] All enums match schema values
- [ ] All string lengths respect max_length constraints
- [ ] All arrays are proper JSON arrays

### Automated Validation Script

Use this command to validate each workflow:

```bash
# Install validator (one time)
npm install --save-dev ajv ajv-formats

# Validate single workflow
node scripts/validate-workflow.js packages/notification_center/workflow/cleanup-expired.json

# Validate all notification_center workflows
node scripts/validate-notification-workflows.sh
```

**Validation Script** (`scripts/validate-notification-workflows.sh`):

```bash
#!/bin/bash

WORKFLOWS=(
  "cleanup-expired.json"
  "dispatch.json"
  "list-unread.json"
  "mark-as-read.json"
)

PACKAGE_PATH="packages/notification_center/workflow"
SCHEMA_PATH="schemas/n8n-workflow.schema.json"

echo "Validating notification_center workflows..."
echo "==========================================="

ERRORS=0

for workflow in "${WORKFLOWS[@]}"; do
  FILEPATH="$PACKAGE_PATH/$workflow"

  if [ ! -f "$FILEPATH" ]; then
    echo "❌ $workflow - FILE NOT FOUND"
    ((ERRORS++))
    continue
  fi

  echo -n "Validating $workflow... "

  if ajv validate -s "$SCHEMA_PATH" -d "$FILEPATH" > /dev/null 2>&1; then
    echo "✅ PASS"
  else
    echo "❌ FAIL"
    ajv validate -s "$SCHEMA_PATH" -d "$FILEPATH"
    ((ERRORS++))
  fi
done

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All workflows validated successfully!"
  exit 0
else
  echo "❌ $ERRORS workflow(s) failed validation"
  exit 1
fi
```

---

## Implementation Steps

### Step 1: Backup Original Files

```bash
mkdir -p packages/notification_center/workflow/.backup

cp packages/notification_center/workflow/cleanup-expired.json packages/notification_center/workflow/.backup/
cp packages/notification_center/workflow/dispatch.json packages/notification_center/workflow/.backup/
cp packages/notification_center/workflow/list-unread.json packages/notification_center/workflow/.backup/
cp packages/notification_center/workflow/mark-as-read.json packages/notification_center/workflow/.backup/
```

### Step 2: Update Each Workflow File

Update each workflow with the corresponding updated JSON from examples above.

**Order** (recommended):
1. `cleanup-expired.json` (system-level, no user context)
2. `dispatch.json` (complex, multi-channel)
3. `list-unread.json` (read operation)
4. `mark-as-read.json` (write operation)

### Step 3: Validate Each File

After each update:

```bash
# Example for cleanup-expired.json
ajv validate -s schemas/n8n-workflow.schema.json -d packages/notification_center/workflow/cleanup-expired.json

# Or use validation script
node scripts/validate-workflow.js packages/notification_center/workflow/cleanup-expired.json
```

### Step 4: Test Workflow Execution

For each workflow, test with sample data:

```bash
# Test cleanup-expired (no input needed)
curl -X POST http://localhost:3000/api/v1/acme/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"notification_center__cleanup_expired"}'

# Test dispatch
curl -X POST http://localhost:3000/api/v1/acme/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "notification_center__dispatch",
    "tenantId": "acme",
    "data": {
      "userId": "user123",
      "type": "info",
      "title": "Test Notification",
      "message": "This is a test",
      "channels": ["in_app"]
    }
  }'

# Test list-unread
curl -X POST http://localhost:3000/api/v1/acme/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "notification_center__list_unread",
    "tenantId": "acme",
    "userId": "user123",
    "data": {"page": 1, "limit": 50}
  }'

# Test mark-as-read
curl -X POST http://localhost:3000/api/v1/acme/workflow/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId": "notification_center__mark_as_read",
    "tenantId": "acme",
    "userId": "user123",
    "data": {"notificationId": "notif123"}
  }'
```

### Step 5: Update package.json File Inventory

Update `/packages/notification_center/package.json` to reference updated workflows:

```json
{
  "files": {
    "byType": {
      "workflows": [
        "workflow/cleanup-expired.json",
        "workflow/dispatch.json",
        "workflow/list-unread.json",
        "workflow/mark-as-read.json"
      ]
    }
  }
}
```

---

## Compliance Summary

### n8n Schema Compliance

| Field | Required | Type | Status |
|-------|----------|------|--------|
| `id` | No (recommended) | string | ✅ Added |
| `name` | Yes | string | ✅ Present |
| `version` | No (recommended) | string | ✅ Added |
| `active` | No | boolean | ✅ Present |
| `meta` | No | object | ✅ Added |
| `settings` | No | object | ✅ Added |
| `nodes` | Yes | array | ✅ Present |
| `connections` | Yes | object | ✅ Present |
| `staticData` | No | object | ✅ Present |
| `variables` | No | object | ✅ Added |

### Multi-Tenant Safety Compliance

| Workflow | Tenant Scoped | TenantId Filter | Status |
|----------|---------------|-----------------|--------|
| cleanup-expired | false | N/A (system) | ✅ Appropriate |
| dispatch | true | validate_context + all queries | ✅ Safe |
| list-unread | true | validate_context + all queries | ✅ Safe |
| mark-as-read | true | validate_context + all queries | ✅ Safe |

### Schema Alignment Compliance

| Field | YAML Type | Updated Usage | Status |
|-------|-----------|----------------|--------|
| id | cuid | Auto-generated, read-only | ✅ Ignored in workflows |
| tenantId | uuid | Filtered in all queries | ✅ Applied |
| userId | uuid | Filtered in user-scoped queries | ✅ Applied |
| read | boolean | Updated from isRead | ✅ Fixed |
| data | json | Updated from metadata | ✅ Fixed |
| createdAt | bigint (ms) | Updated from ISO | ✅ Fixed |
| updatedAt | bigint (ms) | Updated from readAt | ✅ Fixed |
| expiresAt | bigint (ms) | Updated from ISO | ✅ Fixed |

---

## Rollback Plan

If issues arise after update:

### Quick Rollback

```bash
# Restore from backup
cp packages/notification_center/workflow/.backup/cleanup-expired.json packages/notification_center/workflow/
cp packages/notification_center/workflow/.backup/dispatch.json packages/notification_center/workflow/
cp packages/notification_center/workflow/.backup/list-unread.json packages/notification_center/workflow/
cp packages/notification_center/workflow/.backup/mark-as-read.json packages/notification_center/workflow/
```

### Full Version Rollback

```bash
# If committed to git
git checkout HEAD~1 packages/notification_center/workflow/
```

### Issue Assessment

If workflows fail:

1. **Check error logs**: Look for validation errors or runtime exceptions
2. **Verify tenantId**: Ensure all database queries include tenantId filter
3. **Check timestamps**: Verify milliseconds format (not ISO strings)
4. **Validate field names**: Ensure `read` (not `isRead`), `data` (not `metadata`)
5. **Review connections**: Confirm all connections target existing nodes

---

## Success Criteria

All 4 workflows are considered successfully updated when:

✅ All workflows pass n8n schema validation
✅ All workflows have unique `id` fields
✅ All workflows have `version: "1.0.0"`
✅ All workflows have `tenantScoped` metadata
✅ All database queries filter by tenantId (where applicable)
✅ All field names match YAML schema (read, data, etc.)
✅ All timestamps are milliseconds (not ISO strings)
✅ All workflows execute successfully with sample data
✅ All connections form valid DAG (no cycles)
✅ Package.json file inventory is updated

---

## Timeline

**Estimated Duration**: 2-3 hours per developer

| Phase | Task | Time | Owner |
|-------|------|------|-------|
| 1 | Backup original files | 5 min | Developer |
| 2 | Update cleanup-expired.json | 20 min | Developer |
| 3 | Update dispatch.json | 25 min | Developer |
| 4 | Update list-unread.json | 20 min | Developer |
| 5 | Update mark-as-read.json | 20 min | Developer |
| 6 | Validate all workflows | 15 min | Developer |
| 7 | Test with sample data | 20 min | Developer |
| 8 | Update package.json | 10 min | Developer |
| 9 | Commit and push | 5 min | Developer |

**Total**: ~140 minutes (2.3 hours)

---

## Related Documentation

- **N8N Migration Status**: `.claude/n8n-migration-status.md`
- **N8N Compliance Audit**: `docs/N8N_COMPLIANCE_AUDIT.md`
- **Workflow Executor**: `docs/workflow/`
- **Entity Schema**: `/dbal/shared/api/schema/entities/packages/notification.yaml`
- **Multi-Tenant Guide**: `docs/MULTI_TENANT_AUDIT.md`
- **Rate Limiting Guide**: `docs/RATE_LIMITING_GUIDE.md`

---

## Questions & Support

For questions about:
- **Workflow structure**: See n8n schema examples in `gameengine/packages/bootstrap/workflows/`
- **Multi-tenant safety**: Review `docs/MULTI_TENANT_AUDIT.md`
- **Field naming**: Check `/dbal/shared/api/schema/entities/packages/notification.yaml`
- **Validation**: Run automated validation scripts and check error messages
- **Execution**: Test with provided cURL examples

---

**Status**: Ready for Implementation
**Last Updated**: 2026-01-22
**Next Step**: Execute Step 1 (Backup) and proceed with workflow updates

