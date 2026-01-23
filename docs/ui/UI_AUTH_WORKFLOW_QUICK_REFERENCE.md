# ui_auth Workflows - Quick Reference Card

**Status**: 4/4 Workflows Ready for N8N Modernization

---

## At-a-Glance Summary

| Workflow | ID | Nodes | Rate Limit | Auth Required | Tenants |
|----------|----|----|-----------|---------------|---------|
| **Login** | `auth_login_v1` | 12 | 5/60s | No | User's tenant |
| **Register** | `auth_register_v1` | 7 | 3/3600s | No | Input param |
| **Reset** | `auth_password_reset_v1` | 9 | 3/3600s | No | User's tenant |
| **Change** | `auth_password_change_v1` | 11 | None | **Yes** | Context |

---

## Metadata Fields to Add (All 4 Workflows)

```json
{
  "id": "auth_{workflow}_v1",
  "tenantId": "*",
  "versionId": "1.0.0",
  "createdAt": "2026-01-22T00:00:00Z",
  "updatedAt": "2026-01-22T00:00:00Z",
  "tags": [
    { "name": "authentication" },
    { "name": "{function}" }
  ]
}
```

---

## N8N Schema Requirements

### Root Level (Required)
- `name` - Workflow display name ✅
- `nodes` - Array of workflow nodes ✅
- `connections` - Node connections object ✅

### Root Level (Now Adding)
- `id` - Unique identifier (e.g., `auth_login_v1`)
- `tenantId` - System workflows use `"*"`
- `versionId` - Semver format (e.g., `"1.0.0"`)
- `tags` - Array of {name: "tag"} objects
- `createdAt` - ISO timestamp
- `updatedAt` - ISO timestamp

### Settings (Already Present)
- `timezone` - "UTC" ✅
- `executionTimeout` - seconds ✅
- `saveExecutionProgress` - boolean ✅
- `saveDataErrorExecution` - "all"|"none" ✅
- `saveDataSuccessExecution` - "all"|"none" ✅

---

## Multi-Tenant Isolation Map

### Login Workflow
```
Input: { email, password, ipAddress, userAgent }
↓
Fetch User (by email, gets tenantId)
↓
Create Session with user's tenantId
↓
Emit event to user:{userId} (tenant implicit)
```
**Isolation**: ✅ Via fetched user's tenantId

### Register Workflow
```
Input: { email, password, displayName, tenantId }
↓
Create User with provided tenantId
↓
Send email (tenant context preserved)
↓
Emit event to tenant:{tenantId}
```
**Isolation**: ✅ Via input tenantId

### Reset Workflow
```
Input: { email }
↓
Fetch User (by email, gets tenantId)
↓
Create Reset Token (user's tenantId)
↓
Send email (same response regardless)
```
**Isolation**: ✅ Via fetched user's tenantId

### Change Workflow
```
Context: { user.id, tenantId, sessionId }
↓
Fetch User (by id AND tenantId) ← Double filter
↓
Update password (user context verified)
↓
Invalidate other sessions
↓
Emit event to user:{userId}
```
**Isolation**: ✅ Via explicit `$context.tenantId` filter

---

## Rate Limiting Configuration

### Login (5 attempts per 60 seconds)
```json
{
  "operation": "rate_limit",
  "key": "{{ $json.email }}",
  "limit": 5,
  "window": 60000
}
```

### Register (3 attempts per hour)
```json
{
  "operation": "rate_limit",
  "key": "{{ $json.email }}",
  "limit": 3,
  "window": 3600000
}
```

### Reset (3 attempts per hour)
```json
{
  "operation": "rate_limit",
  "key": "{{ $json.email }}",
  "limit": 3,
  "window": 3600000
}
```

### Change (No rate limit)
- Authenticated users only
- No rate limiting needed
- Delete other sessions for security

---

## Email Template Requirements

| Workflow | Template ID | Purpose |
|----------|------------|---------|
| Register | `email_verification` | Verification link |
| Reset | `password_reset` | Reset link |
| Change | `password_changed` | Confirmation notification |

**Note**: Login workflow does NOT send email

---

## Event Emissions

| Workflow | Event | Channel | Payload |
|----------|-------|---------|---------|
| Login | `user_login` | `user:{userId}` | userId, tenantId, timestamp |
| Register | `user_registered` | `tenant:{tenantId}` | userId, email, displayName |
| Reset | `password_reset_requested` | `user:{userId}` | email |
| Change | `password_changed` | `user:{userId}` | timestamp |

---

## Security Checklist (Per Workflow)

### Login
- [x] Rate limit: 5/60s
- [x] Email validated
- [x] User existence verified
- [x] Password verified (bcrypt_compare)
- [x] Account status checked (isActive)
- [x] JWT generated with 24h expiry
- [x] Session created with ipAddress/userAgent
- [x] Last login timestamp updated
- [x] Login event emitted

### Register
- [x] Rate limit: 3/3600s
- [x] Email validated + unique check
- [x] Password: 8+ chars, mixed case + digit
- [x] Display name: 2-100 chars
- [x] Password hashed (bcrypt, 12 rounds)
- [x] Verification token generated (32 chars)
- [x] Token expires 24h
- [x] Account created inactive
- [x] Verification email sent
- [x] Registration event emitted

### Reset
- [x] Rate limit: 3/3600s
- [x] Email validated
- [x] User existence not revealed (same response)
- [x] Reset token generated (32 chars)
- [x] Token hashed (SHA256) for storage
- [x] Token expires 1h
- [x] Reset link includes plaintext token
- [x] Reset email sent
- [x] Reset event emitted

### Change
- [x] Authentication required (`$context.user.id`)
- [x] Multi-tenant filter (`$context.tenantId`)
- [x] Current password verified
- [x] New password: 8+ chars, different from old
- [x] Password confirmation validated
- [x] Password hashed (bcrypt, 12 rounds)
- [x] Password changed timestamp recorded
- [x] All other sessions invalidated
- [x] Current session preserved
- [x] Confirmation email sent
- [x] Change event emitted

---

## Node Type Registry

All 4 workflows use custom MetaBuilder node types:

```
metabuilder.rateLimit      - Rate limiting enforcement
metabuilder.validate       - Input validation
metabuilder.database       - Database CRUD operations
metabuilder.condition      - Conditional branching
metabuilder.operation      - Cryptographic operations
metabuilder.action         - HTTP response / Event emission
```

**Ensure these are registered in executor's node registry before execution.**

---

## Validation Script (Quick Test)

```bash
#!/bin/bash
echo "Validating ui_auth workflows..."

for file in login-workflow register-workflow password-reset-workflow password-change-workflow; do
  echo "Checking $file.json..."

  # Check JSON validity
  if ! jq empty packages/ui_auth/workflow/$file.json; then
    echo "  ❌ Invalid JSON"
    exit 1
  fi

  # Check required fields
  jq -e '.id and .tenantId and .versionId and .tags and .createdAt and .updatedAt' \
    packages/ui_auth/workflow/$file.json > /dev/null || {
    echo "  ❌ Missing required fields"
    exit 1
  }

  echo "  ✅ Valid"
done

echo "All workflows valid!"
```

---

## Implementation Checklist

### Before Updates
- [ ] Backup existing workflows
  ```bash
  cp -r packages/ui_auth packages/ui_auth.backup
  ```
- [ ] Verify builds
  ```bash
  npm run build && npm run typecheck
  ```

### During Updates
- [ ] Add `id` field to each workflow
- [ ] Add `tenantId: "*"` to each workflow
- [ ] Add `versionId: "1.0.0"` to each workflow
- [ ] Add `tags` array with categories
- [ ] Add `createdAt` and `updatedAt` timestamps
- [ ] Enhance `meta` with security levels and dependencies

### After Updates
- [ ] Validate JSON syntax
  ```bash
  for f in packages/ui_auth/workflow/*.json; do jq empty "$f" || exit 1; done
  ```
- [ ] Run full test suite
  ```bash
  npm run test:e2e
  ```
- [ ] Type check
  ```bash
  npm run typecheck
  ```
- [ ] Build
  ```bash
  npm run build
  ```

### Before Commit
- [ ] All tests pass
- [ ] All validations pass
- [ ] No JSON errors
- [ ] Review changes
  ```bash
  git diff packages/ui_auth/workflow/
  ```

---

## Common Mistakes to Avoid

❌ **Forgetting tenantId field**
- This is required by N8N schema
- Use `"*"` for system workflows
- Verify in each workflow

❌ **Wrong timestamp format**
- Must be ISO 8601: `2026-01-22T00:00:00Z`
- Use UTC timezone marker (Z)
- Not `2026-01-22` or `unix timestamp`

❌ **Node id collisions**
- Each node id must be unique within the workflow
- Format: lowercase snake_case
- Check for duplicates: `jq '.nodes[].id' workflow.json | sort | uniq -d`

❌ **Missing tags array**
- Must be array of objects: `[{"name": "tag"}]`
- Not array of strings: `["tag"]` ❌
- Include "authentication" in all 4 workflows

❌ **Changing active status**
- Leave `active: false` during update
- Only change to `true` after full validation
- Never mix workflow updates with activation

❌ **Breaking node structure**
- Don't move nodes between workflows
- Don't rename node ids
- Don't change node parameters
- Only add top-level workflow fields

---

## File Locations

```
packages/ui_auth/workflow/
├── login-workflow.json                  # 12 nodes
├── register-workflow.json               # 7 nodes
├── password-reset-workflow.json         # 9 nodes
└── password-change-workflow.json        # 11 nodes
```

**Total**: 39 nodes across 4 workflows

---

## Related Documentation

- Full Plan: `/docs/UI_AUTH_WORKFLOW_UPDATE_PLAN.md`
- N8N Schema: `/schemas/n8n-workflow.schema.json`
- Package Config: `/packages/ui_auth/package.json`
- Security Guide: `/docs/MULTI_TENANT_AUDIT.md`
- Rate Limiting: `/docs/RATE_LIMITING_GUIDE.md`

---

## Success Criteria

✅ All 4 workflows have proper metadata fields
✅ All workflows pass N8N schema validation
✅ All multi-tenant safety checks pass
✅ All tests pass (npm run test:e2e)
✅ Build succeeds (npm run build)
✅ Type check succeeds (npm run typecheck)
✅ Code review approved
✅ Changes committed to main

---

**Updated**: 2026-01-22
**Version**: 1.0
**Status**: Ready for Implementation
