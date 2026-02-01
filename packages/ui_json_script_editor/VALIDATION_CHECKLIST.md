# JSON Script Editor Workflows - Validation Checklist
## n8n Compliance Verification & Testing Matrix

**Date**: 2026-01-22
**Scope**: 5 Workflows
**Purpose**: Ensure all workflows meet n8n standard before deployment

---

## 🔍 Pre-Implementation Validation

### Document Review

- [ ] Read `WORKFLOW_UPDATE_PLAN.md` completely
- [ ] Review `WORKFLOW_EXAMPLES_UPDATED.md` examples
- [ ] Understand n8n schema standards (Appendix A of plan)
- [ ] Identify pagination bug in list-scripts.json
- [ ] Understand tenant isolation requirements

### Backup & Safety

- [ ] Create `workflow/backups/` directory
- [ ] Backup all 5 original workflow files
- [ ] Document original versions for rollback
- [ ] Create feature branch: `feature/ui-json-script-editor-n8n-compliance`

---

## 📋 Workflow-by-Workflow Validation

### ✅ Validation Template (For Each Workflow)

#### A. Root-Level Fields

**Workflow**: `__________-script.json`

- [ ] `id` field present: `json_script_editor_{action}_001`
- [ ] `versionId` field present: `1.0.0`
- [ ] `tenantId` field present: `{{ $context.tenantId }}`
- [ ] `name` field present and matches file purpose
- [ ] `active` field present: `false`
- [ ] `description` field present with purpose explanation
- [ ] `author` field present: "MetaBuilder Admin"
- [ ] `tags` array present with 2-4 categorization tags
- [ ] `createdAt` timestamp optional but recommended
- [ ] `updatedAt` timestamp optional but recommended

**Validation Command**:
```bash
jq '{id, versionId, tenantId, name, active, description, author, tags}' \
  packages/ui_json_script_editor/workflow/{name}-script.json
```

**Expected Output**: All 10 fields present

---

#### B. Node Structure & Types

**For each node in the workflow**:

- [ ] Node has unique `id` (no duplicates in workflow)
- [ ] Node has descriptive `name` (same as display name)
- [ ] Node has correct `type` using namespace hierarchy:
  - `metabuilder.operation.validate` (for validate operations)
  - `metabuilder.logic.condition` (for conditional branches)
  - `metabuilder.data.transform` (for data transformations)
  - `metabuilder.data.database` (for database operations)
  - `metabuilder.data.count` (for counting operations)
  - `metabuilder.http.response` (for HTTP responses)
- [ ] Node has `typeVersion` >= 1
- [ ] Node has `position` as [x, y] number array (not strings)
- [ ] Node has `parameters` object (may be empty for some types)

**Validation Command**:
```bash
jq '.nodes | map({id, name, type, typeVersion, position, parameters})' \
  packages/ui_json_script_editor/workflow/{name}-script.json
```

**Check For**:
- ❌ No nodes with type `metabuilder.action` (old format)
- ❌ No nodes with undefined position
- ❌ No duplicate node IDs
- ✅ All node types follow namespace pattern

---

#### C. Connection Graph Validation

**Check Connections Object**:

- [ ] `connections` object is not empty (`{}` is invalid)
- [ ] For each node, if it has outgoing connections, it's in `connections` object
- [ ] For each connection entry:
  - [ ] Entry key matches an existing node `id`
  - [ ] `main` property exists with number keys (output indices)
  - [ ] Each output maps to array of targets
  - [ ] Each target has `node`, `type`, and `index` fields
  - [ ] Target `node` field references existing node ID
  - [ ] Target `type` is "main"
  - [ ] Target `index` is valid input index (usually 0)

**Validation Command**:
```bash
# Check all connection targets exist as nodes
jq '
  .connections as $conns |
  .nodes | map(.id) as $nodeIds |
  $conns | to_entries | map(
    .key as $fromNode |
    .value.main | to_entries | map(
      .value[] | select(.node as $target | $nodeIds | contains([$target])) |
      "\(.node) <- \($fromNode)"
    )
  ) | flatten | unique
' packages/ui_json_script_editor/workflow/{name}-script.json
```

**Success Criteria**:
- All connection targets are valid node IDs
- No orphaned nodes (all nodes appear in connections)
- Flow is logically sound (no circular loops)

---

#### D. Multi-Tenant Safety Check

**Check Tenant Isolation**:

- [ ] Root-level `tenantId` set to `{{ $context.tenantId }}`
- [ ] Every database read operation filters by tenantId:
  ```json
  {
    "filter": {
      "tenantId": "{{ $context.tenantId }}"
    }
  }
  ```
- [ ] Every database write operation includes tenantId in data:
  ```json
  {
    "data": {
      "tenantId": "{{ $context.tenantId }}"
    }
  }
  ```
- [ ] No unfiltered database queries (e.g., no `{ }` empty filter)

**Validation Command**:
```bash
jq '.nodes[] |
  select(.type == "metabuilder.data.database") |
  select(.parameters.operation | test("read|count")) |
  select(.parameters.filter | contains({"tenantId": "{{ $context.tenantId }}"}) | not) |
  {id, filter: .parameters.filter}' \
  packages/ui_json_script_editor/workflow/{name}-script.json
```

**Expected Output**: `null` or empty (no unfiltered queries)

---

#### E. Settings Validation

**Check Workflow Settings**:

- [ ] `settings.timezone` present: "UTC"
- [ ] `settings.executionTimeout` present: 3600 (1 hour)
- [ ] `settings.saveExecutionProgress` present: true
- [ ] `settings.saveDataErrorExecution` present: "all" or relevant
- [ ] `settings.saveDataSuccessExecution` present: "all" or relevant

**Validation Command**:
```bash
jq '.settings' packages/ui_json_script_editor/workflow/{name}-script.json
```

**Expected Output**:
```json
{
  "timezone": "UTC",
  "executionTimeout": 3600,
  "saveExecutionProgress": true,
  "saveDataErrorExecution": "all",
  "saveDataSuccessExecution": "all"
}
```

---

### 🔧 Workflow-Specific Checks

#### 1. Export Script (`export-script.json`)

**Specific Checks**:

- [ ] 4 nodes in sequence: validate → fetch → prepare → return
- [ ] All nodes properly connected
- [ ] `fetch_script` node filters by both `id` AND `tenantId`
- [ ] `return_file` node has proper HTTP headers (Content-Disposition)
- [ ] Status code: 200 (successful download)

**Validation**:
```bash
jq '
  (.nodes | length) == 4 and
  (.nodes | map(.id) | . == ["validate_context", "fetch_script", "prepare_export", "return_file"]) and
  (.nodes[] | select(.id == "fetch_script") | .parameters.filter | has("tenantId")) and
  (.nodes[] | select(.id == "return_file") | .parameters.status == 200)
' packages/ui_json_script_editor/workflow/export-script.json
```

**Expected**: `true`

---

#### 2. Import Script (`import-script.json`)

**Specific Checks**:

- [ ] 6 nodes with permission check before processing
- [ ] `check_permission` validates `$context.user.level >= 3`
- [ ] `parse_script` parses JSON from fileContent
- [ ] `validate_format` checks version is "2.2.0"
- [ ] `create_script` includes audit fields:
  - [ ] `tenantId`
  - [ ] `createdBy` (user.id)
  - [ ] `createdAt` (timestamp)
- [ ] Status code: 201 (created)

**Validation**:
```bash
jq '
  (.nodes | length) == 6 and
  (.nodes[] | select(.id == "check_permission") | .parameters.condition | contains("user.level")) and
  (.nodes[] | select(.id == "validate_format") | .parameters.condition | contains("2.2.0")) and
  (.nodes[] | select(.id == "create_script") | .parameters.data | has("tenantId") and has("createdBy"))
' packages/ui_json_script_editor/workflow/import-script.json
```

**Expected**: `true`

---

#### 3. List Scripts (`list-scripts.json`)

**🔴 CRITICAL: Pagination Bug Fix**

- [ ] Pagination calculation: `(($json.page || 1) - 1) * ($json.limit || 50)`
- [ ] ❌ NOT: `($json.page || 1 - 1)` (wrong operator precedence)
- [ ] Limit capped at 500: `Math.min($json.limit || 50, 500)`
- [ ] Both `fetch_scripts` and `count_total` filtered by tenantId
- [ ] Parallel execution: `extract_pagination` fans out to both nodes
- [ ] Both branches merge at `format_response`

**Validation Command**:
```bash
jq '.nodes[] | select(.id == "extract_pagination") | .parameters.output.offset' \
  packages/ui_json_script_editor/workflow/list-scripts.json | grep -q '((\$json.page || 1) - 1)' && echo "✅ CORRECT" || echo "❌ BUG"
```

**Expected**: `✅ CORRECT`

**Full Validation**:
```bash
jq '
  (.nodes | length) == 6 and
  (.nodes[] | select(.id == "extract_pagination") | .parameters.output.offset | contains("(($json.page || 1) - 1)")) and
  (.nodes[] | select(.id == "fetch_scripts") | .parameters.filter | has("tenantId")) and
  (.nodes[] | select(.id == "count_total") | .parameters.filter | has("tenantId")) and
  (.connections.extract_pagination.main["0"] | length == 2)
' packages/ui_json_script_editor/workflow/list-scripts.json
```

**Expected**: `true`

---

#### 4. Save Script (`save-script.json`)

**Specific Checks**:

- [ ] 4 nodes: permission → validate → create → response
- [ ] `check_permission` validates god-level access (>= 3)
- [ ] `validate_input` checks both `name` and `script` required
- [ ] `create_script` includes:
  - [ ] `tenantId`: from context
  - [ ] `createdBy`: from user.id
  - [ ] `createdAt`: ISO timestamp
- [ ] Status code: 201 (created)

**Validation**:
```bash
jq '
  (.nodes | length) == 4 and
  (.nodes[] | select(.id == "check_permission") | .parameters.condition | contains("user.level >= 3")) and
  (.nodes[] | select(.id == "validate_input") | .parameters.rules | has("name") and has("script")) and
  (.nodes[] | select(.id == "create_script") | .parameters.data | has("tenantId") and has("createdBy"))
' packages/ui_json_script_editor/workflow/save-script.json
```

**Expected**: `true`

---

#### 5. Validate Script (`validate-script.json`)

**Specific Checks**:

- [ ] 6 nodes with parallel validation branches
- [ ] `parse_json` parses the script content
- [ ] `validate_version` checks version == "2.2.0"
- [ ] `validate_nodes` checks:
  - [ ] Array check: `Array.isArray(...)`
  - [ ] Non-empty: `.length > 0`
- [ ] `validate_node_structure` checks each node has `id` and `type`
- [ ] Parallel execution: `parse_json` fans out to both validators
- [ ] Merge point: both validators fan in to structure check
- [ ] Response status: 200 (validation passed)

**Validation**:
```bash
jq '
  (.nodes | length) == 6 and
  (.nodes[] | select(.id == "validate_version") | .parameters.condition | contains("2.2.0")) and
  (.nodes[] | select(.id == "validate_nodes") | .parameters.condition | contains("Array.isArray")) and
  (.connections.parse_json.main["0"] | length == 2) and
  (.nodes[] | select(.id == "return_valid") | .parameters.status == 200)
' packages/ui_json_script_editor/workflow/validate-script.json
```

**Expected**: `true`

---

## 🧪 Integration & Testing

### JSON Syntax Validation

```bash
echo "=== Validating JSON Syntax ==="
for workflow in export import list save validate; do
  FILE="packages/ui_json_script_editor/workflow/${workflow}-script.json"
  if jq empty "$FILE" 2>/dev/null; then
    echo "✅ $FILE - Valid JSON"
  else
    echo "❌ $FILE - SYNTAX ERROR"
    jq . "$FILE" 2>&1 | head -10
  fi
done
```

### Schema Validation (If Schema Available)

```bash
echo "=== Validating Against Schema ==="
SCHEMA_FILE="schemas/package-schemas/workflow.schema.json"

if [ -f "$SCHEMA_FILE" ]; then
  for workflow in export import list save validate; do
    FILE="packages/ui_json_script_editor/workflow/${workflow}-script.json"
    # Requires ajv CLI or similar
    echo "Validating $FILE against schema..."
    # validation command here
  done
else
  echo "⚠️ Schema file not found at $SCHEMA_FILE"
fi
```

### Structural Validation

```bash
echo "=== Checking Structural Completeness ==="

check_workflow() {
  local FILE=$1
  local NAME=$(basename "$FILE")

  echo "Checking $NAME..."

  # Check root fields
  local MISSING=()
  for FIELD in "id" "versionId" "tenantId" "name" "active" "description" "author" "tags"; do
    if ! jq -e ".$FIELD" "$FILE" > /dev/null 2>&1; then
      MISSING+=("$FIELD")
    fi
  done

  if [ ${#MISSING[@]} -eq 0 ]; then
    echo "  ✅ All root fields present"
  else
    echo "  ❌ Missing fields: ${MISSING[*]}"
  fi

  # Check nodes
  local NODE_COUNT=$(jq '.nodes | length' "$FILE")
  echo "  ✅ Contains $NODE_COUNT nodes"

  # Check connections
  if jq -e '.connections | length > 0' "$FILE" > /dev/null 2>&1; then
    echo "  ✅ Connections defined"
  else
    echo "  ❌ No connections defined"
  fi
}

for workflow in packages/ui_json_script_editor/workflow/*-script.json; do
  check_workflow "$workflow"
done
```

---

## 🚀 Pre-Deployment Checklist

### Code Quality

- [ ] TypeScript compilation succeeds: `npm run typecheck`
- [ ] Build completes without errors: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] No console.log statements in workflows
- [ ] No debugger statements

### Testing

- [ ] Unit tests pass (if applicable)
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] No new test failures introduced
- [ ] Workflows execute successfully in dev environment
- [ ] Pagination works correctly (test with limit=20, page=2)
- [ ] Multi-tenant filtering verified (test with different tenants)

### Documentation

- [ ] `package.json` file inventory updated
- [ ] `JSON_SCRIPT_EDITOR_GUIDE.md` updated with schema info
- [ ] Workflow file headers documented
- [ ] Change log entry created
- [ ] Migration guide written (if needed)

### Git & Commit

- [ ] Feature branch created and tested
- [ ] All changes staged: `git add -A`
- [ ] Commit message follows format:
  ```
  feat(ui_json_script_editor): migrate workflows to n8n compliance

  - Add id, versionId, tenantId fields
  - Update node types to namespace hierarchy
  - Add complete connection graphs
  - Fix pagination bug in list-scripts.json
  - Improve multi-tenant isolation

  Workflows: export, import, list, save, validate
  ```
- [ ] No commits to main branch without PR
- [ ] PR created with:
  - [ ] Descriptive title
  - [ ] Link to issue (if applicable)
  - [ ] Summary of changes
  - [ ] Testing instructions
  - [ ] Breaking changes noted (if any)

---

## 📊 Compliance Score Card

### Before Implementation

| Workflow | Root Fields | Node Types | Connections | Tenant Filtering | Status |
|----------|-------------|-----------|--------------|------------------|--------|
| export | ❌ 0/10 | ❌ 0/4 | ❌ No | ✅ Yes | 🔴 20% |
| import | ❌ 0/10 | ❌ 0/6 | ❌ No | ✅ Yes | 🔴 20% |
| list | ❌ 0/10 | ❌ 0/6 | ❌ No | 🟡 Partial | 🔴 15% |
| save | ❌ 0/10 | ❌ 0/4 | ❌ No | ✅ Yes | 🔴 20% |
| validate | ❌ 0/10 | ❌ 0/6 | ❌ No | ⚠️ N/A | 🔴 10% |
| **Total** | **0/50** | **0/26** | **0/5** | **90%** | **🔴 35/100** |

### Target (After Implementation)

| Workflow | Root Fields | Node Types | Connections | Tenant Filtering | Status |
|----------|-------------|-----------|--------------|------------------|--------|
| export | ✅ 10/10 | ✅ 4/4 | ✅ Yes | ✅ Yes | 🟢 100% |
| import | ✅ 10/10 | ✅ 6/6 | ✅ Yes | ✅ Yes | 🟢 100% |
| list | ✅ 10/10 | ✅ 6/6 | ✅ Yes | ✅ Yes | 🟢 100% |
| save | ✅ 10/10 | ✅ 4/4 | ✅ Yes | ✅ Yes | 🟢 100% |
| validate | ✅ 10/10 | ✅ 6/6 | ✅ Yes | ✅ Yes | 🟢 100% |
| **Total** | **50/50** | **26/26** | **5/5** | **100%** | **🟢 100/100** |

---

## 🔄 Rollback Procedure

If issues discovered post-deployment:

```bash
# 1. Identify problematic workflow
git log --oneline | head -5

# 2. Check backup
ls -la packages/ui_json_script_editor/workflow/backups/

# 3. Restore original
cp packages/ui_json_script_editor/workflow/backups/{name}-script.json \
   packages/ui_json_script_editor/workflow/{name}-script.json

# 4. Revert commit
git revert <commit-hash>

# 5. Create fix branch
git checkout -b fix/ui-json-script-editor-{issue}
```

---

## 📝 Sign-Off

### Implementation Sign-Off

- [ ] **Developer**: All workflows updated and tested
  - Name: `_______________`
  - Date: `_______________`
  - Signature: `_______________`

- [ ] **Code Reviewer**: Changes reviewed and approved
  - Name: `_______________`
  - Date: `_______________`
  - Signature: `_______________`

- [ ] **QA**: Testing completed successfully
  - Name: `_______________`
  - Date: `_______________`
  - Signature: `_______________`

- [ ] **Product Owner**: Ready for production
  - Name: `_______________`
  - Date: `_______________`
  - Signature: `_______________`

---

**Template Status**: Ready to Use
**Last Updated**: 2026-01-22
**Next**: Execute checklist during implementation phase
