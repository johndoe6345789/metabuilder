# ui_auth Workflows - Validation Template

**Purpose**: Use this template to validate each workflow update before commit
**Date**: 2026-01-22
**Total Workflows**: 4

---

## Workflow 1: Login Workflow

**File**: `packages/ui_auth/workflow/login-workflow.json`

### Field Presence Validation

- [ ] `id` present: `auth_login_v1`
- [ ] `name` present: `"Login Workflow"`
- [ ] `active` present: `false`
- [ ] `tenantId` present: `"*"`
- [ ] `versionId` present: `"1.0.0"`
- [ ] `createdAt` present: ISO timestamp
- [ ] `updatedAt` present: ISO timestamp
- [ ] `tags` present: Array with "authentication" and "login"
- [ ] `nodes` present: Array with 12 items
- [ ] `connections` present: Object
- [ ] `staticData` present: Object
- [ ] `meta` present: Object with description and security_level
- [ ] `settings` present: Object with timezone, executionTimeout, etc.

### Node Count Validation
```bash
$ jq '.nodes | length' packages/ui_auth/workflow/login-workflow.json
# Expected: 12
# Nodes: apply_rate_limit, validate_input, fetch_user, check_user_exists,
#        verify_password, check_password_valid, check_account_active,
#        generate_session, create_session_record, update_last_login,
#        emit_login_event, return_success
```

- [ ] Node count is exactly 12

### Node Structure Validation
```bash
$ jq '.nodes[] | "\(.id): \(.type) v\(.typeVersion)"' packages/ui_auth/workflow/login-workflow.json
```

- [ ] apply_rate_limit: `metabuilder.rateLimit` v1
- [ ] validate_input: `metabuilder.validate` v1
- [ ] fetch_user: `metabuilder.database` v1
- [ ] check_user_exists: `metabuilder.condition` v1
- [ ] verify_password: `metabuilder.operation` v1
- [ ] check_password_valid: `metabuilder.condition` v1
- [ ] check_account_active: `metabuilder.condition` v1
- [ ] generate_session: `metabuilder.operation` v1
- [ ] create_session_record: `metabuilder.database` v1
- [ ] update_last_login: `metabuilder.database` v1
- [ ] emit_login_event: `metabuilder.action` v1
- [ ] return_success: `metabuilder.action` v1

### Security Validation
- [ ] Rate limit key: `{{ $json.email }}`
- [ ] Rate limit value: `5` attempts
- [ ] Rate limit window: `60000` milliseconds (1 minute)
- [ ] Password verification uses: `bcrypt_compare`
- [ ] Password check prevents plain text output
- [ ] Account active status checked: `isActive !== false`
- [ ] JWT secret uses environment variable: `{{ $env.JWT_SECRET }}`
- [ ] Session expiry: `24h`
- [ ] Session includes tenantId
- [ ] Login event emitted with userId and tenantId

### Multi-Tenant Validation
- [ ] Fetched user includes tenantId
- [ ] Session record uses fetched user's tenantId
- [ ] Event channel scoped to user: `user:{userId}`
- [ ] No cross-tenant data access

### JSON Validity
```bash
$ jq empty packages/ui_auth/workflow/login-workflow.json
# Expected: No output (valid JSON)
```
- [ ] JSON is valid (jq check passes)
- [ ] No parse errors
- [ ] No trailing commas
- [ ] All quotes properly escaped

### Signature Test
```bash
$ jq '.id, .tenantId, .versionId, (.tags | length)' packages/ui_auth/workflow/login-workflow.json
# Expected: "auth_login_v1"
#           "*"
#           "1.0.0"
#           (number >= 2)
```

- [ ] Signature matches expected values

**Status**: [ ] PASS [ ] FAIL

**Notes**:
```
[Space for tester notes]
```

---

## Workflow 2: Register Workflow

**File**: `packages/ui_auth/workflow/register-workflow.json`

### Field Presence Validation

- [ ] `id` present: `auth_register_v1`
- [ ] `name` present: `"Register Workflow"`
- [ ] `active` present: `false`
- [ ] `tenantId` present: `"*"`
- [ ] `versionId` present: `"1.0.0"`
- [ ] `createdAt` present: ISO timestamp
- [ ] `updatedAt` present: ISO timestamp
- [ ] `tags` present: Array with "authentication" and "registration"
- [ ] `nodes` present: Array with 7 items
- [ ] `connections` present: Object
- [ ] `staticData` present: Object
- [ ] `meta` present: Object with email_template_required
- [ ] `settings` present: Object

### Node Count Validation
```bash
$ jq '.nodes | length' packages/ui_auth/workflow/register-workflow.json
# Expected: 7
```

- [ ] Node count is exactly 7

### Node Structure Validation
```bash
$ jq '.nodes[] | .id' packages/ui_auth/workflow/register-workflow.json
```

- [ ] apply_rate_limit: `metabuilder.rateLimit` v1
- [ ] validate_input: `metabuilder.validate` v1
- [ ] hash_password: `metabuilder.operation` v1
- [ ] generate_verification_token: `metabuilder.operation` v1
- [ ] create_user: `metabuilder.database` v1
- [ ] send_verification_email: `metabuilder.operation` v1
- [ ] emit_register_event: `metabuilder.action` v1
- [ ] return_success: `metabuilder.action` v1

### Security Validation
- [ ] Rate limit key: `{{ $json.email }}`
- [ ] Rate limit value: `3` attempts
- [ ] Rate limit window: `3600000` milliseconds (1 hour)
- [ ] Email validation includes `unique:User`
- [ ] Password validation includes:
  - [ ] `minLength:8` (8 characters minimum)
  - [ ] `regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/` (mixed case + digit)
- [ ] Display name validation:
  - [ ] `minLength:2`
  - [ ] `maxLength:100`
- [ ] Password hashing uses bcrypt with 12 rounds
- [ ] User created with `isActive: false`
- [ ] Verification token length: 32 characters
- [ ] Token expiry: 24 hours
- [ ] Verification email template referenced
- [ ] Registration event emitted

### Multi-Tenant Validation
- [ ] User created with provided tenantId from input
- [ ] Event scoped to tenant: `tenant:{tenantId}`
- [ ] No implicit tenant assumptions

### Email Template
- [ ] Template ID: `email_verification`
- [ ] Verification link includes: `{{ $env.APP_URL }}`
- [ ] Verification link includes token: `{{ $steps.generate_verification_token.output }}`

### JSON Validity
```bash
$ jq empty packages/ui_auth/workflow/register-workflow.json
```
- [ ] JSON is valid

### Signature Test
```bash
$ jq '.id, .tenantId, .versionId' packages/ui_auth/workflow/register-workflow.json
# Expected: "auth_register_v1"
#           "*"
#           "1.0.0"
```

- [ ] Signature matches expected values

**Status**: [ ] PASS [ ] FAIL

**Notes**:
```
[Space for tester notes]
```

---

## Workflow 3: Password Reset Workflow

**File**: `packages/ui_auth/workflow/password-reset-workflow.json`

### Field Presence Validation

- [ ] `id` present: `auth_password_reset_v1`
- [ ] `name` present: `"Password Reset Workflow"`
- [ ] `active` present: `false`
- [ ] `tenantId` present: `"*"`
- [ ] `versionId` present: `"1.0.0"`
- [ ] `createdAt` present: ISO timestamp
- [ ] `updatedAt` present: ISO timestamp
- [ ] `tags` present: Array with "authentication" and "password"
- [ ] `nodes` present: Array with 9 items
- [ ] `meta` present: Object with `privacy_note`
- [ ] `settings` present: Object

### Node Count Validation
```bash
$ jq '.nodes | length' packages/ui_auth/workflow/password-reset-workflow.json
# Expected: 9
```

- [ ] Node count is exactly 9

### Node Structure Validation
- [ ] apply_rate_limit: `metabuilder.rateLimit` v1
- [ ] validate_email: `metabuilder.validate` v1
- [ ] fetch_user: `metabuilder.database` v1
- [ ] check_user_exists: `metabuilder.condition` v1
- [ ] generate_reset_token: `metabuilder.operation` v1
- [ ] hash_reset_token: `metabuilder.operation` v1
- [ ] create_reset_request: `metabuilder.database` v1
- [ ] send_reset_email: `metabuilder.operation` v1
- [ ] emit_event: `metabuilder.action` v1
- [ ] return_success: `metabuilder.action` v1

### Security Validation
- [ ] Rate limit key: `{{ $json.email }}`
- [ ] Rate limit value: `3` attempts
- [ ] Rate limit window: `3600000` milliseconds
- [ ] Email validation: `required|email`
- [ ] Reset token generation: 32 characters
- [ ] Token hashing: SHA256
- [ ] Token expiry: 1 hour (3600000ms)
- [ ] Reset link includes plaintext token (not hashed)
- [ ] Stored token is hashed (SHA256)
- [ ] Email template: `password_reset`
- [ ] Same response sent regardless of user existence

### Privacy Validation
```bash
$ jq '.meta.privacy_note' packages/ui_auth/workflow/password-reset-workflow.json
# Should indicate email enumeration prevention
```
- [ ] Meta includes privacy_note about enumeration prevention
- [ ] Return success message generic: "If an account exists with that email..."
- [ ] No information about whether user exists

### Multi-Tenant Validation
- [ ] User fetched by email (gets tenant context)
- [ ] Reset token associated with fetched user
- [ ] Event scoped to user: `user:{userId}`

### JSON Validity
```bash
$ jq empty packages/ui_auth/workflow/password-reset-workflow.json
```
- [ ] JSON is valid

### Signature Test
```bash
$ jq '.id, .tenantId, .versionId' packages/ui_auth/workflow/password-reset-workflow.json
# Expected: "auth_password_reset_v1"
#           "*"
#           "1.0.0"
```

- [ ] Signature matches expected values

**Status**: [ ] PASS [ ] FAIL

**Notes**:
```
[Space for tester notes]
```

---

## Workflow 4: Password Change Workflow

**File**: `packages/ui_auth/workflow/password-change-workflow.json`

### Field Presence Validation

- [ ] `id` present: `auth_password_change_v1`
- [ ] `name` present: `"Password Change Workflow"`
- [ ] `active` present: `false`
- [ ] `tenantId` present: `"*"`
- [ ] `versionId` present: `"1.0.0"`
- [ ] `createdAt` present: ISO timestamp
- [ ] `updatedAt` present: ISO timestamp
- [ ] `tags` present: Array with "authentication", "password", and "authenticated"
- [ ] `nodes` present: Array with 11 items
- [ ] `meta` present: Object with `authentication_required` flag
- [ ] `settings` present: Object

### Node Count Validation
```bash
$ jq '.nodes | length' packages/ui_auth/workflow/password-change-workflow.json
# Expected: 11
```

- [ ] Node count is exactly 11

### Node Structure Validation
- [ ] validate_context: `metabuilder.validate` v1
- [ ] validate_input: `metabuilder.validate` v1
- [ ] fetch_user: `metabuilder.database` v1
- [ ] verify_current_password: `metabuilder.operation` v1
- [ ] check_password_correct: `metabuilder.condition` v1
- [ ] hash_new_password: `metabuilder.operation` v1
- [ ] update_password: `metabuilder.database` v1
- [ ] invalidate_sessions: `metabuilder.operation` v1
- [ ] send_confirmation_email: `metabuilder.operation` v1
- [ ] emit_event: `metabuilder.action` v1
- [ ] return_success: `metabuilder.action` v1

### Authentication Validation
- [ ] First node validates user context: `{{ $context.user.id }}`
- [ ] Requires user to be authenticated
- [ ] Meta includes `authentication_required: true`
- [ ] Context includes tenantId

### Security Validation
- [ ] No rate limiting (authenticated users only)
- [ ] Current password required
- [ ] Current password verified with bcrypt_compare
- [ ] New password minimum 8 characters: `minLength:8`
- [ ] New password different from current: `different:currentPassword`
- [ ] Password confirmation validates: `same:newPassword`
- [ ] Password hashing uses bcrypt with 12 rounds
- [ ] Password changed timestamp recorded
- [ ] All other sessions invalidated
- [ ] Current session preserved: `id: { $ne: {{ $context.sessionId }} }`
- [ ] Confirmation email sent
- [ ] Change event emitted

### Multi-Tenant Validation
- [ ] User fetch includes double filter:
  - [ ] `id: {{ $context.user.id }}`
  - [ ] `tenantId: {{ $context.tenantId }}`
- [ ] Session invalidation filters by userId and tenantId
- [ ] Email sent to user's email address
- [ ] Event scoped to user: `user:{userId}`

### Database Operations
- [ ] Fetch user uses both id and tenantId filter
- [ ] Update password filters by userId only (OK - authenticated)
- [ ] Invalidate sessions uses $ne operator for current session
- [ ] All operations properly parameterized

### JSON Validity
```bash
$ jq empty packages/ui_auth/workflow/password-change-workflow.json
```
- [ ] JSON is valid

### Signature Test
```bash
$ jq '.id, .tenantId, .versionId' packages/ui_auth/workflow/password-change-workflow.json
# Expected: "auth_password_change_v1"
#           "*"
#           "1.0.0"
```

- [ ] Signature matches expected values

**Status**: [ ] PASS [ ] FAIL

**Notes**:
```
[Space for tester notes]
```

---

## Cross-Workflow Validation

### Consistency Checks
- [ ] All 4 workflows have `tenantId: "*"`
- [ ] All 4 workflows have `versionId: "1.0.0"`
- [ ] All 4 workflows have matching timestamp format (ISO 8601)
- [ ] All 4 workflows include "authentication" tag
- [ ] All 4 workflows have proper `meta` descriptions
- [ ] No duplicate workflow ids across the package

### ID Uniqueness Check
```bash
$ jq '.id' packages/ui_auth/workflow/*.json | sort | uniq -d
# Expected: No output (all unique)
```
- [ ] All workflow IDs are unique

### Node ID Uniqueness Check (Per Workflow)
```bash
$ for f in packages/ui_auth/workflow/*.json; do
    echo "Checking $f..."
    jq '.nodes[].id' "$f" | sort | uniq -d | grep . && echo "ERROR: Duplicates found"
  done
```
- [ ] Login: No duplicate node ids
- [ ] Register: No duplicate node ids
- [ ] Reset: No duplicate node ids
- [ ] Change: No duplicate node ids

### Email Template References
- [ ] Register uses `email_verification` template
- [ ] Reset uses `password_reset` template
- [ ] Change uses `password_changed` template
- [ ] All templates referenced exist in codebase

### Environment Variable Usage
```bash
$ jq -r '.. | strings | select(. | contains("$env"))' packages/ui_auth/workflow/*.json
# Should see: $env.JWT_SECRET, $env.APP_URL
```
- [ ] JWT_SECRET used in Login workflow
- [ ] APP_URL used in Register and Reset workflows
- [ ] All env vars documented

### Event Emissions
```bash
$ jq '.. | objects | select(.event) | .event' packages/ui_auth/workflow/*.json
# Should see: user_login, user_registered, password_reset_requested, password_changed
```
- [ ] Login emits: `user_login`
- [ ] Register emits: `user_registered`
- [ ] Reset emits: `password_reset_requested`
- [ ] Change emits: `password_changed`

---

## Build & Test Validation

### JSON Validation
```bash
npm run validate:workflows  # If script exists
# OR manually:
for f in packages/ui_auth/workflow/*.json; do
  jq empty "$f" || exit 1
done
```
- [ ] All JSON files parse successfully

### TypeScript Check
```bash
npm run typecheck
```
- [ ] TypeScript check passes (0 errors)

### Build
```bash
npm run build
```
- [ ] Build succeeds
- [ ] No build errors
- [ ] No build warnings (for this package)

### E2E Tests
```bash
npm run test:e2e -- packages/ui_auth
```
- [ ] All tests pass
- [ ] No test failures
- [ ] No timeout errors
- [ ] Coverage maintained

### Regression Tests
```bash
npm run test:e2e  # Full suite
```
- [ ] No new test failures
- [ ] All existing tests still pass
- [ ] No regressions in other packages

---

## Final Sign-Off Checklist

### Validation Complete
- [ ] All 4 workflows validated per templates above
- [ ] All field presence checks passed
- [ ] All security checks passed
- [ ] All multi-tenant checks passed
- [ ] All JSON validity checks passed
- [ ] All build/test checks passed

### Ready for Commit
- [ ] Changes reviewed
- [ ] No unintended modifications
- [ ] Backup verified
- [ ] Rollback plan documented

### Post-Commit
- [ ] Changes pushed to branch
- [ ] PR created with detailed description
- [ ] Code review requested
- [ ] CI/CD pipeline successful
- [ ] Ready for merge to main

---

## Summary Table

| Workflow | ID | Nodes | Status | Tester | Date |
|----------|----|----|--------|--------|------|
| Login | auth_login_v1 | 12 | [ ] | | |
| Register | auth_register_v1 | 7 | [ ] | | |
| Reset | auth_password_reset_v1 | 9 | [ ] | | |
| Change | auth_password_change_v1 | 11 | [ ] | | |

**Overall Status**: [ ] PASS [ ] FAIL

**Tester Name**: ________________
**Tester Signature**: ________________
**Date**: ________________

---

**Template Version**: 1.0
**Last Updated**: 2026-01-22
