# User Manager Workflows - Quick Reference Guide

**For**: Developers updating user_manager package workflows
**Status**: Implementation Ready
**Last Updated**: 2026-01-22

---

## TL;DR - What to Add to Each Workflow

### Add These 6 Fields (After "name" field)

```json
{
  "id": "wf-{workflow-name}-v1",
  "version": 1,
  "versionId": "v1.0.0",
  "tenantId": "default-tenant",
  "createdAt": "2026-01-22T10:00:00Z",
  "updatedAt": "2026-01-22T10:00:00Z",

  // existing fields below
  "name": "...",
  "active": false,
  // ... rest of workflow
}
```

### Add This Tags Array (After "active" field)

```json
"tags": [
  { "name": "user-management" },
  { "name": "crud" },        // or "security", "password", "dangerous"
  { "name": "core" }         // or "password", "dangerous"
],
```

### Enhance Meta Object (Replace empty `{}`)

```json
"meta": {
  "description": "Clear description of what workflow does",
  "author": "MetaBuilder",
  "workflowType": "crud",    // or "security"
  "scope": "global"
}
```

---

## The 5 Workflows at a Glance

| Workflow | ID | Nodes | Tags | WorkflowType |
|----------|----|----|------|--------------|
| create-user.json | `wf-create-user-v1` | 6 | user-management, crud, core | crud |
| list-users.json | `wf-list-users-v1` | 6 | user-management, crud, core | crud |
| update-user.json | `wf-update-user-v1` | 4 | user-management, crud, core | crud |
| reset-password.json | `wf-reset-password-v1` | 7 | user-management, security, password | security |
| delete-user.json | `wf-delete-user-v1` | 6 | user-management, crud, dangerous | crud |

---

## Field Reference

### `id` - Workflow Identifier

**Format**: `wf-{name}-v{version}`

```
✅ Correct:
- wf-create-user-v1
- wf-list-users-v1
- wf-reset-password-v1

❌ Wrong:
- CreateUser
- create_user
- workflow-1
```

### `version` - Integer Version Number

**Type**: Integer (never decimal)

```
✅ Correct: 1, 2, 3
❌ Wrong: "1", 1.0, 1.5
```

### `versionId` - Semantic Version

**Format**: `v{major}.{minor}.{patch}`

```
✅ Current: v1.0.0
✅ Future: v1.0.1 (patch), v1.1.0 (minor), v2.0.0 (major)
❌ Wrong: "1.0.0" (missing v), 1.0, v1
```

### `tenantId` - Multi-Tenant Owner

**Type**: String (identify tenant that owns this workflow definition)

```
✅ Correct: "default-tenant" (for shared workflows)
✅ Correct: "acme" (for tenant-specific workflows)
❌ Wrong: Leave it out (it's required in n8n schema)
❌ Don't confuse with: $context.tenantId in runtime (that's filtering)
```

### `createdAt` & `updatedAt` - ISO 8601 Timestamps

**Format**: `YYYY-MM-DDTHH:mm:ssZ` (UTC)

```
✅ Correct: "2026-01-22T10:00:00Z"
❌ Wrong: "2026-01-22 10:00:00", "01/22/2026", "1/22/26"
```

### `tags` - Categorization Array

**Structure**: Array of `{ "name": "tag-name" }` objects

```json
✅ Correct:
"tags": [
  { "name": "user-management" },
  { "name": "crud" }
]

❌ Wrong:
"tags": ["user-management", "crud"]         // Missing object wrapper
"tags": [{ "id": "user-management" }]       // Should be "name", not "id"
"tags": "user-management,crud"              // Should be array, not string
```

### `meta` - Metadata Object

**Required fields**: `description`, `author`, `workflowType`, `scope`

```json
✅ Correct:
"meta": {
  "description": "Creates a new user with email validation",
  "author": "MetaBuilder",
  "workflowType": "crud",
  "scope": "global"
}

❌ Wrong:
"meta": {}                           // Empty (should have description)
"meta": { "description": "..." }    // Missing author, workflowType, scope
```

---

## Before/After Examples

### Example 1: create-user.json

**BEFORE**:
```json
{
  "name": "Create User",
  "active": false,
  "nodes": [
    // ...
  ],
  "connections": {},
  "staticData": {},
  "meta": {},
  "settings": { /* ... */ }
}
```

**AFTER**:
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
    // ... NO CHANGES HERE
  ],
  "connections": {},
  "staticData": {},
  "meta": {
    "description": "Creates a new user with email validation and password hashing",
    "author": "MetaBuilder",
    "workflowType": "crud",
    "scope": "global"
  },
  "settings": { /* ... */ }
}
```

### Example 2: reset-password.json

**Changes**:
- Add `id`: `"wf-reset-password-v1"`
- Add `version`: `1`
- Add `versionId`: `"v1.0.0"`
- Add `tenantId`: `"default-tenant"`
- Add timestamps
- **Different tags**: `["user-management", "security", "password"]`
- **Different workflowType**: `"security"` (not `"crud"`)
- **Different description**: About password reset

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Wrong ID Format

```json
❌ "id": "CreateUser"              // Should be lowercase: wf-create-user-v1
❌ "id": "create_user_v1"          // Should use dashes: wf-create-user-v1
❌ "id": "wf-createUser-v1"        // Should be lowercase: wf-create-user-v1
❌ "id": "wf-create-user"          // Missing version: wf-create-user-v1
```

### ❌ Mistake 2: Version as String

```json
❌ "version": "1"                  // Should be integer, not string
❌ "version": 1.0                  // Should be integer, not float
✅ "version": 1
```

### ❌ Mistake 3: Timestamp Format

```json
❌ "createdAt": "01/22/2026"       // Should be ISO 8601
❌ "createdAt": "2026-01-22"       // Missing time and Z
❌ "createdAt": "2026-01-22T10:00:00"  // Missing Z for UTC
✅ "createdAt": "2026-01-22T10:00:00Z"
```

### ❌ Mistake 4: Missing Tags

```json
❌ "tags": []                      // Should have at least 1-3 tags
❌ No tags field at all           // Required in n8n schema
✅ "tags": [
     { "name": "user-management" },
     { "name": "crud" }
   ]
```

### ❌ Mistake 5: Empty Meta

```json
❌ "meta": {}                      // Should have description at minimum
✅ "meta": {
     "description": "...",
     "author": "MetaBuilder",
     "workflowType": "crud",
     "scope": "global"
   }
```

### ❌ Mistake 6: Modifying Nodes

```json
❌ Changing node ids                      // Don't touch these!
❌ Adding/removing nodes                  // Only adding metadata!
❌ Changing node parameters               // Multi-tenant filters already work!

✅ ONLY add top-level fields (id, version, versionId, tenantId, createdAt, etc.)
✅ ONLY enhance existing meta object
✅ Leave nodes completely unchanged
```

### ❌ Mistake 7: Confusing Tenant Contexts

```json
❌ Adding "tenantId" inside nodes      // That's wrong location
❌ Removing "{{ $context.tenantId }}"  // That's the runtime filter!
✅ Top-level "tenantId": "default-tenant"  // Identifies workflow owner
✅ Node filter: "tenantId": "{{ $context.tenantId }}"  // Runtime filtering
```

---

## Validation Commands

### Quick Syntax Check

```bash
# Check one file
python3 -m json.tool packages/user_manager/workflow/create-user.json > /dev/null && echo "✅ Valid" || echo "❌ Invalid"

# Check all files
for f in packages/user_manager/workflow/*.json; do
  python3 -m json.tool "$f" > /dev/null && echo "✅ $(basename $f)" || echo "❌ $(basename $f)"
done
```

### Count New Fields

```bash
# Should see 6 new fields
grep -c '"id":\|"version":\|"versionId":\|"tenantId":\|"createdAt":\|"updatedAt":' \
  packages/user_manager/workflow/create-user.json
# Expected: 6
```

### Verify ID Format

```bash
# Should all start with "wf-"
grep '"id":' packages/user_manager/workflow/*.json
# Expected output: 5 IDs all starting with "wf-"
```

### Check Tags Present

```bash
# Should see "user-management" in all 5 files
for f in packages/user_manager/workflow/*.json; do
  count=$(grep -c "user-management" "$f")
  if [ "$count" -gt 0 ]; then
    echo "✅ $(basename $f): has tags"
  else
    echo "❌ $(basename $f): missing tags"
  fi
done
```

---

## Git Quick Commands

### See What Changed

```bash
git diff packages/user_manager/workflow/create-user.json
# Should show 6 new fields and enhanced meta object
```

### Stage Changes

```bash
git add packages/user_manager/workflow/*.json
```

### Review Before Commit

```bash
git status
# Should show 5 modified files in green (staged)
```

### Create Commit

```bash
git commit -m "feat(user_manager): migrate 5 workflows to n8n schema

- Add id, version, versionId, tenantId fields
- Add createdAt, updatedAt timestamps
- Add tags array for categorization
- Enhance meta object with descriptions
- All 5 workflows now n8n compliant"
```

---

## File Locations

```
/Users/rmac/Documents/metabuilder/
├── packages/user_manager/
│   └── workflow/
│       ├── create-user.json         ← Update this
│       ├── delete-user.json         ← Update this
│       ├── list-users.json          ← Update this
│       ├── reset-password.json      ← Update this
│       └── update-user.json         ← Update this
├── docs/
│   ├── USER_MANAGER_WORKFLOW_UPDATE_PLAN.md        ← Full details
│   ├── USER_MANAGER_IMPLEMENTATION_CHECKLIST.md    ← Step-by-step
│   └── USER_MANAGER_QUICK_REFERENCE.md             ← This file
├── schemas/
│   └── n8n-workflow.schema.json     ← Authority
└── backup-YYYYMMDD/                ← Your backup here
    ├── create-user.json
    ├── delete-user.json
    ├── list-users.json
    ├── reset-password.json
    └── update-user.json
```

---

## Success Indicators

### ✅ You're Done When

1. **All files updated**
   ```bash
   for f in packages/user_manager/workflow/*.json; do
     python3 -m json.tool "$f" > /dev/null && echo "✅ $(basename $f)" || echo "❌ $(basename $f)"
   done
   # All show ✅
   ```

2. **All new fields present**
   ```bash
   grep -c '"id":\|"version":\|"versionId":\|"tenantId":\|"createdAt":\|"updatedAt":' \
     packages/user_manager/workflow/create-user.json
   # Shows: 6
   ```

3. **Git shows changes**
   ```bash
   git status packages/user_manager/workflow/
   # Shows 5 modified files
   ```

4. **Commit created**
   ```bash
   git log -1
   # Shows your commit message
   ```

---

## Need Help?

### Check These Files

1. **Full implementation plan**: `/docs/USER_MANAGER_WORKFLOW_UPDATE_PLAN.md`
   - Parts 1-4 for detailed info
   - Part 5 for validation checklist
   - Part 6 for implementation steps

2. **Step-by-step checklist**: `/docs/USER_MANAGER_IMPLEMENTATION_CHECKLIST.md`
   - Pre-implementation setup
   - Detailed steps for each workflow
   - Post-implementation validation

3. **N8N Schema reference**: `/schemas/n8n-workflow.schema.json`
   - Authoritative field definitions
   - Type requirements
   - Optional vs required fields

### Common Questions

**Q: Do I need to change the nodes?**
A: NO. Only add top-level fields. Nodes are completely unchanged.

**Q: What if I already have some fields?**
A: Check current files first. Some might partially have fields. Just add the missing ones.

**Q: Should I change node-level tenantId filters?**
A: NO. The `{{ $context.tenantId }}` in node parameters stays exactly the same.

**Q: What if a timestamp format is wrong?**
A: Use this format exactly: `"2026-01-22T10:00:00Z"` (year-month-day T hour:minute:second Z)

**Q: Can I use a different version number?**
A: For these initial updates, use `1`. Increment it when making breaking changes later.

**Q: Do all workflows need the same tags?**
A: Most have `user-management` in common. Some have special tags like `security` or `password`.

---

## One More Thing

⚠️ **Important**: These are **backward compatible** changes. Existing APIs and workflows continue to work. This is purely adding metadata for better organization and tracking.

✨ **Benefit**: Workflows are now fully n8n schema compliant and ready for production deployment.

---

**Last Updated**: 2026-01-22
**Related Documents**:
- USER_MANAGER_WORKFLOW_UPDATE_PLAN.md (full guide)
- USER_MANAGER_IMPLEMENTATION_CHECKLIST.md (step-by-step)
- N8N_MIGRATION_STATUS.md (overall project status)
