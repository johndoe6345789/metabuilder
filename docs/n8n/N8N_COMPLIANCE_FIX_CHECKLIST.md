# N8N Workflow Compliance Fix Checklist

**Status**: ❌ NON-COMPLIANT (42/100)  
**Target Compliance**: ✅ 95/100 or higher  
**Estimated Time**: 2-3 hours  
**Last Updated**: 2026-01-22

---

## Phase 1: Critical Node Schema Fixes (30 min)

### File: auth_login.json
**Status**: 🔴 BLOCKING - 2 issues preventing execution

#### Issue 1.1: Missing typeVersion
- [ ] Open `/packagerepo/backend/workflows/auth_login.json`
- [ ] For each of 7 nodes, add `"typeVersion": 1`
- [ ] Nodes to fix:
  - [ ] parse_body
  - [ ] validate_fields
  - [ ] verify_password
  - [ ] check_verified
  - [ ] generate_token
  - [ ] respond_success
  - [ ] error_invalid_request
  - [ ] error_unauthorized

**Template**:
```json
{
  "id": "node_id",
  "name": "Node Name",
  "type": "plugin.type",
  "typeVersion": 1,  // ADD THIS
  "position": [...],
  "parameters": {...}
}
```

#### Issue 1.2: Missing position
- [ ] For each of 7 nodes in auth_login.json, add `"position": [x, y]`
- [ ] Suggested layout (sequential):
  - parse_body: [100, 100]
  - validate_fields: [400, 100]
  - verify_password: [700, 100]
  - check_verified: [100, 300]
  - generate_token: [400, 300]
  - respond_success: [700, 300]
  - error_invalid_request: [100, 500]
  - error_unauthorized: [400, 500]

**Verification**:
```bash
# Verify all nodes have typeVersion
grep -c '"typeVersion": 1' auth_login.json  # Should be 7

# Verify all nodes have position
grep -c '"position": \[' auth_login.json    # Should be 7
```

---

### File: server.json
**Status**: 🔴 CRITICAL - Corrupted connections

#### Issue 1.3: Fix Corrupted Connections
- [ ] Open `/packagerepo/backend/workflows/server.json`
- [ ] Locate connections object with `"node": "[object Object]"`
- [ ] Replace malformed connections

**Current (WRONG)**:
```json
"connections": {
  "Create App": {
    "main": {
      "0": [
        {
          "node": "[object Object]",  // ❌ WRONG
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  // ... 5 more malformed connections
}
```

**Expected (CORRECT)**:
```json
"connections": {
  "Create App": {
    "main": {
      "0": [
        {
          "node": "Register Publish",  // ✅ CORRECT
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "Register Publish": {
    "main": {
      "0": [
        {
          "node": "Register Download",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  // ... etc
}
```

**All Connections to Fix in server.json**:
- [ ] Create App → Register Publish
- [ ] Register Publish → Register Download
- [ ] Register Download → Register Latest
- [ ] Register Latest → Register Versions
- [ ] Register Versions → Register Login
- [ ] Register Login → Start Server

---

## Phase 2: Define Execution Connections (1-2 hours)

### File: auth_login.json
**Status**: ⚠️ After Phase 1, connections still need defining

#### Issue 2.1: Add Connection Flow
- [ ] Map execution order from node parameters
- [ ] Identify start node: `parse_body`
- [ ] Identify end nodes: `respond_success`, error nodes

**Execution Flow Map**:
```
parse_body
    ↓
validate_fields
    ├─ (then) → error_invalid_request
    └─ (else) → verify_password
                    ↓
                check_verified
                    ├─ (then) → error_unauthorized
                    └─ (else) → generate_token
                                    ↓
                            respond_success
```

**Connections Object to Create**:
```json
"connections": {
  "Parse Body": {
    "main": {
      "0": [
        {
          "node": "Validate Fields",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "Validate Fields": {
    "main": {
      "0": [
        {
          "node": "Error Invalid Request",
          "type": "main",
          "index": 0
        }
      ],
      "1": [
        {
          "node": "Verify Password",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "Verify Password": {
    "main": {
      "0": [
        {
          "node": "Check Verified",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "Check Verified": {
    "main": {
      "0": [
        {
          "node": "Error Unauthorized",
          "type": "main",
          "index": 0
        }
      ],
      "1": [
        {
          "node": "Generate Token",
          "type": "main",
          "index": 0
        }
      ]
    }
  },
  "Generate Token": {
    "main": {
      "0": [
        {
          "node": "Respond Success",
          "type": "main",
          "index": 0
        }
      ]
    }
  }
}
```

- [ ] Paste connections into auth_login.json
- [ ] Verify JSON syntax: `jq . auth_login.json`

---

### File: download_artifact.json
**Status**: ⚠️ Needs connection definitions

#### Issue 2.2: Add Connection Flow
- [ ] Map execution order
- [ ] Start node: `parse_path`
- [ ] End nodes: `respond_blob`, error nodes

**Execution Flow Map**:
```
parse_path
    ↓
normalize
    ↓
get_meta
    ↓
check_exists
    ├─ (then) → error_not_found
    └─ (else) → read_blob
                    ↓
                check_blob_exists
                    ├─ (then) → error_blob_missing
                    └─ (else) → respond_blob
```

- [ ] Create connections object following same pattern
- [ ] Paste into download_artifact.json
- [ ] Verify JSON syntax

---

### File: list_versions.json
**Status**: ⚠️ Needs connection definitions

#### Issue 2.3: Add Connection Flow
- [ ] Map execution order
- [ ] Start node: `parse_path`
- [ ] End nodes: `respond_json`, error nodes

**Execution Flow Map**:
```
parse_path
    ↓
normalize
    ↓
query_index
    ↓
check_exists
    ├─ (then) → error_not_found
    └─ (else) → enrich_versions
                    ↓
                respond_json
```

- [ ] Create connections object
- [ ] Paste into list_versions.json
- [ ] Verify JSON syntax

---

### File: resolve_latest.json
**Status**: ⚠️ Needs connection definitions

#### Issue 2.4: Add Connection Flow
- [ ] Map execution order
- [ ] Start node: `parse_path`
- [ ] End nodes: `respond_json`, error nodes

**Execution Flow Map**:
```
parse_path
    ↓
normalize
    ↓
query_index
    ↓
check_exists
    ├─ (then) → error_not_found
    └─ (else) → find_latest
                    ↓
                get_meta
                    ↓
                respond_json
```

- [ ] Create connections object
- [ ] Paste into resolve_latest.json
- [ ] Verify JSON syntax

---

### File: publish_artifact.json
**Status**: ⚠️ Needs connection definitions (most complex - 13 nodes)

#### Issue 2.5: Add Connection Flow
- [ ] Map execution order (most complex workflow)
- [ ] Start node: `verify_auth`
- [ ] End nodes: `success`, `error_exists`

**Execution Flow Map**:
```
verify_auth
    ↓
check_write_scope
    ↓
parse_path
    ↓
normalize
    ↓
validate
    ↓
compute_digest
    ↓
check_exists
    ├─ (then) → error_exists
    └─ (else) → write_blob
                    ↓
                write_meta
                    ↓
                update_index
                    ↓
                success
```

- [ ] Create comprehensive connections object
- [ ] Handle all 13 nodes
- [ ] Paste into publish_artifact.json
- [ ] Verify JSON syntax

---

## Phase 3: Validation & Testing (30 min)

### Schema Validation
- [ ] Install/verify n8n schema validator available
- [ ] Run validation on each file:
  ```bash
  npm run validate:n8n-workflow auth_login.json
  npm run validate:n8n-workflow download_artifact.json
  npm run validate:n8n-workflow list_versions.json
  npm run validate:n8n-workflow resolve_latest.json
  npm run validate:n8n-workflow publish_artifact.json
  npm run validate:n8n-workflow server.json
  ```
- [ ] All should pass with 0 errors

### Python Executor Testing
- [ ] Verify Python executor available
- [ ] Test each workflow:
  ```bash
  python -m workflow_executor auth_login.json --validate
  python -m workflow_executor download_artifact.json --validate
  python -m workflow_executor list_versions.json --validate
  python -m workflow_executor resolve_latest.json --validate
  python -m workflow_executor publish_artifact.json --validate
  python -m workflow_executor server.json --validate
  ```
- [ ] All should report: "Workflow is valid"

### DAG Construction Test
- [ ] Verify DAG can be built for each workflow
- [ ] Check no cycles detected
- [ ] Verify execution order is deterministic

---

## Phase 4: Documentation (15 min)

### Update N8N_COMPLIANCE_AUDIT.md
- [ ] Open `/docs/N8N_COMPLIANCE_AUDIT.md`
- [ ] Update Action Items section - mark completed items
- [ ] Add "Fixed On" dates
- [ ] Update compliance score to new value (target: 95/100)

**Items to Mark Complete**:
- [ ] ✅ Add `name` property to all workflow nodes
- [ ] ✅ Add `typeVersion: 1` to all workflow nodes
- [ ] ✅ Add `position: [x, y]` to all workflow nodes
- [ ] ✅ Convert connections from array to nested object format
- [ ] ✅ Add connections to workflows that are missing them
- [ ] ✅ Update workflow files:
  - [ ] ✅ `packagerepo/backend/workflows/server.json`
  - [ ] ✅ `packagerepo/backend/workflows/auth_login.json`
  - [ ] ✅ `packagerepo/backend/workflows/download_artifact.json`
  - [ ] ✅ `packagerepo/backend/workflows/list_versions.json`
  - [ ] ✅ `packagerepo/backend/workflows/resolve_latest.json`

### Create Compliance Report
- [ ] Create `/docs/N8N_COMPLIANCE_ANALYSIS_2026-01-22.md` (detailed analysis)
- [ ] Create `/docs/N8N_COMPLIANCE_FIX_CHECKLIST.md` (this file)
- [ ] Update README or main docs with compliance status

---

## Post-Completion Checklist

### Verification
- [ ] All 6 workflow files pass schema validation
- [ ] All 6 workflows can be parsed by Python executor
- [ ] DAG construction succeeds for all workflows
- [ ] No execution order ambiguities
- [ ] Error paths properly connected

### Testing
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Run workflow tests: `pytest workflow_tests.py`
- [ ] Manual test in visual editor (if available)

### Documentation
- [ ] Update CLAUDE.md with n8n workflow standards
- [ ] Add workflow examples to docs
- [ ] Document node type catalog
- [ ] Document connection format

### Git Commit
- [ ] Stage all 6 modified workflow files
- [ ] Create commit: "fix(workflows): complete n8n schema compliance"
- [ ] Message should reference:
  - Issue #X (if tracking)
  - N8N_COMPLIANCE_AUDIT.md recommendations
  - Compliance score improvement (42→95)

---

## Troubleshooting Guide

### Issue: JSON Parse Error After Edits
**Solution**:
```bash
# Validate JSON syntax
jq . filename.json

# If error, check for:
# - Missing commas between object properties
# - Unmatched quotes
# - Trailing commas
```

### Issue: Validation Still Fails After Phase 1
**Check**:
- [ ] All 7 auth_login.json nodes have `"typeVersion": 1`
- [ ] All 7 auth_login.json nodes have `"position": [x, y]`
- [ ] All nodes have matching array/object braces

### Issue: Connections Parse Fails
**Check**:
- [ ] Node names in connections match node `name` fields exactly
- [ ] Connection format matches expected structure
- [ ] No `[object Object]` strings remaining

### Issue: Python Executor Still Fails
**Debug**:
```bash
# Get detailed error
python -c "import json; json.load(open('filename.json'))"

# Check specific node
python -c "
import json
with open('filename.json') as f:
    wf = json.load(f)
for node in wf['nodes']:
    print(f\"{node.get('name')}: {node.get('typeVersion')} at {node.get('position')}\")
"
```

---

## Time Tracking

| Phase | Task | Est. Time | Actual | Status |
|-------|------|-----------|--------|--------|
| 1 | auth_login.json typeVersion | 10 min | | ⏳ |
| 1 | auth_login.json position | 10 min | | ⏳ |
| 1 | server.json connections | 10 min | | ⏳ |
| 2 | auth_login connections | 15 min | | ⏳ |
| 2 | download_artifact connections | 15 min | | ⏳ |
| 2 | list_versions connections | 15 min | | ⏳ |
| 2 | resolve_latest connections | 15 min | | ⏳ |
| 2 | publish_artifact connections | 30 min | | ⏳ |
| 3 | Schema validation | 15 min | | ⏳ |
| 3 | Python executor testing | 15 min | | ⏳ |
| 4 | Documentation update | 15 min | | ⏳ |
| | **TOTAL** | **2-3 hrs** | | ⏳ |

---

## Success Criteria

Compliance will be considered COMPLETE when:

✅ **Schema Compliance**:
- [ ] All 49 nodes have required properties (id, name, type, typeVersion, position)
- [ ] All 6 workflows have proper connections objects
- [ ] No `[object Object]` or malformed data in any file

✅ **Validation**:
- [ ] All 6 files pass n8n schema validation
- [ ] All 6 workflows pass Python executor validation
- [ ] DAG construction succeeds for all workflows

✅ **Testing**:
- [ ] E2E tests pass
- [ ] Workflow execution tests pass
- [ ] Manual verification in visual editor (if available)

✅ **Compliance Score**:
- [ ] **Target**: 95/100 or higher
- [ ] **Breakdown**: All critical issues (🔴) resolved, warnings (⚠️) addressed

✅ **Documentation**:
- [ ] N8N_COMPLIANCE_AUDIT.md updated with completion dates
- [ ] New analysis report created
- [ ] Fix checklist completed

---

**Start Date**: _________________  
**Completion Date**: _________________  
**Completed By**: _________________  

---

*This checklist is your action plan. Check off items as you complete them. Good luck!*
