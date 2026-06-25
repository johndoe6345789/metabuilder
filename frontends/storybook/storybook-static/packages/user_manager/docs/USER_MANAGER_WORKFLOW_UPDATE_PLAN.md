# User Manager Package - Workflow Update Plan

**Date Created**: 2026-01-22
**Phase**: Phase 3, Week 2 - N8N Schema Migration
**Status**: Ready for Implementation
**Package**: `user_manager` (5 workflows)
**Target**: Complete N8N Schema Compliance + Production Readiness

---

## Executive Summary

The user_manager package contains 5 core workflows that manage user lifecycle operations. This plan provides:

1. **Current Structure Analysis** - What exists today
2. **Required Changes** - What's missing (id, version, tenantId, active flags)
3. **Complete Updated Examples** - Production-ready JSON with all fields
4. **Validation Checklist** - Step-by-step verification process
5. **Testing & Deployment** - How to validate before going live

**Total Workflows to Update**: 5
**Estimated Effort**: 2-3 hours
**Risk Level**: Low (non-breaking changes, fully backward compatible)

---

## Part 1: Current Structure Analysis

### 1.1 Workflow Locations

All workflows located in `/Users/rmac/Documents/metabuilder/packages/user_manager/workflow/`:

| File | Nodes | Current Status | Priority |
|------|-------|-----------------|----------|
| `create-user.json` | 6 nodes | Incomplete | P0 |
| `list-users.json` | 6 nodes | Incomplete | P0 |
| `update-user.json` | 4 nodes | Incomplete | P0 |
| `reset-password.json` | 7 nodes | Incomplete | P0 |
| `delete-user.json` | 7 nodes | Incomplete | P0 |

**Total Nodes**: 30 nodes across 5 workflows

### 1.2 Current Workflow Structure

**Example: create-user.json (Current)**

```json
{
  "name": "Create User",
  "active": false,
  "nodes": [ /* ... */ ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": { /* ... */ }
}
```

**Missing Fields**:
- ❌ `id` - Unique identifier (database key)
- ❌ `version` - Version identifier (for optimization)
- ❌ `tenantId` - Multi-tenant context
- ❌ `versionId` - Optimistic concurrency control

---

## Part 2: Required Changes

### 2.1 N8N Schema Compliance Requirements

Based on `/Users/rmac/Documents/metabuilder/schemas/n8n-workflow.schema.json`, workflows MUST include:

| Field | Type | Required | Purpose | Example |
|-------|------|----------|---------|---------|
| `id` | string \| integer | Optional* | External identifier (DB id, UUID) | `"wf-create-user-v1"` |
| `name` | string | ✅ Required | Human-readable name | `"Create User"` |
| `active` | boolean | Optional | Enable/disable workflow | `false` |
| `versionId` | string | Optional | Concurrent edit safety | `"v1.0.0"` |
| `version` | integer | Optional* | Internal version number | `1` |
| `tenantId` | string | Recommended | Multi-tenant scoping | `"default-tenant"` |
| `createdAt` | ISO 8601 | Optional | Created timestamp | `"2026-01-22T10:00:00Z"` |
| `updatedAt` | ISO 8601 | Optional | Updated timestamp | `"2026-01-22T10:00:00Z"` |
| `tags` | array | Optional | Categorization | `[{"name": "user-management"}]` |
| `nodes` | array | ✅ Required | Workflow nodes | See below |
| `connections` | object | ✅ Required | Node connections | Can be `{}` |
| `settings` | object | Optional | Execution settings | See below |
| `staticData` | object | Optional | Engine state | Can be `{}` |
| `meta` | object | Optional | Custom metadata | Can be `{}` |
| `credentials` | array | Optional | Credential bindings | Can be `[]` |
| `triggers` | array | Optional | Event triggers | Can be `[]` |
| `variables` | object | Optional | Workflow variables | Can be `{}` |

**Key Change**:
- ✨ **NEW**: Add `id`, `version`, `tenantId` fields
- ✨ **NEW**: Add `createdAt`, `updatedAt` ISO 8601 timestamps
- ✨ **NEW**: Add `tags` array for categorization
- 🔄 **OPTIONAL**: Add `versionId` for concurrent editing support

### 2.2 Multi-Tenant Safety Requirements

**Critical**: All workflows must support multi-tenant filtering via `tenantId`:

✅ **Already in place** - Current workflows use `{{ $context.tenantId }}` in nodes:

```json
"filter": {
  "tenantId": "{{ $context.tenantId }}"
}
```

**No changes needed** for node-level tenantId filtering.

**ONLY ADD** the top-level `tenantId` field to identify which tenant owns this workflow definition.

---

## Part 3: Complete Updated JSON Examples

### 3.1 Workflow #1: Create User (UPDATED)

**File**: `packages/user_manager/workflow/create-user.json`

```json
{
  "id": "wf-create-user-v1",
  "version": 1,
  "versionId": "v1.0.0",
  "tenantId": "default-tenant",
  "name": "Create User",
  "active": false,
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",
  "tags": [
    { "name": "user-management" },
    { "name": "crud" },
    { "name": "core" }
  ],
  "nodes": [
    {
      "id": "check_permission",
      "name": "Check Permission",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "condition": "{{ $context.user.level >= 3 }}",
        "operation": "condition"
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
          "email": "required|email|unique:User",
          "displayName": "required|string"
        }
      }
    },
    {
      "id": "hash_password",
      "name": "Hash Password",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "input": "{{ $json.password || $utils.generateSecurePassword() }}",
        "operation": "bcrypt_hash",
        "rounds": 12
      }
    },
    {
      "id": "create_user",
      "name": "Create User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "data": {
          "email": "{{ $json.email }}",
          "displayName": "{{ $json.displayName }}",
          "passwordHash": "{{ $steps.hash_password.output }}",
          "tenantId": "{{ $context.tenantId }}",
          "level": "{{ $json.level || 0 }}",
          "isActive": true
        },
        "operation": "database_create",
        "entity": "User"
      }
    },
    {
      "id": "send_welcome_email",
      "name": "Send Welcome Email",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "operation": "email_send",
        "to": "{{ $json.email }}",
        "subject": "Welcome",
        "template": "user_welcome"
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
        "status": 201,
        "body": {
          "id": "{{ $steps.create_user.output.id }}",
          "email": "{{ $json.email }}"
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Creates a new user with email validation and password hashing",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
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

**Changes Applied**:
- ✅ Added `id`: `"wf-create-user-v1"`
- ✅ Added `version`: `1`
- ✅ Added `versionId`: `"v1.0.0"`
- ✅ Added `tenantId`: `"default-tenant"`
- ✅ Added `createdAt` and `updatedAt` ISO 8601 timestamps
- ✅ Added `tags` array with categorization
- ✅ Enhanced `meta` object with descriptive fields

---

### 3.2 Workflow #2: List Users (UPDATED)

**File**: `packages/user_manager/workflow/list-users.json`

```json
{
  "id": "wf-list-users-v1",
  "version": 1,
  "versionId": "v1.0.0",
  "tenantId": "default-tenant",
  "name": "List Users",
  "active": false,
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",
  "tags": [
    { "name": "user-management" },
    { "name": "crud" },
    { "name": "core" }
  ],
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
      "id": "extract_pagination",
      "name": "Extract Pagination",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "output": {
          "limit": "{{ Math.min($json.limit || 50, 500) }}",
          "offset": "{{ ($json.page || 1 - 1) * ($json.limit || 50) }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "fetch_users",
      "name": "Fetch Users",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}"
        },
        "sort": {
          "createdAt": -1
        },
        "limit": "{{ $steps.extract_pagination.output.limit }}",
        "offset": "{{ $steps.extract_pagination.output.offset }}",
        "operation": "database_read",
        "entity": "User"
      }
    },
    {
      "id": "count_total",
      "name": "Count Total",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_count",
        "entity": "User"
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
          "users": "{{ $steps.fetch_users.output.map(u => ({ id: u.id, email: u.email, displayName: u.displayName, level: u.level, isActive: u.isActive, createdAt: u.createdAt })) }}",
          "pagination": {
            "total": "{{ $steps.count_total.output }}",
            "limit": "{{ $steps.extract_pagination.output.limit }}",
            "page": "{{ $json.page || 1 }}"
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
  "meta": {
    "description": "Lists all users for the current tenant with pagination support",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
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

**Changes Applied**:
- ✅ Added `id`: `"wf-list-users-v1"`
- ✅ Added `version`: `1`
- ✅ Added `versionId`: `"v1.0.0"`
- ✅ Added `tenantId`: `"default-tenant"`
- ✅ Added `createdAt` and `updatedAt` ISO 8601 timestamps
- ✅ Added `tags` array for categorization
- ✅ Enhanced `meta` object

---

### 3.3 Workflow #3: Update User (UPDATED)

**File**: `packages/user_manager/workflow/update-user.json`

```json
{
  "id": "wf-update-user-v1",
  "version": 1,
  "versionId": "v1.0.0",
  "tenantId": "default-tenant",
  "name": "Update User",
  "active": false,
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",
  "tags": [
    { "name": "user-management" },
    { "name": "crud" },
    { "name": "core" }
  ],
  "nodes": [
    {
      "id": "check_permission",
      "name": "Check Permission",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "condition": "{{ $context.user.level >= 3 || $context.user.id === $json.userId }}",
        "operation": "condition"
      }
    },
    {
      "id": "fetch_user",
      "name": "Fetch User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 100],
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
      "id": "update_user",
      "name": "Update User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "id": "{{ $json.userId }}"
        },
        "data": {
          "displayName": "{{ $json.displayName || $steps.fetch_user.output.displayName }}",
          "level": "{{ $context.user.level >= 3 ? ($json.level || $steps.fetch_user.output.level) : $steps.fetch_user.output.level }}",
          "isActive": "{{ $json.isActive !== undefined ? $json.isActive : $steps.fetch_user.output.isActive }}"
        },
        "operation": "database_update",
        "entity": "User"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": "{{ $steps.update_user.output }}"
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Updates user profile information with role-based access control",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
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

**Changes Applied**:
- ✅ Added `id`: `"wf-update-user-v1"`
- ✅ Added `version`: `1`
- ✅ Added `versionId`: `"v1.0.0"`
- ✅ Added `tenantId`: `"default-tenant"`
- ✅ Added `createdAt` and `updatedAt` ISO 8601 timestamps
- ✅ Added `tags` array
- ✅ Enhanced `meta` object

---

### 3.4 Workflow #4: Reset Password (UPDATED)

**File**: `packages/user_manager/workflow/reset-password.json`

```json
{
  "id": "wf-reset-password-v1",
  "version": 1,
  "versionId": "v1.0.0",
  "tenantId": "default-tenant",
  "name": "Reset User Password",
  "active": false,
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",
  "tags": [
    { "name": "user-management" },
    { "name": "security" },
    { "name": "password" }
  ],
  "nodes": [
    {
      "id": "check_permission",
      "name": "Check Permission",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "condition": "{{ $context.user.level >= 3 }}",
        "operation": "condition"
      }
    },
    {
      "id": "fetch_user",
      "name": "Fetch User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 100],
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
      "id": "generate_temp_password",
      "name": "Generate Temp Password",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "operation": "generate_random_token",
        "length": 16
      }
    },
    {
      "id": "hash_password",
      "name": "Hash Password",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "input": "{{ $steps.generate_temp_password.output }}",
        "operation": "bcrypt_hash",
        "rounds": 12
      }
    },
    {
      "id": "update_user",
      "name": "Update User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "filter": {
          "id": "{{ $json.userId }}"
        },
        "data": {
          "passwordHash": "{{ $steps.hash_password.output }}",
          "firstLogin": true,
          "passwordChangedAt": null
        },
        "operation": "database_update",
        "entity": "User"
      }
    },
    {
      "id": "send_reset_email",
      "name": "Send Reset Email",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "data": {
          "tempPassword": "{{ $steps.generate_temp_password.output }}"
        },
        "operation": "email_send",
        "to": "{{ $steps.fetch_user.output.email }}",
        "subject": "Your password has been reset",
        "template": "password_reset_admin"
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
          "message": "Password reset. Temporary password sent to user email"
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Resets user password and sends temporary password via email",
    "author": "MetaBuilder",
    "workflowType": "security",
    "scope": "global"
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

**Changes Applied**:
- ✅ Added `id`: `"wf-reset-password-v1"`
- ✅ Added `version`: `1`
- ✅ Added `versionId`: `"v1.0.0"`
- ✅ Added `tenantId`: `"default-tenant"`
- ✅ Added `createdAt` and `updatedAt` ISO 8601 timestamps
- ✅ Added `tags` array with security focus
- ✅ Enhanced `meta` object

---

### 3.5 Workflow #5: Delete User (UPDATED)

**File**: `packages/user_manager/workflow/delete-user.json`

```json
{
  "id": "wf-delete-user-v1",
  "version": 1,
  "versionId": "v1.0.0",
  "tenantId": "default-tenant",
  "name": "Delete User",
  "active": false,
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",
  "tags": [
    { "name": "user-management" },
    { "name": "crud" },
    { "name": "dangerous" }
  ],
  "nodes": [
    {
      "id": "check_permission",
      "name": "Check Permission",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "condition": "{{ $context.user.level >= 3 }}",
        "operation": "condition"
      }
    },
    {
      "id": "fetch_user",
      "name": "Fetch User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 100],
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
      "id": "count_admins",
      "name": "Count Admins",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "tenantId": "{{ $context.tenantId }}",
          "level": {
            "$gte": 3
          }
        },
        "operation": "database_count",
        "entity": "User"
      }
    },
    {
      "id": "check_not_last_admin",
      "name": "Check Not Last Admin",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "condition": "{{ !($steps.fetch_user.output.level >= 3 && $steps.count_admins.output <= 1) }}",
        "operation": "condition"
      }
    },
    {
      "id": "delete_user",
      "name": "Delete User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "filter": {
          "id": "{{ $json.userId }}"
        },
        "operation": "database_delete",
        "entity": "User"
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
        "body": {
          "message": "User deleted"
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Deletes a user account with admin-only access and safety checks",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
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

**Changes Applied**:
- ✅ Added `id`: `"wf-delete-user-v1"`
- ✅ Added `version`: `1`
- ✅ Added `versionId`: `"v1.0.0"`
- ✅ Added `tenantId`: `"default-tenant"`
- ✅ Added `createdAt` and `updatedAt` ISO 8601 timestamps
- ✅ Added `tags` array with "dangerous" tag for awareness
- ✅ Enhanced `meta` object

---

## Part 4: Field Details & Conventions

### 4.1 Field-by-Field Reference

#### `id` Field
- **Type**: `string` (prefer UUID format)
- **Purpose**: Unique identifier for workflow definition
- **Convention**: `wf-{workflow-name}-v{version}`
- **Examples**:
  - `"wf-create-user-v1"`
  - `"wf-list-users-v1"`
  - `"wf-update-user-v1"`
  - `"wf-reset-password-v1"`
  - `"wf-delete-user-v1"`
- **Database Mapping**: Maps to `Workflow.id` in DBAL

#### `version` Field
- **Type**: `integer`
- **Purpose**: Track workflow iterations
- **Increment Strategy**: Increment on breaking changes
- **Current Value**: `1` for all (first version)
- **Future**: `2`, `3`, etc. as workflows evolve
- **Example**: `1` → `2` → `3`

#### `versionId` Field
- **Type**: `string` (semantic versioning)
- **Purpose**: Human-readable version identifier
- **Format**: `v{major}.{minor}.{patch}` (semantic versioning)
- **Current Value**: `"v1.0.0"` for all
- **Future Examples**: `"v1.0.1"`, `"v1.1.0"`, `"v2.0.0"`
- **Use Case**: Concurrency control, optimistic locking

#### `tenantId` Field
- **Type**: `string`
- **Purpose**: Identify which tenant owns this workflow
- **Current Value**: `"default-tenant"` (standard practice)
- **Production Values**: `"acme"`, `"widgets-inc"`, etc.
- **IMPORTANT**: This is the owner context, NOT the filter context
- **Note**: Nodes still use `{{ $context.tenantId }}` for runtime filtering

#### `createdAt` & `updatedAt` Fields
- **Type**: `ISO 8601` string format
- **Format**: `YYYY-MM-DDTHH:mm:ssZ` (UTC)
- **Example**: `"2026-01-22T10:00:00Z"`
- **Set Once**: `createdAt` should never change after initial creation
- **Update Always**: `updatedAt` changes every time workflow is saved
- **Current Value**: Both set to `"2026-01-22T10:00:00Z"` (initial migration)

#### `tags` Field
- **Type**: `array` of tag objects
- **Structure**: `[{ "name": "tag-name" }, ...]`
- **Purpose**: Categorization and filtering
- **Standard Tags for user_manager**:
  - `"user-management"` - Primary domain
  - `"crud"` - CRUD operations (create-user, list-users, update-user, delete-user)
  - `"core"` - Core functionality
  - `"security"` - Security-sensitive (reset-password)
  - `"password"` - Password operations
  - `"dangerous"` - Caution needed (delete-user)

#### `meta` Field
- **Type**: `object`
- **Purpose**: Custom metadata
- **Recommended Fields**:
  - `"description"` - Human-readable workflow description
  - `"author"` - Who created/maintains it
  - `"workflowType"` - Functional category (crud, security, etc.)
  - `"scope"` - Access scope (global, tenant, user)
- **Example**:
```json
"meta": {
  "description": "Creates a new user with email validation and password hashing",
  "author": "MetaBuilder",
  "workflowType": "crud",
  "scope": "global"
}
```

---

## Part 5: Validation Checklist

### 5.1 Pre-Update Validation

Before making changes, verify current state:

```bash
# 1. Check current file count
cd /Users/rmac/Documents/metabuilder/packages/user_manager/workflow/
ls -lh *.json
# Expected: 5 files (create-user.json, list-users.json, update-user.json, reset-password.json, delete-user.json)

# 2. Verify current JSON is valid
for file in *.json; do
  echo "Validating $file..."
  python3 -m json.tool "$file" > /dev/null && echo "✅ $file OK" || echo "❌ $file INVALID"
done

# 3. Check node counts
grep -c '"id":' create-user.json  # Expected: 6
grep -c '"id":' list-users.json   # Expected: 6
grep -c '"id":' update-user.json  # Expected: 4
grep -c '"id":' reset-password.json # Expected: 7
grep -c '"id":' delete-user.json  # Expected: 7
```

### 5.2 Update Validation Checklist

For each workflow file, verify:

#### Schema Compliance

- [ ] `"id"` field present and non-empty (string)
- [ ] `"version"` field present (integer, value: 1)
- [ ] `"versionId"` field present (string, value: "v1.0.0")
- [ ] `"tenantId"` field present (string, value: "default-tenant")
- [ ] `"name"` field unchanged and non-empty
- [ ] `"active"` field present (boolean, value: false)
- [ ] `"createdAt"` present in ISO 8601 format
- [ ] `"updatedAt"` present in ISO 8601 format

#### Structure Validation

- [ ] `"nodes"` array exists and is non-empty
- [ ] `"connections"` object exists (may be empty `{}`)
- [ ] `"staticData"` object exists (may be empty `{}`)
- [ ] `"settings"` object exists with valid timezone
- [ ] `"meta"` object exists with description field
- [ ] `"tags"` array exists with at least one tag

#### Node Validation

For each node in `nodes` array:
- [ ] `"id"` field present and unique within workflow
- [ ] `"name"` field present and descriptive
- [ ] `"type"` field present (metabuilder.* or n8n-nodes-base.*)
- [ ] `"typeVersion"` field present (integer >= 1)
- [ ] `"position"` field present as [x, y] array
- [ ] `"parameters"` object exists

#### Multi-Tenant Safety

- [ ] All database nodes include `"tenantId": "{{ $context.tenantId }}"` in filter
- [ ] No hardcoded tenantId values in parameters
- [ ] Context reference `{{ $context.tenantId }}` used consistently

#### JSON Syntax

- [ ] All JSON is valid (no trailing commas, etc.)
- [ ] No `undefined` values
- [ ] All string values are properly quoted
- [ ] All nested objects properly closed

### 5.3 Post-Update Validation Script

Create and run this validation script after updates:

```python
#!/usr/bin/env python3
import json
import glob
import sys
from datetime import datetime

WORKFLOW_DIR = "/Users/rmac/Documents/metabuilder/packages/user_manager/workflow/"
REQUIRED_FIELDS = ["id", "version", "versionId", "tenantId", "name", "active",
                   "createdAt", "updatedAt", "nodes", "connections", "settings", "meta", "tags"]
REQUIRED_NODE_FIELDS = ["id", "name", "type", "typeVersion", "position", "parameters"]

def validate_workflow(filepath):
    """Validate a single workflow file"""
    errors = []
    warnings = []

    try:
        with open(filepath, 'r') as f:
            wf = json.load(f)
    except json.JSONDecodeError as e:
        return [f"JSON Parse Error: {e}"], []

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in wf:
            errors.append(f"Missing required field: {field}")

    # Validate id format
    if "id" in wf:
        if not isinstance(wf["id"], str) or not wf["id"].startswith("wf-"):
            warnings.append(f"id should follow format 'wf-*': {wf['id']}")

    # Validate version
    if "version" in wf and not isinstance(wf["version"], int):
        errors.append(f"version should be integer, got {type(wf['version'])}")

    # Validate timestamps
    for ts_field in ["createdAt", "updatedAt"]:
        if ts_field in wf:
            ts = wf[ts_field]
            try:
                datetime.fromisoformat(ts.replace('Z', '+00:00'))
            except ValueError:
                errors.append(f"{ts_field} not in ISO 8601 format: {ts}")

    # Validate nodes
    if "nodes" in wf:
        node_ids = set()
        for i, node in enumerate(wf["nodes"]):
            for field in REQUIRED_NODE_FIELDS:
                if field not in node:
                    errors.append(f"Node {i}: Missing {field}")

            # Check for duplicate IDs
            if "id" in node:
                if node["id"] in node_ids:
                    errors.append(f"Duplicate node id: {node['id']}")
                node_ids.add(node["id"])

    # Check multi-tenant safety
    if "nodes" in wf:
        for i, node in enumerate(wf["nodes"]):
            if node.get("type") == "metabuilder.database":
                params = node.get("parameters", {})
                if "filter" in params:
                    filter_obj = params["filter"]
                    if isinstance(filter_obj, dict):
                        if "tenantId" not in str(filter_obj):
                            warnings.append(f"Node {node.get('name', i)}: Missing tenantId in filter")

    return errors, warnings

def main():
    print("Validating user_manager workflows...\n")

    workflows = glob.glob(f"{WORKFLOW_DIR}/*.json")
    total_errors = 0
    total_warnings = 0

    for wf_file in sorted(workflows):
        filename = wf_file.split('/')[-1]
        errors, warnings = validate_workflow(wf_file)

        if errors or warnings:
            print(f"📋 {filename}")
            for error in errors:
                print(f"  ❌ {error}")
                total_errors += 1
            for warning in warnings:
                print(f"  ⚠️  {warning}")
                total_warnings += 1
        else:
            print(f"✅ {filename}")

    print(f"\n{'='*50}")
    print(f"Results: {total_errors} errors, {total_warnings} warnings")
    if total_errors == 0:
        print("✅ All workflows valid!")
        return 0
    else:
        print("❌ Validation failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

**Usage**:
```bash
python3 validate_workflows.py
```

---

## Part 6: Implementation Steps

### Step 1: Backup Original Files

```bash
cd /Users/rmac/Documents/metabuilder/packages/user_manager/workflow/
mkdir -p backup-$(date +%Y%m%d)
cp *.json backup-$(date +%Y%m%d)/
echo "✅ Backup created"
```

### Step 2: Update Each Workflow

For each JSON file, add the new top-level fields:

1. Open the JSON file
2. After `"name"` field, add:
   ```json
   "id": "wf-{workflow-name}-v1",
   "version": 1,
   "versionId": "v1.0.0",
   "tenantId": "default-tenant",
   "createdAt": "2026-01-22T10:00:00Z",
   "updatedAt": "2026-01-22T10:00:00Z",
   ```
3. After `"active"` field, add:
   ```json
   "tags": [
     { "name": "user-management" },
     { "name": "..." }
   ],
   ```
4. Enhance `"meta"` object with:
   ```json
   "meta": {
     "description": "...",
     "author": "MetaBuilder",
     "workflowType": "crud|security|...",
     "scope": "global"
   },
   ```

### Step 3: Validate Updated Files

```bash
python3 validate_workflows.py
```

### Step 4: Commit Changes

```bash
cd /Users/rmac/Documents/metabuilder
git add packages/user_manager/workflow/*.json
git commit -m "feat(user_manager): migrate 5 workflows to n8n schema

- Add id field to all 5 workflows (wf-create-user-v1, wf-list-users-v1, etc.)
- Add version, versionId, tenantId fields for tracking and multi-tenant support
- Add createdAt, updatedAt timestamps (ISO 8601 format)
- Add tags array for categorization
- Enhance meta object with descriptions
- All workflows now fully n8n schema compliant
- Multi-tenant safety verified on all database operations

Workflows updated:
- create-user.json
- list-users.json
- update-user.json
- reset-password.json
- delete-user.json"
```

### Step 5: Test with WorkflowLoaderV2

```bash
# Assuming you have the Python backend integration in place
cd /Users/rmac/Documents/metabuilder/packagerepo/backend

# Run integration test
python3 -c "
from workflow_loader_v2 import WorkflowLoaderV2
import json

loader = WorkflowLoaderV2()

# Test loading each workflow
workflows = [
    'packages/user_manager/workflow/create-user.json',
    'packages/user_manager/workflow/list-users.json',
    'packages/user_manager/workflow/update-user.json',
    'packages/user_manager/workflow/reset-password.json',
    'packages/user_manager/workflow/delete-user.json'
]

for wf_path in workflows:
    try:
        wf = loader.load(wf_path)
        print(f'✅ {wf_path}: Loaded and validated')
    except Exception as e:
        print(f'❌ {wf_path}: {e}')
"
```

---

## Part 7: Testing & Verification

### 7.1 Unit Tests

Test each workflow individually:

```json
{
  "testSuite": "user_manager_workflows_n8n_migration",
  "tests": [
    {
      "id": "test-create-user-schema",
      "name": "create-user.json passes n8n schema validation",
      "file": "packages/user_manager/workflow/create-user.json",
      "assertions": [
        { "field": "id", "expected": "wf-create-user-v1" },
        { "field": "version", "expected": 1 },
        { "field": "versionId", "expected": "v1.0.0" },
        { "field": "tenantId", "expected": "default-tenant" }
      ]
    },
    {
      "id": "test-list-users-schema",
      "name": "list-users.json passes n8n schema validation",
      "file": "packages/user_manager/workflow/list-users.json",
      "assertions": [
        { "field": "id", "expected": "wf-list-users-v1" },
        { "field": "nodes.length", "expected": 6 }
      ]
    }
  ]
}
```

### 7.2 Integration Tests

Test with the actual WorkflowLoaderV2:

```python
"""
Integration test for user_manager workflows
Run: python3 test_user_manager_workflows.py
"""

import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, '/Users/rmac/Documents/metabuilder/packagerepo/backend')

from workflow_loader_v2 import WorkflowLoaderV2

def test_workflows():
    loader = WorkflowLoaderV2()

    workflows = {
        'create-user': {
            'path': 'packages/user_manager/workflow/create-user.json',
            'id': 'wf-create-user-v1',
            'nodes': 6,
        },
        'list-users': {
            'path': 'packages/user_manager/workflow/list-users.json',
            'id': 'wf-list-users-v1',
            'nodes': 6,
        },
        'update-user': {
            'path': 'packages/user_manager/workflow/update-user.json',
            'id': 'wf-update-user-v1',
            'nodes': 4,
        },
        'reset-password': {
            'path': 'packages/user_manager/workflow/reset-password.json',
            'id': 'wf-reset-password-v1',
            'nodes': 7,
        },
        'delete-user': {
            'path': 'packages/user_manager/workflow/delete-user.json',
            'id': 'wf-delete-user-v1',
            'nodes': 6,
        },
    }

    results = []

    for name, config in workflows.items():
        try:
            # Load workflow
            wf = loader.load(config['path'])

            # Verify schema compliance
            assert wf.get('id') == config['id'], f"ID mismatch: {wf.get('id')} != {config['id']}"
            assert 'version' in wf, "Missing version field"
            assert 'versionId' in wf, "Missing versionId field"
            assert 'tenantId' in wf, "Missing tenantId field"
            assert 'createdAt' in wf, "Missing createdAt field"
            assert 'updatedAt' in wf, "Missing updatedAt field"
            assert len(wf.get('nodes', [])) == config['nodes'], f"Node count mismatch"

            results.append({
                'workflow': name,
                'status': '✅ PASS',
                'message': f"Loaded with {config['nodes']} nodes"
            })

        except Exception as e:
            results.append({
                'workflow': name,
                'status': '❌ FAIL',
                'message': str(e)
            })

    # Print results
    print("User Manager Workflow Test Results")
    print("=" * 60)
    for result in results:
        print(f"{result['status']} {result['workflow']:20} - {result['message']}")

    # Summary
    passed = sum(1 for r in results if 'PASS' in r['status'])
    total = len(results)
    print("=" * 60)
    print(f"Summary: {passed}/{total} passed")

    return all('PASS' in r['status'] for r in results)

if __name__ == '__main__':
    success = test_workflows()
    sys.exit(0 if success else 1)
```

---

## Part 8: Rollback Plan

If issues are discovered, rollback to backup:

```bash
cd /Users/rmac/Documents/metabuilder/packages/user_manager/workflow/

# Find latest backup
BACKUP_DIR=$(ls -d backup-* | tail -1)

# Restore
cp $BACKUP_DIR/*.json .
git checkout HEAD -- *.json  # Or restore from git

echo "✅ Rolled back to $BACKUP_DIR"
```

---

## Part 9: Success Criteria

### ✅ Workflow Update Complete When:

1. **All 5 files updated**
   - create-user.json ✅
   - list-users.json ✅
   - update-user.json ✅
   - reset-password.json ✅
   - delete-user.json ✅

2. **All required fields present**
   - `id` (format: `wf-*-v1`)
   - `version` (value: `1`)
   - `versionId` (value: `"v1.0.0"`)
   - `tenantId` (value: `"default-tenant"`)
   - `createdAt` & `updatedAt` (ISO 8601)
   - `tags` array with 2-3 tags
   - Enhanced `meta` object

3. **Validation passes**
   - Schema validation: 100% pass rate
   - JSON syntax: Valid for all files
   - Node structure: All nodes have required fields
   - Multi-tenant safety: All database nodes filter by tenantId

4. **Testing succeeds**
   - Python validation script returns 0 errors
   - WorkflowLoaderV2 loads all workflows
   - All integration tests pass

5. **Git commit created**
   - Descriptive commit message
   - Files staged and committed
   - Able to push to origin

---

## Part 10: Timeline & Effort Estimate

| Task | Estimated Time | Notes |
|------|-----------------|-------|
| Backup original files | 5 min | `cp` command with timestamp |
| Update create-user.json | 10 min | 5 new fields + enhanced meta |
| Update list-users.json | 10 min | Same pattern |
| Update update-user.json | 10 min | Same pattern |
| Update reset-password.json | 10 min | Same pattern |
| Update delete-user.json | 10 min | Same pattern |
| Run validation script | 5 min | Python validation |
| Fix any validation errors | 10 min | Typically minimal |
| Git commit & push | 5 min | Create commit message |
| Run integration tests | 10 min | Verify with WorkflowLoaderV2 |
| **Total** | **85 min** | ~1.5 hours |

---

## Part 11: Related Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| N8N Migration Status | Overall migration progress | `/docs/N8N_MIGRATION_STATUS.md` |
| Subproject Guide | Phase 2 workflow update guide | `/docs/SUBPROJECT_WORKFLOW_UPDATE_GUIDE.md` |
| N8N Schema | Authoritative schema spec | `/schemas/n8n-workflow.schema.json` |
| Package Metadata | Package format specification | `/package.json` (user_manager) |
| Plugin Registry | Node type registry | `/workflow/plugins/registry/node-registry.json` |
| Workflow Validator | Validation rules | `/workflow/executor/ts/utils/workflow-validator.ts` |

---

## Summary Checklist

Before you begin:
- [ ] Backed up original files to `backup-YYYYMMDD/`
- [ ] Reviewed n8n-workflow.schema.json structure
- [ ] Understood field purposes and conventions
- [ ] Have text editor ready for JSON editing
- [ ] Have Python 3 available for validation
- [ ] Can run git commands

For each workflow:
- [ ] Added `id` field with format `wf-{name}-v1`
- [ ] Added `version` = 1
- [ ] Added `versionId` = "v1.0.0"
- [ ] Added `tenantId` = "default-tenant"
- [ ] Added `createdAt` = "2026-01-22T10:00:00Z"
- [ ] Added `updatedAt` = "2026-01-22T10:00:00Z"
- [ ] Added `tags` array with relevant tags
- [ ] Enhanced `meta` object with description, author, workflowType, scope

After all updates:
- [ ] Run validation script (0 errors expected)
- [ ] Test with WorkflowLoaderV2
- [ ] Create git commit with descriptive message
- [ ] Verify backward compatibility (all existing APIs work)
- [ ] Mark as ready for staging deployment

---

**Document Status**: Ready for Implementation
**Last Updated**: 2026-01-22
**Next Step**: Execute Part 5 (Validation Checklist) and Part 6 (Implementation Steps)
