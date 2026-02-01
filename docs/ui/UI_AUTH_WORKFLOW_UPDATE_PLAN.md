# ui_auth Package - Workflow Modernization Plan

**Date**: 2026-01-22
**Package**: `ui_auth` (Authentication UI Package)
**Total Workflows**: 4
**Scope**: Complete N8N schema compliance with multi-tenant safety
**Status**: Ready for Implementation

---

## Executive Summary

This document provides a detailed update plan for all 4 workflows in the `ui_auth` package. Each workflow is currently missing required N8N schema fields (`id`, `tenantId`, and `versionId`). The plan ensures complete compliance with the n8n workflow standard and MetaBuilder security requirements.

**Current State**: All 4 workflows exist but lack proper metadata fields
**Target State**: Full N8N compliance with comprehensive validation

---

## Table of Contents

1. [Workflow Inventory](#workflow-inventory)
2. [Workflow 1: Login Workflow](#workflow-1-login-workflow)
3. [Workflow 2: Register Workflow](#workflow-2-register-workflow)
4. [Workflow 3: Password Reset Workflow](#workflow-3-password-reset-workflow)
5. [Workflow 4: Password Change Workflow](#workflow-4-password-change-workflow)
6. [Cross-Workflow Validation](#cross-workflow-validation)
7. [Implementation Sequence](#implementation-sequence)
8. [Rollback Plan](#rollback-plan)

---

## Workflow Inventory

| # | Name | File | Nodes | Current Status | Required Changes |
|---|------|------|-------|-----------------|-----------------|
| 1 | Login Workflow | `workflow/login-workflow.json` | 12 | ⚠️ Missing metadata | Add id, tenantId, versionId, tags, createdAt, updatedAt |
| 2 | Register Workflow | `workflow/register-workflow.json` | 7 | ⚠️ Missing metadata | Add id, tenantId, versionId, tags, createdAt, updatedAt |
| 3 | Password Reset Workflow | `workflow/password-reset-workflow.json` | 9 | ⚠️ Missing metadata | Add id, tenantId, versionId, tags, createdAt, updatedAt |
| 4 | Password Change Workflow | `workflow/password-change-workflow.json` | 11 | ⚠️ Missing metadata | Add id, tenantId, versionId, tags, createdAt, updatedAt |

---

## Workflow 1: Login Workflow

### File Location
```
packages/ui_auth/workflow/login-workflow.json
```

### Current Structure Snippet
```json
{
  "name": "Login Workflow",
  "active": false,
  "nodes": [
    {
      "id": "apply_rate_limit",
      "name": "Apply Rate Limit",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ $json.email }}",
        "limit": 5,
        "window": 60000,
        "errorMessage": "Too many login attempts. Please try again in a few minutes."
      }
    },
    // ... 11 more nodes
  ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Required Changes

| Field | Current | Required | Reason |
|-------|---------|----------|--------|
| `id` | ❌ Missing | `uuid_v4()` or `"auth_login_v1"` | Enable versioning, audit trails |
| `tenantId` | ❌ Missing | `"*"` (system workflow) | Multi-tenant safety, isolation |
| `versionId` | ❌ Missing | `"1.0.0"` | Optimistic concurrency locking |
| `tags` | ❌ Missing | `[{name: "authentication"}, {name: "login"}]` | Categorization and discovery |
| `createdAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `updatedAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `active` | ✅ Present | `false` (keep) | Already correct |
| `settings` | ✅ Present | Verify `executionTimeout` | Check timeout is adequate (3600s = 1hr) |

### Security Validation Points

- ✅ **Multi-Tenant**: Uses `tenantId` from fetched user for session isolation
- ✅ **Rate Limiting**: 5 attempts/60s on `{{ $json.email }}`
- ✅ **Password Security**: Uses bcrypt_compare, never logs password
- ✅ **Session Security**: JWT generation with proper expiry (24h)
- ⚠️ **IP Tracking**: Records ipAddress and userAgent for session audit
- ⚠️ **Event Logging**: Emits `user_login` event for audit trail

### Complete Updated JSON Example

```json
{
  "id": "auth_login_v1",
  "name": "Login Workflow",
  "active": false,
  "tenantId": "*",
  "versionId": "1.0.0",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "authentication" },
    { "name": "login" },
    { "name": "user" }
  ],
  "nodes": [
    {
      "id": "apply_rate_limit",
      "name": "Apply Rate Limit",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ $json.email }}",
        "limit": 5,
        "window": 60000,
        "errorMessage": "Too many login attempts. Please try again in a few minutes."
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
          "email": "required|email",
          "password": "required|string|minLength:6"
        }
      }
    },
    {
      "id": "fetch_user",
      "name": "Fetch User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "email": "{{ $json.email }}"
        },
        "operation": "database_read",
        "entity": "User"
      }
    },
    {
      "id": "check_user_exists",
      "name": "Check User Exists",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "condition": "{{ $steps.fetch_user.output !== null }}",
        "operation": "condition"
      }
    },
    {
      "id": "verify_password",
      "name": "Verify Password",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "input": "{{ $json.password }}",
        "operation": "bcrypt_compare",
        "hash": "{{ $steps.fetch_user.output.passwordHash }}"
      }
    },
    {
      "id": "check_password_valid",
      "name": "Check Password Valid",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "condition": "{{ $steps.verify_password.output === true }}",
        "operation": "condition"
      }
    },
    {
      "id": "check_account_active",
      "name": "Check Account Active",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "condition": "{{ $steps.fetch_user.output.isActive !== false }}",
        "operation": "condition"
      }
    },
    {
      "id": "generate_session",
      "name": "Generate Session",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 500],
      "parameters": {
        "operation": "generate_jwt",
        "payload": {
          "userId": "{{ $steps.fetch_user.output.id }}",
          "email": "{{ $steps.fetch_user.output.email }}",
          "tenantId": "{{ $steps.fetch_user.output.tenantId }}",
          "level": "{{ $steps.fetch_user.output.level }}"
        },
        "secret": "{{ $env.JWT_SECRET }}",
        "expiresIn": "24h"
      }
    },
    {
      "id": "create_session_record",
      "name": "Create Session Record",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 500],
      "parameters": {
        "data": {
          "userId": "{{ $steps.fetch_user.output.id }}",
          "tenantId": "{{ $steps.fetch_user.output.tenantId }}",
          "token": "{{ $steps.generate_session.output }}",
          "ipAddress": "{{ $json.ipAddress }}",
          "userAgent": "{{ $json.userAgent }}",
          "expiresAt": "{{ new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }}"
        },
        "operation": "database_create",
        "entity": "Session"
      }
    },
    {
      "id": "update_last_login",
      "name": "Update Last Login",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 700],
      "parameters": {
        "filter": {
          "id": "{{ $steps.fetch_user.output.id }}"
        },
        "data": {
          "lastLogin": "{{ new Date().toISOString() }}"
        },
        "operation": "database_update",
        "entity": "User"
      }
    },
    {
      "id": "emit_login_event",
      "name": "Emit Login Event",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 700],
      "parameters": {
        "data": {
          "userId": "{{ $steps.fetch_user.output.id }}",
          "tenantId": "{{ $steps.fetch_user.output.tenantId }}",
          "timestamp": "{{ new Date().toISOString() }}"
        },
        "action": "emit_event",
        "event": "user_login",
        "channel": "{{ 'user:' + $steps.fetch_user.output.id }}"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 700],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "token": "{{ $steps.generate_session.output }}",
          "user": {
            "id": "{{ $steps.fetch_user.output.id }}",
            "email": "{{ $steps.fetch_user.output.email }}",
            "displayName": "{{ $steps.fetch_user.output.displayName }}",
            "tenantId": "{{ $steps.fetch_user.output.tenantId }}"
          }
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Authenticates user with email and password, generates JWT session token",
    "category": "authentication",
    "security_level": "critical",
    "dependencies": ["User", "Session"]
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

### Validation Checklist

- [ ] **Schema Compliance**
  - [ ] All required fields present (id, name, active, nodes, connections)
  - [ ] All optional metadata fields valid (tenantId, versionId, tags, createdAt, updatedAt)
  - [ ] No additional properties beyond schema
  - [ ] All node ids are unique and lowercase snake_case
  - [ ] All node positions are [x, y] coordinate arrays
  - [ ] All typeVersions are positive integers

- [ ] **Multi-Tenant Safety**
  - [ ] `tenantId` field set to `"*"` (system workflow)
  - [ ] All database operations include tenant filter
  - [ ] Fetched user's tenantId used for session creation
  - [ ] Session record includes tenantId
  - [ ] Event emission includes tenant context

- [ ] **Security**
  - [ ] Rate limiting applied (5 attempts/60s)
  - [ ] Password verification uses bcrypt_compare (not plain text)
  - [ ] No password stored in outputs or logs
  - [ ] Account active status checked before login
  - [ ] Session expiry set to reasonable duration (24h)
  - [ ] Last login timestamp updated
  - [ ] Login event emitted for audit trail

- [ ] **Data Validation**
  - [ ] Email format validated
  - [ ] Password minimum length enforced (6 chars)
  - [ ] User existence verified before password check
  - [ ] Session data complete and properly structured
  - [ ] Response excludes sensitive data (no passwordHash)

- [ ] **Performance**
  - [ ] Execution timeout adequate (3600s)
  - [ ] No unbounded loops or queries
  - [ ] Conditions prevent unnecessary database calls
  - [ ] Parallel operations optimized

---

## Workflow 2: Register Workflow

### File Location
```
packages/ui_auth/workflow/register-workflow.json
```

### Current Structure Snippet
```json
{
  "name": "Register Workflow",
  "active": false,
  "nodes": [
    {
      "id": "apply_rate_limit",
      "name": "Apply Rate Limit",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ $json.email }}",
        "limit": 3,
        "window": 3600000
      }
    },
    // ... 6 more nodes
  ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Required Changes

| Field | Current | Required | Reason |
|-------|---------|----------|--------|
| `id` | ❌ Missing | `"auth_register_v1"` | Enable versioning, audit trails |
| `tenantId` | ❌ Missing | `"*"` (system workflow) | Multi-tenant safety |
| `versionId` | ❌ Missing | `"1.0.0"` | Optimistic concurrency locking |
| `tags` | ❌ Missing | `[{name: "authentication"}, {name: "registration"}]` | Categorization |
| `createdAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `updatedAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `active` | ✅ Present | `false` (keep) | Already correct |
| `settings.executionTimeout` | 3600 | Keep 3600 | Email sending may need time |

### Security Validation Points

- ✅ **Rate Limiting**: 3 attempts/3600s (1 per hour) per email
- ✅ **Password Requirements**: 8 chars min, requires mixed case + digit
- ✅ **Email Verification**: Token-based with expiry (24h)
- ✅ **Account Status**: Created inactive until email verified
- ✅ **Password Hashing**: bcrypt with 12 rounds
- ✅ **Unique Email**: Validation rule enforces `unique:User`
- ⚠️ **Token Security**: Verification token stored plain (acceptable for initial dev)

### Complete Updated JSON Example

```json
{
  "id": "auth_register_v1",
  "name": "Register Workflow",
  "active": false,
  "tenantId": "*",
  "versionId": "1.0.0",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "authentication" },
    { "name": "registration" },
    { "name": "user" }
  ],
  "nodes": [
    {
      "id": "apply_rate_limit",
      "name": "Apply Rate Limit",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ $json.email }}",
        "limit": 3,
        "window": 3600000
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
          "password": "required|string|minLength:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/",
          "displayName": "required|string|minLength:2|maxLength:100"
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
        "input": "{{ $json.password }}",
        "operation": "bcrypt_hash",
        "rounds": 12
      }
    },
    {
      "id": "generate_verification_token",
      "name": "Generate Verification Token",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "operation": "generate_random_token",
        "length": 32
      }
    },
    {
      "id": "create_user",
      "name": "Create User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "data": {
          "email": "{{ $json.email }}",
          "passwordHash": "{{ $steps.hash_password.output }}",
          "displayName": "{{ $json.displayName }}",
          "tenantId": "{{ $json.tenantId }}",
          "level": 0,
          "isActive": false,
          "isEmailVerified": false,
          "verificationToken": "{{ $steps.generate_verification_token.output }}",
          "verificationTokenExpiresAt": "{{ new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }}",
          "firstLogin": true,
          "createdAt": "{{ new Date().toISOString() }}"
        },
        "operation": "database_create",
        "entity": "User"
      }
    },
    {
      "id": "send_verification_email",
      "name": "Send Verification Email",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "data": {
          "displayName": "{{ $json.displayName }}",
          "verificationLink": "{{ $env.APP_URL }}/auth/verify/{{ $steps.generate_verification_token.output }}"
        },
        "operation": "email_send",
        "to": "{{ $json.email }}",
        "subject": "Verify your email address",
        "template": "email_verification"
      }
    },
    {
      "id": "emit_register_event",
      "name": "Emit Register Event",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "data": {
          "userId": "{{ $steps.create_user.output.id }}",
          "email": "{{ $json.email }}",
          "displayName": "{{ $json.displayName }}"
        },
        "action": "emit_event",
        "event": "user_registered",
        "channel": "{{ 'tenant:' + $json.tenantId }}"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 500],
      "parameters": {
        "action": "http_response",
        "status": 201,
        "body": {
          "message": "Registration successful. Please verify your email address.",
          "userId": "{{ $steps.create_user.output.id }}",
          "email": "{{ $json.email }}"
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Registers new user with email verification, creates inactive account until verified",
    "category": "authentication",
    "security_level": "critical",
    "dependencies": ["User"],
    "email_template_required": "email_verification"
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

### Validation Checklist

- [ ] **Schema Compliance**
  - [ ] All required fields present
  - [ ] All metadata fields valid (id, tenantId, versionId, tags)
  - [ ] Node ids unique and properly formatted
  - [ ] All positions valid [x, y] coordinates
  - [ ] All typeVersions valid

- [ ] **Multi-Tenant Safety**
  - [ ] `tenantId` set to `"*"`
  - [ ] User created with provided tenantId
  - [ ] Event emission includes tenant context
  - [ ] No cross-tenant data leakage

- [ ] **Security**
  - [ ] Rate limiting applied (3 attempts/3600s)
  - [ ] Email uniqueness validation enforced
  - [ ] Password requirements enforced (8 chars, mixed case, digit)
  - [ ] Password hashed with bcrypt (12 rounds)
  - [ ] Verification token generated (32 chars)
  - [ ] Token expires after 24 hours
  - [ ] Account created inactive (isActive: false)
  - [ ] Verification email sent
  - [ ] Registration event logged

- [ ] **Data Validation**
  - [ ] Email format validated
  - [ ] Display name length validated (2-100 chars)
  - [ ] Password complexity validated
  - [ ] Email uniqueness checked
  - [ ] All user fields properly set

- [ ] **Email Integration**
  - [ ] Verification link includes token
  - [ ] Link includes APP_URL environment variable
  - [ ] Template reference valid (email_verification)
  - [ ] Email sent successfully

---

## Workflow 3: Password Reset Workflow

### File Location
```
packages/ui_auth/workflow/password-reset-workflow.json
```

### Current Structure Snippet
```json
{
  "name": "Password Reset Workflow",
  "active": false,
  "nodes": [
    {
      "id": "apply_rate_limit",
      "name": "Apply Rate Limit",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ $json.email }}",
        "limit": 3,
        "window": 3600000
      }
    },
    // ... 8 more nodes
  ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Required Changes

| Field | Current | Required | Reason |
|-------|---------|----------|--------|
| `id` | ❌ Missing | `"auth_password_reset_v1"` | Enable versioning |
| `tenantId` | ❌ Missing | `"*"` (system workflow) | Multi-tenant safety |
| `versionId` | ❌ Missing | `"1.0.0"` | Concurrency control |
| `tags` | ❌ Missing | `[{name: "authentication"}, {name: "password"}]` | Categorization |
| `createdAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `updatedAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `settings.executionTimeout` | 3600 | Keep 3600 | Email delivery needs time |

### Security Validation Points

- ✅ **Rate Limiting**: 3 attempts/3600s per email (prevents enumeration)
- ✅ **User Privacy**: Returns same response whether user exists or not (prevents email enumeration)
- ✅ **Token Security**: Reset token hashed with SHA256 before storage
- ✅ **Token Expiry**: 1 hour expiration for reset token
- ✅ **Email Verification**: Sends reset link only (no token in response)
- ⚠️ **Token Generation**: Uses random token generation (secure)

### Complete Updated JSON Example

```json
{
  "id": "auth_password_reset_v1",
  "name": "Password Reset Workflow",
  "active": false,
  "tenantId": "*",
  "versionId": "1.0.0",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "authentication" },
    { "name": "password" },
    { "name": "security" }
  ],
  "nodes": [
    {
      "id": "apply_rate_limit",
      "name": "Apply Rate Limit",
      "type": "metabuilder.rateLimit",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "operation": "rate_limit",
        "key": "{{ $json.email }}",
        "limit": 3,
        "window": 3600000
      }
    },
    {
      "id": "validate_email",
      "name": "Validate Email",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "email": "required|email"
        }
      }
    },
    {
      "id": "fetch_user",
      "name": "Fetch User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "email": "{{ $json.email }}"
        },
        "operation": "database_read",
        "entity": "User"
      }
    },
    {
      "id": "check_user_exists",
      "name": "Check User Exists",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "condition": "{{ $steps.fetch_user.output !== null }}",
        "operation": "condition"
      }
    },
    {
      "id": "generate_reset_token",
      "name": "Generate Reset Token",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "operation": "generate_random_token",
        "length": 32
      }
    },
    {
      "id": "hash_reset_token",
      "name": "Hash Reset Token",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "input": "{{ $steps.generate_reset_token.output }}",
        "operation": "sha256"
      }
    },
    {
      "id": "create_reset_request",
      "name": "Create Reset Request",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "data": {
          "userId": "{{ $steps.fetch_user.output.id }}",
          "token": "{{ $steps.hash_reset_token.output }}",
          "expiresAt": "{{ new Date(Date.now() + 60 * 60 * 1000).toISOString() }}"
        },
        "operation": "database_create",
        "entity": "PasswordResetToken"
      }
    },
    {
      "id": "send_reset_email",
      "name": "Send Reset Email",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 500],
      "parameters": {
        "data": {
          "displayName": "{{ $steps.fetch_user.output.displayName }}",
          "resetLink": "{{ $env.APP_URL }}/auth/reset-password/{{ $steps.generate_reset_token.output }}",
          "expiresIn": "1 hour"
        },
        "operation": "email_send",
        "to": "{{ $json.email }}",
        "subject": "Reset your password",
        "template": "password_reset"
      }
    },
    {
      "id": "emit_event",
      "name": "Emit Event",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [700, 500],
      "parameters": {
        "data": {
          "email": "{{ $json.email }}"
        },
        "action": "emit_event",
        "event": "password_reset_requested",
        "channel": "{{ 'user:' + $steps.fetch_user.output.id }}"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 700],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "message": "If an account exists with that email, a password reset link has been sent."
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Initiates password reset flow with secure token generation and email delivery",
    "category": "authentication",
    "security_level": "critical",
    "dependencies": ["User", "PasswordResetToken"],
    "email_template_required": "password_reset",
    "privacy_note": "Returns same response regardless of user existence (prevents enumeration)"
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

### Validation Checklist

- [ ] **Schema Compliance**
  - [ ] All required fields present
  - [ ] All metadata fields valid
  - [ ] Node ids unique and properly formatted
  - [ ] All positions valid [x, y] coordinates
  - [ ] All typeVersions valid

- [ ] **Multi-Tenant Safety**
  - [ ] `tenantId` set to `"*"`
  - [ ] User lookup doesn't leak tenant information
  - [ ] Reset token isolated to user's tenant
  - [ ] Event includes user context

- [ ] **Security**
  - [ ] Rate limiting applied (3 attempts/3600s)
  - [ ] Email validation enforced
  - [ ] Token generation random and secure (32 chars)
  - [ ] Token hashed with SHA256 before storage
  - [ ] Token expires after 1 hour
  - [ ] Same response sent regardless of user existence
  - [ ] Reset link includes unencrypted token (for user)
  - [ ] Stored token is hashed (not plaintext)
  - [ ] Email sent with reset link
  - [ ] Event logged for audit

- [ ] **Privacy**
  - [ ] Email enumeration prevented (same response)
  - [ ] Token not exposed in response
  - [ ] User identity not revealed in response
  - [ ] Email template used for security

- [ ] **Data Validation**
  - [ ] Email format validated
  - [ ] User existence checked
  - [ ] Reset token properly structured
  - [ ] Expiry timestamp valid ISO format

---

## Workflow 4: Password Change Workflow

### File Location
```
packages/ui_auth/workflow/password-change-workflow.json
```

### Current Structure Snippet
```json
{
  "name": "Password Change Workflow",
  "active": false,
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
    // ... 10 more nodes
  ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": {
    "timezone": "UTC",
    "executionTimeout": 3600,
    "saveExecutionProgress": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

### Required Changes

| Field | Current | Required | Reason |
|-------|---------|----------|--------|
| `id` | ❌ Missing | `"auth_password_change_v1"` | Enable versioning |
| `tenantId` | ❌ Missing | `"*"` (system workflow) | Multi-tenant safety |
| `versionId` | ❌ Missing | `"1.0.0"` | Concurrency control |
| `tags` | ❌ Missing | `[{name: "authentication"}, {name: "password"}]` | Categorization |
| `createdAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `updatedAt` | ❌ Missing | Current ISO timestamp | Audit trail |
| `settings.executionTimeout` | 3600 | Keep 3600 | Adequate for operation |

### Security Validation Points

- ✅ **Authentication**: Requires user context (`$context.user.id`)
- ✅ **Multi-Tenant**: Filters fetch by both userId and tenantId
- ✅ **Current Password**: Verified with bcrypt_compare before allowing change
- ✅ **Password Requirements**: New password must differ from old
- ✅ **Confirmation**: New password confirmed (same:newPassword rule)
- ✅ **Session Invalidation**: All other sessions terminated after change
- ✅ **Audit Trail**: Change logged with timestamp
- ✅ **Email Notification**: Confirmation email sent
- ✅ **Event Logging**: password_changed event emitted

### Complete Updated JSON Example

```json
{
  "id": "auth_password_change_v1",
  "name": "Password Change Workflow",
  "active": false,
  "tenantId": "*",
  "versionId": "1.0.0",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "authentication" },
    { "name": "password" },
    { "name": "security" },
    { "name": "authenticated" }
  ],
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
      "id": "validate_input",
      "name": "Validate Input",
      "type": "metabuilder.validate",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "input": "{{ $json }}",
        "operation": "validate",
        "rules": {
          "currentPassword": "required|string",
          "newPassword": "required|string|minLength:8|different:currentPassword",
          "confirmPassword": "required|string|same:newPassword"
        }
      }
    },
    {
      "id": "fetch_user",
      "name": "Fetch User",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "filter": {
          "id": "{{ $context.user.id }}",
          "tenantId": "{{ $context.tenantId }}"
        },
        "operation": "database_read",
        "entity": "User"
      }
    },
    {
      "id": "verify_current_password",
      "name": "Verify Current Password",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "input": "{{ $json.currentPassword }}",
        "operation": "bcrypt_compare",
        "hash": "{{ $steps.fetch_user.output.passwordHash }}"
      }
    },
    {
      "id": "check_password_correct",
      "name": "Check Password Correct",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 300],
      "parameters": {
        "condition": "{{ $steps.verify_current_password.output === true }}",
        "operation": "condition"
      }
    },
    {
      "id": "hash_new_password",
      "name": "Hash New Password",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 300],
      "parameters": {
        "input": "{{ $json.newPassword }}",
        "operation": "bcrypt_hash",
        "rounds": 12
      }
    },
    {
      "id": "update_password",
      "name": "Update Password",
      "type": "metabuilder.database",
      "typeVersion": 1,
      "position": [100, 500],
      "parameters": {
        "filter": {
          "id": "{{ $context.user.id }}"
        },
        "data": {
          "passwordHash": "{{ $steps.hash_new_password.output }}",
          "passwordChangedAt": "{{ new Date().toISOString() }}"
        },
        "operation": "database_update",
        "entity": "User"
      }
    },
    {
      "id": "invalidate_sessions",
      "name": "Invalidate Sessions",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [400, 500],
      "parameters": {
        "filter": {
          "userId": "{{ $context.user.id }}",
          "id": {
            "$ne": "{{ $context.sessionId }}"
          }
        },
        "operation": "database_delete_many",
        "entity": "Session"
      }
    },
    {
      "id": "send_confirmation_email",
      "name": "Send Confirmation Email",
      "type": "metabuilder.operation",
      "typeVersion": 1,
      "position": [700, 500],
      "parameters": {
        "data": {
          "displayName": "{{ $steps.fetch_user.output.displayName }}",
          "timestamp": "{{ new Date().toISOString() }}"
        },
        "operation": "email_send",
        "to": "{{ $steps.fetch_user.output.email }}",
        "subject": "Your password has been changed",
        "template": "password_changed"
      }
    },
    {
      "id": "emit_event",
      "name": "Emit Event",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 700],
      "parameters": {
        "data": {
          "timestamp": "{{ new Date().toISOString() }}"
        },
        "action": "emit_event",
        "event": "password_changed",
        "channel": "{{ 'user:' + $context.user.id }}"
      }
    },
    {
      "id": "return_success",
      "name": "Return Success",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [400, 700],
      "parameters": {
        "action": "http_response",
        "status": 200,
        "body": {
          "message": "Password changed successfully. All other sessions have been invalidated for security."
        }
      }
    }
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Allows authenticated user to change password with current password verification and session management",
    "category": "authentication",
    "security_level": "critical",
    "authentication_required": true,
    "dependencies": ["User", "Session"],
    "email_template_required": "password_changed",
    "session_invalidation": "All except current session"
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

### Validation Checklist

- [ ] **Schema Compliance**
  - [ ] All required fields present
  - [ ] All metadata fields valid
  - [ ] Node ids unique and properly formatted
  - [ ] All positions valid [x, y] coordinates
  - [ ] All typeVersions valid

- [ ] **Authentication & Authorization**
  - [ ] User context required (`$context.user.id`)
  - [ ] TenantId context required (`$context.tenantId`)
  - [ ] SessionId context available (`$context.sessionId`)
  - [ ] User lookup filters by both userId and tenantId
  - [ ] No cross-tenant password changes possible

- [ ] **Security**
  - [ ] Current password verified with bcrypt_compare
  - [ ] Current password required before change
  - [ ] New password minimum 8 characters
  - [ ] New password different from current
  - [ ] Password confirmation validated (same:newPassword)
  - [ ] New password hashed with bcrypt (12 rounds)
  - [ ] All other sessions invalidated (security best practice)
  - [ ] Current session maintained for immediate re-auth
  - [ ] Password change timestamp recorded
  - [ ] Confirmation email sent
  - [ ] Change event logged

- [ ] **Data Validation**
  - [ ] Current password required
  - [ ] New password required
  - [ ] Confirmation password required
  - [ ] All inputs validated before use

- [ ] **Session Management**
  - [ ] Current session excluded from invalidation
  - [ ] All other sessions deleted
  - [ ] Forces re-authentication on other devices
  - [ ] Prevents unauthorized access after change

---

## Cross-Workflow Validation

### Consistent Metadata Structure

All 4 workflows must follow this structure:

```json
{
  "id": "auth_{workflow}_{version}",
  "name": "{Workflow Name}",
  "active": false,
  "tenantId": "*",
  "versionId": "1.0.0",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "authentication" },
    { "name": "{primary_function}" }
  ],
  "nodes": [ /* ... */ ],
  "connections": {},
  "staticData": {},
  "meta": { /* ... */ },
  "settings": { /* ... */ }
}
```

### Multi-Tenant Safety Matrix

| Aspect | Login | Register | Reset | Change |
|--------|-------|----------|-------|--------|
| **tenantId field** | `"*"` | `"*"` | `"*"` | `"*"` |
| **Uses context** | No | No | No | Yes (`$context.tenantId`) |
| **Tenant filtering** | Implicit (via user) | Input param | Implicit (via user) | Explicit (`$context.tenantId`) |
| **Isolation** | ✅ User's tenant | ✅ Input tenant | ✅ User's tenant | ✅ Context tenant |
| **Data leakage risk** | Low | None | None | None |

### Rate Limiting Summary

| Workflow | Limit | Window | Key |
|----------|-------|--------|-----|
| Login | 5 | 60s | `$json.email` |
| Register | 3 | 3600s (1hr) | `$json.email` |
| Reset | 3 | 3600s (1hr) | `$json.email` |
| Change | None | N/A | N/A (authenticated only) |

### Email Templates Required

| Workflow | Template | Purpose |
|----------|----------|---------|
| Register | `email_verification` | Email address verification |
| Reset | `password_reset` | Password reset link |
| Change | `password_changed` | Confirmation notification |

### Event Emissions

| Workflow | Event | Channel |
|----------|-------|---------|
| Login | `user_login` | `user:{userId}` |
| Register | `user_registered` | `tenant:{tenantId}` |
| Reset | `password_reset_requested` | `user:{userId}` |
| Change | `password_changed` | `user:{userId}` |

---

## Implementation Sequence

### Phase 1: Preparation (Day 1)

1. **Create Backup**
   ```bash
   cp -r packages/ui_auth packages/ui_auth.backup
   ```

2. **Verify Current State**
   ```bash
   npm run build  # Must pass
   npm run test:e2e  # Must pass
   npm run typecheck  # Must pass
   ```

3. **Generate IDs & Timestamps**
   - Login: `auth_login_v1`, createdAt/updatedAt: 2026-01-22T00:00:00Z
   - Register: `auth_register_v1`, createdAt/updatedAt: 2026-01-22T00:00:00Z
   - Reset: `auth_password_reset_v1`, createdAt/updatedAt: 2026-01-22T00:00:00Z
   - Change: `auth_password_change_v1`, createdAt/updatedAt: 2026-01-22T00:00:00Z

### Phase 2: Updates (Day 2-3)

4. **Update Login Workflow**
   - [ ] Add top-level fields: id, tenantId, versionId, tags, createdAt, updatedAt
   - [ ] Add meta description and security_level
   - [ ] Verify all 12 nodes present and properly structured
   - [ ] Validate rate limiting (5/60s)
   - [ ] Test with n8n schema validator

5. **Update Register Workflow**
   - [ ] Add top-level fields
   - [ ] Add meta fields including email_template_required
   - [ ] Verify all 7 nodes present
   - [ ] Validate rate limiting (3/3600s)
   - [ ] Verify unique email constraint in validation

6. **Update Reset Workflow**
   - [ ] Add top-level fields
   - [ ] Add meta with privacy_note
   - [ ] Verify all 9 nodes present
   - [ ] Validate rate limiting (3/3600s)
   - [ ] Verify same response for user exists/not exists

7. **Update Change Workflow**
   - [ ] Add top-level fields
   - [ ] Add meta with authentication_required flag
   - [ ] Verify all 11 nodes present
   - [ ] Validate session invalidation logic
   - [ ] Verify tenantId filtering in fetch

### Phase 3: Validation (Day 4)

8. **Schema Validation**
   ```bash
   # Validate against n8n-workflow.schema.json
   npm run validate:workflows  # If script exists
   # Or use external validator
   ```

9. **Structure Verification**
   - [ ] Parse all 4 JSON files to ensure valid JSON
   - [ ] Check all ids are unique across package
   - [ ] Verify no duplicate node names within each workflow
   - [ ] Confirm all positions are [x, y] arrays

10. **Security Audit**
    - [ ] Review all rate limiting rules
    - [ ] Verify all password operations use appropriate hashing
    - [ ] Check multi-tenant filtering on all queries
    - [ ] Confirm no sensitive data in responses
    - [ ] Validate email template references exist

### Phase 4: Testing (Day 5)

11. **Build & Type Check**
    ```bash
    npm run typecheck
    npm run build
    ```

12. **Run E2E Tests**
    ```bash
    npm run test:e2e
    # All tests must pass
    ```

13. **Test Each Workflow**
    - [ ] Login with valid credentials
    - [ ] Login with invalid email/password
    - [ ] Register new user
    - [ ] Register with duplicate email
    - [ ] Request password reset
    - [ ] Change password as authenticated user

### Phase 5: Commit (Day 6)

14. **Create Feature Branch**
    ```bash
    git checkout -b feat/ui-auth-n8n-compliance
    ```

15. **Stage Changes**
    ```bash
    git add packages/ui_auth/workflow/*.json
    ```

16. **Commit with Detailed Message**
    ```bash
    git commit -m "feat(ui_auth): modernize workflows to N8N schema compliance

    - Add id, tenantId, versionId to all 4 workflows
    - Add tags for categorization and discovery
    - Add createdAt, updatedAt timestamps
    - Enhance meta with security levels and dependencies
    - Verify multi-tenant safety across all workflows
    - Confirm rate limiting properly configured
    - Validate email template references

    Workflows updated:
    - login-workflow.json (auth_login_v1)
    - register-workflow.json (auth_register_v1)
    - password-reset-workflow.json (auth_password_reset_v1)
    - password-change-workflow.json (auth_password_change_v1)

    All workflows pass N8N schema validation.
    All security checks pass multi-tenant audit.
    "
    ```

17. **Create Pull Request**
    ```bash
    gh pr create --title "feat(ui_auth): N8N workflow modernization" \
      --body "Modernizes all 4 auth workflows with proper metadata and compliance"
    ```

---

## Rollback Plan

### If Issues Detected After Commit

1. **Immediate Rollback** (within minutes)
   ```bash
   git revert <commit-sha>
   git push origin main
   ```

2. **Data Integrity Check**
   ```bash
   # If workflows were already executing
   npm run db:audit  # Check for inconsistencies
   ```

3. **Root Cause Analysis**
   - Review validation output
   - Check error logs
   - Verify assumptions about n8n schema

4. **Phased Reintroduction**
   - Update one workflow at a time
   - Run full test suite after each
   - Get approval before each subsequent workflow

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Schema validation fails | Missing required field | Check against n8n-workflow.schema.json |
| Tests fail after update | Breaking change in node structure | Verify node positions and parameters |
| Workflows won't execute | Invalid JSON syntax | Validate JSON with jq or online validator |
| tenantId isolation broken | Missing filter in database query | Add tenantId filter to all queries |
| Rate limiting not enforced | Parameter mismatch | Verify window is in milliseconds |

---

## Validation Checklist (Complete)

### Before Committing Any Changes

**Schema Validation:**
- [ ] All workflows parse as valid JSON
- [ ] All required fields present: name, nodes, connections, active
- [ ] All optional metadata fields follow schema: id, tenantId, versionId, tags, createdAt, updatedAt, meta, settings
- [ ] All node ids are unique within workflow (case-sensitive)
- [ ] All node names are human-readable and unique
- [ ] All node positions are [x, y] numeric arrays
- [ ] All typeVersions are positive integers (≥1)
- [ ] No additional properties beyond schema definition

**Multi-Tenant Safety:**
- [ ] All workflows have `tenantId: "*"` (system workflows)
- [ ] Login uses user's tenantId from database lookup
- [ ] Register accepts tenantId in input
- [ ] Reset uses user's tenantId from database lookup
- [ ] Change uses `$context.tenantId` for isolation
- [ ] No cross-tenant data access possible
- [ ] All database operations filter by tenantId

**Security:**
- [ ] Rate limiting properly configured
- [ ] Password operations use bcrypt/SHA256 (not plaintext)
- [ ] No passwords in response bodies or logs
- [ ] Email validation enforced
- [ ] Account status checks implemented
- [ ] Session management follows security best practices
- [ ] Session invalidation on password change
- [ ] Email templates properly referenced
- [ ] Events emitted for audit trail

**Data Integrity:**
- [ ] All node references in connections exist
- [ ] No circular dependencies
- [ ] All filter/data structures properly formed
- [ ] All environment variables referenced (`$env.*`) documented
- [ ] All context variables required documented

**Performance:**
- [ ] Execution timeout adequate for slowest operation
- [ ] No unbounded loops or queries
- [ ] Conditions prevent unnecessary database calls
- [ ] Email operations don't block critical path

### After Commit (Pre-Merge Checklist)

- [ ] All tests pass: `npm run test:e2e`
- [ ] Build succeeds: `npm run build`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Code review approved
- [ ] All validation checks completed
- [ ] Documentation updated
- [ ] No regressions in other packages

---

## Success Criteria

### All 4 Workflows Complete When:

1. ✅ All required metadata fields added (id, tenantId, versionId, tags, createdAt, updatedAt)
2. ✅ All workflows validate against n8n-workflow.schema.json
3. ✅ All workflows pass security audit (multi-tenant, rate limiting, password handling)
4. ✅ All workflows execute without errors in test environment
5. ✅ All test suites pass with 99%+ coverage
6. ✅ Code review approval obtained
7. ✅ Changes committed to main branch
8. ✅ No regressions in dependent packages

---

## Timeline

| Phase | Duration | Milestones |
|-------|----------|------------|
| Preparation | 1 day | Backup, verification, ID generation |
| Updates | 2 days | All 4 workflows updated with metadata |
| Validation | 1 day | Schema, security, structure validation |
| Testing | 1 day | Build, type check, E2E tests |
| Review & Commit | 1 day | Code review, PR creation, merge |
| **Total** | **6 days** | **Production ready** |

---

**Plan Version**: 1.0
**Last Updated**: 2026-01-22
**Status**: Ready for Implementation
**Next Step**: Begin Phase 1 (Preparation)
