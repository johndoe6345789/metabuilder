# User Manager Workflows - N8N Schema Migration Checklist

**Date**: 2026-01-22
**Package**: user_manager (5 workflows)
**Status**: Ready to Execute
**Execution Time**: ~2 hours

---

## Pre-Implementation Tasks

### Environment Setup
- [ ] Verified working directory: `/Users/rmac/Documents/metabuilder/`
- [ ] Confirmed git access: `git status` shows clean state
- [ ] Python 3 available: `python3 --version` >= 3.8
- [ ] Text editor ready (VS Code / nano / vim)
- [ ] Have JSON formatter available (online or local)

### Documentation Review
- [ ] Read `USER_MANAGER_WORKFLOW_UPDATE_PLAN.md` (Part 1-2)
- [ ] Understand n8n schema structure (Part 2)
- [ ] Reviewed all 5 JSON examples (Part 3)
- [ ] Understand field conventions (Part 4)

### Backup Creation
- [ ] Created backup directory:
  ```bash
  cd /Users/rmac/Documents/metabuilder/packages/user_manager/workflow/
  mkdir -p backup-$(date +%Y%m%d)
  ```
- [ ] Copied all JSON files to backup:
  ```bash
  cp *.json backup-$(date +%Y%m%d)/
  ls backup-$(date +%Y%m%d)/
  ```
  Expected output: 5 files

---

## Workflow 1: create-user.json

### Pre-Update
- [ ] File exists at: `packages/user_manager/workflow/create-user.json`
- [ ] Current size reasonable: `< 10 KB`
- [ ] Current JSON is valid:
  ```bash
  python3 -m json.tool packages/user_manager/workflow/create-user.json > /dev/null && echo "✅ Valid" || echo "❌ Invalid"
  ```
- [ ] Node count correct: `grep -c '"id":' packages/user_manager/workflow/create-user.json` = 6
- [ ] Current structure has name, nodes, connections fields

### Update Instructions
Edit `packages/user_manager/workflow/create-user.json`:

**FIND** (around line 2, after "name" field):
```json
  "name": "Create User",
  "active": false,
```

**REPLACE WITH**:
```json
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
```

**FIND** (around line 105, the current "meta": {} line):
```json
  "connections": {},
  "staticData": {},
  "meta": {},
```

**REPLACE WITH**:
```json
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Creates a new user with email validation and password hashing",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
  },
```

### Post-Update Validation
- [ ] File still valid JSON:
  ```bash
  python3 -m json.tool packages/user_manager/workflow/create-user.json > /dev/null && echo "✅" || echo "❌"
  ```
- [ ] All new fields present:
  ```bash
  grep -E '"id"|"version"|"versionId"|"tenantId"|"createdAt"|"updatedAt"' packages/user_manager/workflow/create-user.json | wc -l
  # Expected: 6 lines
  ```
- [ ] File size increased (new fields added):
  ```bash
  wc -c packages/user_manager/workflow/create-user.json
  # Expected: > original size
  ```
- [ ] Node count unchanged:
  ```bash
  grep -c '"id":' packages/user_manager/workflow/create-user.json
  # Expected: still 6 (now includes workflow id)
  ```
- [ ] Tags array present:
  ```bash
  grep -c '"name": "user-management"' packages/user_manager/workflow/create-user.json
  # Expected: >= 1
  ```

---

## Workflow 2: list-users.json

### Pre-Update
- [ ] File exists at: `packages/user_manager/workflow/list-users.json`
- [ ] Current JSON valid
- [ ] Node count: 6 nodes
- [ ] Current meta field exists

### Update Instructions
Edit `packages/user_manager/workflow/list-users.json`:

**FIND** (after "name" field):
```json
  "name": "List Users",
  "active": false,
```

**REPLACE WITH**:
```json
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
```

**FIND** (the meta section):
```json
  "meta": {},
```

**REPLACE WITH**:
```json
  "meta": {
    "description": "Lists all users for the current tenant with pagination support",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
  },
```

### Post-Update Validation
- [ ] Valid JSON: `python3 -m json.tool packages/user_manager/workflow/list-users.json > /dev/null`
- [ ] Required fields present (6 should appear):
  ```bash
  grep -c '"id":\|"version":\|"versionId":\|"tenantId":\|"createdAt":\|"updatedAt":' packages/user_manager/workflow/list-users.json
  ```
- [ ] Tags present: `grep -c "user-management" packages/user_manager/workflow/list-users.json`

---

## Workflow 3: update-user.json

### Pre-Update
- [ ] File exists
- [ ] Current JSON valid
- [ ] Node count: 4 nodes
- [ ] Meta field empty

### Update Instructions
Edit `packages/user_manager/workflow/update-user.json`:

**FIND**:
```json
  "name": "Update User",
  "active": false,
```

**REPLACE WITH**:
```json
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
```

**FIND**:
```json
  "meta": {},
```

**REPLACE WITH**:
```json
  "meta": {
    "description": "Updates user profile information with role-based access control",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
  },
```

### Post-Update Validation
- [ ] Valid JSON
- [ ] 6 new metadata fields present
- [ ] Tags array added
- [ ] meta.description matches pattern

---

## Workflow 4: reset-password.json

### Pre-Update
- [ ] File exists
- [ ] Current JSON valid
- [ ] Node count: 7 nodes
- [ ] Current state verified

### Update Instructions
Edit `packages/user_manager/workflow/reset-password.json`:

**FIND**:
```json
  "name": "Reset User Password",
  "active": false,
```

**REPLACE WITH**:
```json
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
```

**FIND**:
```json
  "meta": {},
```

**REPLACE WITH**:
```json
  "meta": {
    "description": "Resets user password and sends temporary password via email",
    "author": "MetaBuilder",
    "workflowType": "security",
    "scope": "global"
  },
```

### Post-Update Validation
- [ ] Valid JSON
- [ ] All 6 metadata fields present
- [ ] Tags include "security" and "password"
- [ ] meta.workflowType = "security"

---

## Workflow 5: delete-user.json

### Pre-Update
- [ ] File exists
- [ ] Current JSON valid
- [ ] Node count: 7 nodes (possibly 6, verify)
- [ ] Current structure confirmed

### Update Instructions
Edit `packages/user_manager/workflow/delete-user.json`:

**FIND**:
```json
  "name": "Delete User",
  "active": false,
```

**REPLACE WITH**:
```json
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
```

**FIND**:
```json
  "meta": {},
```

**REPLACE WITH**:
```json
  "meta": {
    "description": "Deletes a user account with admin-only access and safety checks",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
  },
```

### Post-Update Validation
- [ ] Valid JSON
- [ ] All 6 metadata fields present
- [ ] Tags include "dangerous" for awareness
- [ ] meta.description mentions safety checks

---

## Post-Implementation Validation

### Schema Validation

Run this Python script to validate all files:

```bash
cat > /tmp/validate_user_manager.py << 'EOF'
#!/usr/bin/env python3
import json
import glob
import sys
from datetime import datetime

WORKFLOW_DIR = "/Users/rmac/Documents/metabuilder/packages/user_manager/workflow/"
REQUIRED_FIELDS = ["id", "version", "versionId", "tenantId", "name", "active",
                   "createdAt", "updatedAt", "nodes", "connections", "settings"]

def validate_workflow(filepath):
    errors = []
    with open(filepath, 'r') as f:
        wf = json.load(f)

    # Check required fields
    for field in REQUIRED_FIELDS:
        if field not in wf:
            errors.append(f"Missing: {field}")

    # Validate id format
    if not wf.get("id", "").startswith("wf-"):
        errors.append(f"Invalid id format: {wf.get('id')}")

    # Validate version is int
    if not isinstance(wf.get("version"), int):
        errors.append(f"version not int: {type(wf.get('version'))}")

    # Validate timestamps
    for ts in ["createdAt", "updatedAt"]:
        try:
            datetime.fromisoformat(wf[ts].replace('Z', '+00:00'))
        except (ValueError, KeyError):
            errors.append(f"Invalid timestamp: {ts}")

    # Check tags
    if not wf.get("tags"):
        errors.append("Missing tags array")

    # Check meta description
    if not wf.get("meta", {}).get("description"):
        errors.append("Missing meta.description")

    return errors

# Main
print("Validating user_manager workflows...")
print("=" * 60)

all_errors = {}
for wf_file in sorted(glob.glob(f"{WORKFLOW_DIR}/*.json")):
    filename = wf_file.split('/')[-1]
    try:
        errors = validate_workflow(wf_file)
        if errors:
            all_errors[filename] = errors
            print(f"❌ {filename}")
            for err in errors:
                print(f"   - {err}")
        else:
            print(f"✅ {filename}")
    except Exception as e:
        all_errors[filename] = [str(e)]
        print(f"❌ {filename}: {e}")

print("=" * 60)
if all_errors:
    print(f"❌ Validation failed: {len(all_errors)} files with errors")
    sys.exit(1)
else:
    print("✅ All workflows valid!")
    sys.exit(0)
EOF

python3 /tmp/validate_user_manager.py
```

**Expected Output**:
```
Validating user_manager workflows...
============================================================
✅ create-user.json
✅ delete-user.json
✅ list-users.json
✅ reset-password.json
✅ update-user.json
============================================================
✅ All workflows valid!
```

- [ ] Validation script returns exit code 0 (success)
- [ ] All 5 workflows show ✅
- [ ] No error messages

### Manual File Verification

For each file, run:

```bash
# File 1
echo "=== create-user.json ===" && \
python3 -m json.tool packages/user_manager/workflow/create-user.json | head -20

# File 2
echo "=== list-users.json ===" && \
python3 -m json.tool packages/user_manager/workflow/list-users.json | head -20

# etc.
```

Check that each shows:
```json
{
  "id": "wf-*-v1",
  "version": 1,
  "versionId": "v1.0.0",
  "tenantId": "default-tenant",
  "name": "...",
  "active": false,
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",
  "tags": [...]
```

- [ ] create-user.json: First 20 lines show all new fields ✅
- [ ] list-users.json: First 20 lines show all new fields ✅
- [ ] update-user.json: First 20 lines show all new fields ✅
- [ ] reset-password.json: First 20 lines show all new fields ✅
- [ ] delete-user.json: First 20 lines show all new fields ✅

### Git Status Check

```bash
cd /Users/rmac/Documents/metabuilder

# Check modified files
git status packages/user_manager/workflow/

# Should show 5 modified files:
# - create-user.json
# - delete-user.json
# - list-users.json
# - reset-password.json
# - update-user.json
```

- [ ] All 5 workflow files show as modified in git
- [ ] No other unexpected file changes
- [ ] All changes are in workflow/ directory

### Diff Review

```bash
# Review changes to each file
git diff packages/user_manager/workflow/create-user.json

# Expected to see:
# - Added 6 new fields (id, version, versionId, tenantId, createdAt, updatedAt)
# - Added tags array
# - Enhanced meta object
```

- [ ] create-user.json diff shows added fields only (no node changes)
- [ ] list-users.json diff shows added fields only
- [ ] update-user.json diff shows added fields only
- [ ] reset-password.json diff shows added fields only
- [ ] delete-user.json diff shows added fields only
- [ ] No unintended changes to node definitions

---

## Git Commit

### Prepare Commit

```bash
cd /Users/rmac/Documents/metabuilder

# Stage the changes
git add packages/user_manager/workflow/create-user.json
git add packages/user_manager/workflow/list-users.json
git add packages/user_manager/workflow/update-user.json
git add packages/user_manager/workflow/reset-password.json
git add packages/user_manager/workflow/delete-user.json

# Verify staging
git status
```

- [ ] All 5 files staged
- [ ] No unstaged changes
- [ ] No untracked files in workflow directory

### Create Commit

```bash
git commit -m "feat(user_manager): migrate 5 workflows to n8n schema

Adds id, version, versionId, and tenantId fields to all user_manager
workflows for full n8n schema compliance. Updates include:

- id: Unique workflow identifiers (wf-create-user-v1, etc.)
- version: Integer version number (1)
- versionId: Semantic version string (v1.0.0)
- tenantId: Multi-tenant context identifier (default-tenant)
- createdAt/updatedAt: ISO 8601 timestamps
- tags: Categorization for workflow discovery
- meta: Enhanced descriptions and metadata

Workflows updated:
- create-user.json (6 nodes)
- list-users.json (6 nodes)
- update-user.json (4 nodes)
- reset-password.json (7 nodes)
- delete-user.json (6 nodes)

Multi-tenant safety verified on all database operations.
Schema validation: 100% pass rate.
Backward compatible: All existing APIs unchanged.

Relates to: Phase 3 Week 2 - N8N Migration
"
```

- [ ] Commit message created
- [ ] Message follows MetaBuilder conventions
- [ ] Includes all 5 workflow names
- [ ] References Phase 3 Week 2

### Verify Commit

```bash
# Show the commit
git log -1 --stat

# Expected output shows:
# - Commit hash
# - Author and date
# - Message content
# - 5 files changed
# - Insertions (new fields)
```

- [ ] Commit created successfully
- [ ] Commit shows 5 files changed
- [ ] Commit message readable
- [ ] No errors in output

---

## Final Verification

### Summary Table

Complete this table as you finish each workflow:

| Workflow | Schema Valid | Tags Added | Meta Enhanced | Git Staged | Status |
|----------|--------------|-----------|---------------|-----------|--------|
| create-user.json | [ ] | [ ] | [ ] | [ ] | ⏳ |
| list-users.json | [ ] | [ ] | [ ] | [ ] | ⏳ |
| update-user.json | [ ] | [ ] | [ ] | [ ] | ⏳ |
| reset-password.json | [ ] | [ ] | [ ] | [ ] | ⏳ |
| delete-user.json | [ ] | [ ] | [ ] | [ ] | ⏳ |

When all rows are complete, change status to ✅.

### Complete Workflow Checklist

- [ ] All 5 workflows updated with new fields
- [ ] All 5 workflows pass JSON syntax validation
- [ ] All 5 workflows pass schema validation (Python script)
- [ ] All required fields present in each file
- [ ] Tags array added to each file
- [ ] Meta object enhanced with descriptions
- [ ] Git shows 5 modified files
- [ ] Git diff shows only new fields (no node changes)
- [ ] Git commit created with proper message
- [ ] No backup files staged in git
- [ ] No temporary files left behind

### Completion Confirmation

When ALL checkboxes are complete:

```bash
echo "✅ User Manager Workflow N8N Migration Complete!"
echo "   - 5 workflows updated"
echo "   - Backward compatible"
echo "   - Ready for staging deployment"
```

- [ ] All implementation tasks complete
- [ ] All validation tasks complete
- [ ] All git tasks complete
- [ ] Ready to deploy to staging

---

## Troubleshooting

### Problem: JSON syntax error
**Solution**: Use `python3 -m json.tool filename.json` to identify the issue

### Problem: Missing comma between fields
**Solution**: Verify that closing `}` of one field has a comma before opening `{` of next field

### Problem: Duplicate field names
**Solution**: Check for accidentally pasting fields multiple times

### Problem: Git won't stage file
**Solution**:
- Verify file path is correct
- Check git status
- Try `git add` with full path

### Problem: Validation script fails
**Solution**:
- Re-run validation on individual file
- Check timestamps are ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Verify id field starts with "wf-"

---

## Sign-Off

**Implementation Completed By**: ___________________
**Date Completed**: ___________________
**Validation Status**: [ ] All Pass [ ] Some Issues [ ] All Fail

**Notes**:
```
[Space for notes about completion]
```

---

**Document Status**: Implementation Ready
**Next Step**: Execute tasks in order from top to bottom
**Expected Duration**: 2 hours total
