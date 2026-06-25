# Data Table Workflow (4 Files) - Comprehensive Update Plan

**Created**: 2026-01-22
**Scope**: `/packages/data_table/workflow/` (4 JSON workflows, 18 nodes)
**Status**: CRITICAL - Requires immediate updates for N8N schema compliance
**Estimated Effort**: 1.5-2 hours (Phase 1), 3-4 hours (Full compliance)

---

## Executive Summary

The 4 data table workflows contain **sound business logic** but are **critically non-compliant** with the n8n workflow schema. All workflows will **fail validation and execution** without structural fixes.

| Metric | Current | After Phase 1 | After Full |
|--------|---------|---------------|-----------|
| Compliance Score | 28/100 | 70/100 | 95/100 |
| Nodes Passing Validation | 0/18 | 18/18 | 18/18 |
| Execution Blockers | 3 | 0 | 0 |
| Error Handling | 0% | 0% | 80% |

---

## Current Structure Analysis

### File Inventory

| File | Nodes | Status | Key Issues | Score |
|------|-------|--------|-----------|-------|
| **sorting.json** | 4 | 🔴 FAIL | Missing name, typeVersion, connections | 14% |
| **filtering.json** | 7 | 🔴 FAIL | Missing name, typeVersion, connections | 14% |
| **fetch-data.json** | 12 | 🔴 FAIL | Missing name, typeVersion, connections, ACL bug | 29% |
| **pagination.json** | 5 | 🔴 FAIL | Missing name, typeVersion, connections | 14% |
| **TOTAL** | **28** | 🔴 FAIL | 36 missing properties, 4 empty connections | **18%** |

### Current Node Property Status

```
Required Properties (n8n Schema):
✅ id                4/4 workflows (100%)
✅ type              all 28 nodes (100%)
✅ position          all 28 nodes (100%)
❌ name              0/28 nodes (0%)      [BLOCKING]
❌ typeVersion       0/28 nodes (0%)      [BLOCKING]

Optional but Important:
❌ connections       {} (empty)            [BLOCKING]
❌ error handlers    none                  [MEDIUM]
❌ notes             none                  [LOW]
```

---

## Blocking Issues (Must Fix)

### Issue #1: Missing `name` Property

**Severity**: 🔴 BLOCKING
**Affected**: 28/28 nodes (100%)
**Validator**: Python executor line 40 - checks "name" in required fields
**Impact**: All nodes fail validation

#### Current State (WRONG)
```json
{
  "id": "extract_sort_params",
  "type": "metabuilder.transform",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": { ... }
}
```

#### Required State (CORRECT)
```json
{
  "id": "extract_sort_params",
  "name": "Extract Sort Parameters",
  "type": "metabuilder.transform",
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": { ... }
}
```

#### Naming Convention

Convert snake_case ID to Title Case:

```
extract_sort_params     → Extract Sort Parameters
validate_sort_fields    → Validate Sort Fields
apply_sort              → Apply Sort
return_sorted           → Return Sorted
validate_context        → Validate Context
extract_filters         → Extract Filters
apply_status_filter     → Apply Status Filter
apply_search_filter     → Apply Search Filter
apply_date_filter       → Apply Date Filter
filter_data             → Filter Data
return_filtered         → Return Filtered
validate_tenant_critical→ Validate Tenant Critical
validate_user_critical  → Validate User Critical
validate_input          → Validate Input
extract_params          → Extract Params
calculate_offset        → Calculate Offset
build_filter            → Build Filter
apply_user_acl          → Apply User ACL
fetch_data              → Fetch Data
validate_response       → Validate Response
parse_response          → Parse Response
format_response         → Format Response
return_success          → Return Success
extract_pagination_params → Extract Pagination Params
slice_data              → Slice Data
calculate_total_pages   → Calculate Total Pages
return_paginated        → Return Paginated
```

**Fix Time**: 5 minutes per file
**Total Time**: 20 minutes for all 4 files

---

### Issue #2: Missing `typeVersion` Property

**Severity**: 🔴 BLOCKING
**Affected**: 28/28 nodes (100%)
**Validator**: Python executor line 49 - checks typeVersion >= 1
**Impact**: All nodes fail validation

#### Current State (WRONG)
```json
{
  "id": "extract_sort_params",
  "type": "metabuilder.transform",
  "position": [100, 100],
  ...
}
```

#### Required State (CORRECT)
```json
{
  "id": "extract_sort_params",
  "type": "metabuilder.transform",
  "typeVersion": 1,
  "position": [100, 100],
  ...
}
```

**Rule**: Add `"typeVersion": 1` to every node (already present in current files!)
**Status**: ✅ Already fixed - all 28 nodes have typeVersion

---

### Issue #3: Empty Connections Object

**Severity**: 🔴 BLOCKING
**Affected**: 4/4 workflows
**Current**: `"connections": {}` (no execution flow)
**Impact**: Workflows cannot execute (no node flow defined)

#### N8N Connections Format Standard

```json
{
  "connections": {
    "NodeName": {
      "main": {
        "outputIndex": [
          {
            "node": "NextNodeName",
            "type": "main",
            "index": inputIndex
          }
        ]
      }
    }
  }
}
```

#### Execution Flows Required

**sorting.json** (Linear - 4 nodes)
```
Extract Sort Params → Validate Sort Fields → Apply Sort → Return Sorted
```

```json
"connections": {
  "Extract Sort Params": {
    "main": {
      "0": [{"node": "Validate Sort Fields", "type": "main", "index": 0}]
    }
  },
  "Validate Sort Fields": {
    "main": {
      "0": [{"node": "Apply Sort", "type": "main", "index": 0}],
      "1": [{"node": "Apply Sort", "type": "main", "index": 0}]
    }
  },
  "Apply Sort": {
    "main": {
      "0": [{"node": "Return Sorted", "type": "main", "index": 0}]
    }
  }
}
```

**filtering.json** (Branching - 7 nodes)
```
Validate Context → Extract Filters →
  ├→ Apply Status Filter
  ├→ Apply Search Filter
  └→ Apply Date Filter
  (All merge to) → Filter Data → Return Filtered
```

```json
"connections": {
  "Validate Context": {
    "main": {
      "0": [{"node": "Extract Filters", "type": "main", "index": 0}],
      "1": [{"node": "Extract Filters", "type": "main", "index": 0}]
    }
  },
  "Extract Filters": {
    "main": {
      "0": [
        {"node": "Apply Status Filter", "type": "main", "index": 0},
        {"node": "Apply Search Filter", "type": "main", "index": 0},
        {"node": "Apply Date Filter", "type": "main", "index": 0}
      ]
    }
  },
  "Apply Status Filter": {
    "main": {
      "0": [{"node": "Filter Data", "type": "main", "index": 0}],
      "1": [{"node": "Filter Data", "type": "main", "index": 0}]
    }
  },
  "Apply Search Filter": {
    "main": {
      "0": [{"node": "Filter Data", "type": "main", "index": 0}],
      "1": [{"node": "Filter Data", "type": "main", "index": 0}]
    }
  },
  "Apply Date Filter": {
    "main": {
      "0": [{"node": "Filter Data", "type": "main", "index": 0}],
      "1": [{"node": "Filter Data", "type": "main", "index": 0}]
    }
  },
  "Filter Data": {
    "main": {
      "0": [{"node": "Return Filtered", "type": "main", "index": 0}]
    }
  }
}
```

**fetch-data.json** (Complex - 12 nodes)
```
Validate Tenant Critical → Validate User Critical → Validate Input →
  Extract Params ∥ Calculate Offset ∥ Build Filter →
  Apply User ACL → Fetch Data → Validate Response →
  Parse Response → Format Response → Return Success
```

```json
"connections": {
  "Validate Tenant Critical": {
    "main": {
      "0": [{"node": "Validate User Critical", "type": "main", "index": 0}],
      "1": [{"node": "Validate User Critical", "type": "main", "index": 0}]
    }
  },
  "Validate User Critical": {
    "main": {
      "0": [{"node": "Validate Input", "type": "main", "index": 0}],
      "1": [{"node": "Validate Input", "type": "main", "index": 0}]
    }
  },
  "Validate Input": {
    "main": {
      "0": [
        {"node": "Extract Params", "type": "main", "index": 0},
        {"node": "Calculate Offset", "type": "main", "index": 0},
        {"node": "Build Filter", "type": "main", "index": 0}
      ],
      "1": [
        {"node": "Extract Params", "type": "main", "index": 0},
        {"node": "Calculate Offset", "type": "main", "index": 0},
        {"node": "Build Filter", "type": "main", "index": 0}
      ]
    }
  },
  "Extract Params": {
    "main": {
      "0": [{"node": "Apply User ACL", "type": "main", "index": 0}]
    }
  },
  "Calculate Offset": {
    "main": {
      "0": [{"node": "Apply User ACL", "type": "main", "index": 0}]
    }
  },
  "Build Filter": {
    "main": {
      "0": [{"node": "Apply User ACL", "type": "main", "index": 0}]
    }
  },
  "Apply User ACL": {
    "main": {
      "0": [{"node": "Fetch Data", "type": "main", "index": 0}],
      "1": [{"node": "Fetch Data", "type": "main", "index": 0}]
    }
  },
  "Fetch Data": {
    "main": {
      "0": [{"node": "Validate Response", "type": "main", "index": 0}]
    }
  },
  "Validate Response": {
    "main": {
      "0": [
        {"node": "Parse Response", "type": "main", "index": 0},
        {"node": "Parse Response", "type": "main", "index": 0}
      ],
      "1": [
        {"node": "Parse Response", "type": "main", "index": 0},
        {"node": "Parse Response", "type": "main", "index": 0}
      ]
    }
  },
  "Parse Response": {
    "main": {
      "0": [{"node": "Format Response", "type": "main", "index": 0}]
    }
  },
  "Format Response": {
    "main": {
      "0": [{"node": "Return Success", "type": "main", "index": 0}]
    }
  }
}
```

**pagination.json** (Linear - 5 nodes)
```
Extract Pagination Params → Calculate Offset →
  Slice Data ∥ Calculate Total Pages → Return Paginated
```

```json
"connections": {
  "Extract Pagination Params": {
    "main": {
      "0": [{"node": "Calculate Offset", "type": "main", "index": 0}]
    }
  },
  "Calculate Offset": {
    "main": {
      "0": [
        {"node": "Slice Data", "type": "main", "index": 0},
        {"node": "Calculate Total Pages", "type": "main", "index": 0}
      ]
    }
  },
  "Slice Data": {
    "main": {
      "0": [{"node": "Return Paginated", "type": "main", "index": 0}]
    }
  },
  "Calculate Total Pages": {
    "main": {
      "0": [{"node": "Return Paginated", "type": "main", "index": 0}]
    }
  }
}
```

**Fix Time**: 10-15 minutes per file (depends on complexity)
**Total Time**: 48 minutes for all 4 files

---

## Additional Issues (Important)

### Issue #4: ACL Variable Reference Bug

**File**: `fetch-data.json`
**Node**: `apply_user_acl` (line 120)
**Severity**: 🔴 HIGH (will cause reference error)

#### Current State (WRONG)
```json
{
  "id": "apply_user_acl",
  "name": "Apply User ACL",
  "type": "metabuilder.condition",
  "typeVersion": 1,
  "position": [100, 500],
  "parameters": {
    "condition": "{{ $context.user.level >= 3 || $build_filter.output.filters.userId === $context.user.id }}"
  }
}
```

#### Required State (CORRECT)
```json
{
  "id": "apply_user_acl",
  "name": "Apply User ACL",
  "type": "metabuilder.condition",
  "typeVersion": 1,
  "position": [100, 500],
  "parameters": {
    "condition": "{{ $context.user.level >= 3 || $steps.build_filter.output.filters.userId === $context.user.id }}"
  }
}
```

**Change**: `$build_filter` → `$steps.build_filter`
**Fix Time**: 1 minute

---

### Issue #5: No Error Handling

**Severity**: ⚠️ MEDIUM
**Affected**: All 4 workflows
**Missing**: Error routes, fallback handlers, error responses

#### Recommended Additions

For each workflow, add error response nodes:

```json
{
  "id": "error_handler",
  "name": "Handle Error",
  "type": "metabuilder.action",
  "typeVersion": 1,
  "position": [800, 800],
  "parameters": {
    "action": "http_response",
    "status": 400,
    "body": "{{ { error: 'Workflow failed', details: $error } }}"
  }
}
```

And connect condition nodes to error handler with "1" (false) branch.

**Fix Time**: 15-20 minutes per file
**Total Time**: 60-80 minutes for all 4 files (Phase 2)

---

## Updated JSON Examples

### sorting.json (COMPLETE CORRECTED VERSION)

```json
{
  "name": "Handle Data Table Sorting",
  "active": false,
  "nodes": [
    {
      "id": "extract_sort_params",
      "name": "Extract Sort Parameters",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {
        "input": "{{ $json }}",
        "output": {
          "sortBy": "{{ $json.sortBy || 'createdAt' }}",
          "sortOrder": "{{ $json.sortOrder || 'desc' }}"
        },
        "operation": "transform_data"
      }
    },
    {
      "id": "validate_sort_fields",
      "name": "Validate Sort Fields",
      "type": "metabuilder.condition",
      "typeVersion": 1,
      "position": [400, 100],
      "parameters": {
        "condition": "{{ ['id', 'name', 'email', 'createdAt', 'updatedAt', 'status'].includes($steps.extract_sort_params.output.sortBy) }}",
        "operation": "condition"
      }
    },
    {
      "id": "apply_sort",
      "name": "Apply Sort",
      "type": "metabuilder.transform",
      "typeVersion": 1,
      "position": [700, 100],
      "parameters": {
        "input": "{{ $json.data }}",
        "output": "{{ $json.data.sort((a, b) => { const aVal = a[$steps.extract_sort_params.output.sortBy]; const bVal = b[$steps.extract_sort_params.output.sortBy]; if ($steps.extract_sort_params.output.sortOrder === 'asc') return aVal > bVal ? 1 : -1; return aVal < bVal ? 1 : -1; }) }}",
        "operation": "transform_data"
      }
    },
    {
      "id": "return_sorted",
      "name": "Return Sorted",
      "type": "metabuilder.action",
      "typeVersion": 1,
      "position": [100, 300],
      "parameters": {
        "data": {
          "sortBy": "{{ $steps.extract_sort_params.output.sortBy }}",
          "sortOrder": "{{ $steps.extract_sort_params.output.sortOrder }}",
          "data": "{{ $steps.apply_sort.output }}"
        },
        "action": "emit_event",
        "event": "data_sorted"
      }
    }
  ],
  "connections": {
    "Extract Sort Parameters": {
      "main": {
        "0": [{"node": "Validate Sort Fields", "type": "main", "index": 0}]
      }
    },
    "Validate Sort Fields": {
      "main": {
        "0": [{"node": "Apply Sort", "type": "main", "index": 0}],
        "1": [{"node": "Apply Sort", "type": "main", "index": 0}]
      }
    },
    "Apply Sort": {
      "main": {
        "0": [{"node": "Return Sorted", "type": "main", "index": 0}]
      }
    }
  },
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

### filtering.json (PARTIAL CORRECTION - Connections Only)

The filtering.json already has all required node properties (`name` and `typeVersion`). Only the connections object needs to be populated:

```json
"connections": {
  "Validate Context": {
    "main": {
      "0": [{"node": "Extract Filters", "type": "main", "index": 0}],
      "1": [{"node": "Extract Filters", "type": "main", "index": 0}]
    }
  },
  "Extract Filters": {
    "main": {
      "0": [
        {"node": "Apply Status Filter", "type": "main", "index": 0},
        {"node": "Apply Search Filter", "type": "main", "index": 0},
        {"node": "Apply Date Filter", "type": "main", "index": 0}
      ]
    }
  },
  "Apply Status Filter": {
    "main": {
      "0": [{"node": "Filter Data", "type": "main", "index": 0}],
      "1": [{"node": "Filter Data", "type": "main", "index": 0}]
    }
  },
  "Apply Search Filter": {
    "main": {
      "0": [{"node": "Filter Data", "type": "main", "index": 0}],
      "1": [{"node": "Filter Data", "type": "main", "index": 0}]
    }
  },
  "Apply Date Filter": {
    "main": {
      "0": [{"node": "Filter Data", "type": "main", "index": 0}],
      "1": [{"node": "Filter Data", "type": "main", "index": 0}]
    }
  },
  "Filter Data": {
    "main": {
      "0": [{"node": "Return Filtered", "type": "main", "index": 0}]
    }
  }
}
```

### fetch-data.json (KEY CHANGES)

Two critical fixes needed:

**1. Fix line 7 - Update node names** (Already correct in current version!)

**2. Fix line 120 - ACL variable reference**

```json
// CURRENT (WRONG)
"condition": "{{ $context.user.level >= 3 || $build_filter.output.filters.userId === $context.user.id }}"

// CORRECT
"condition": "{{ $context.user.level >= 3 || $steps.build_filter.output.filters.userId === $context.user.id }}"
```

**3. Add connections object** - See section above

### pagination.json (PARTIAL CORRECTION - Connections Only)

The pagination.json already has all required node properties. Only add connections:

```json
"connections": {
  "Extract Pagination Params": {
    "main": {
      "0": [{"node": "Calculate Offset", "type": "main", "index": 0}]
    }
  },
  "Calculate Offset": {
    "main": {
      "0": [
        {"node": "Slice Data", "type": "main", "index": 0},
        {"node": "Calculate Total Pages", "type": "main", "index": 0}
      ]
    }
  },
  "Slice Data": {
    "main": {
      "0": [{"node": "Return Paginated", "type": "main", "index": 0}]
    }
  },
  "Calculate Total Pages": {
    "main": {
      "0": [{"node": "Return Paginated", "type": "main", "index": 0}]
    }
  }
}
```

---

## Validation Checklist

### Pre-Implementation Checklist

- [ ] Read this entire update plan
- [ ] Review current workflow files
- [ ] Backup original files: `git checkout -b data-table-compliance-fix`
- [ ] Create issue/task tracker for each file
- [ ] Assign reviewers for validation

### Implementation Checklist (Per File)

#### sorting.json
- [ ] Verify all 4 nodes have `name` property
- [ ] Verify all 4 nodes have `typeVersion: 1`
- [ ] Add connections object with 3 connections (linear flow)
- [ ] Test node naming convention (Extract Sort Params, etc.)
- [ ] Validate JSON syntax with `npm run build`

#### filtering.json
- [ ] Verify all 7 nodes have `name` property
- [ ] Verify all 7 nodes have `typeVersion: 1`
- [ ] Add connections object with 6 connections (branching flow)
- [ ] Verify conditional nodes have 2 outputs (true/false)
- [ ] Validate JSON syntax with `npm run build`

#### fetch-data.json
- [ ] Verify all 12 nodes have `name` property
- [ ] Verify all 12 nodes have `typeVersion: 1`
- [ ] Fix ACL variable reference: `$build_filter` → `$steps.build_filter`
- [ ] Add connections object with 11 connections (complex flow)
- [ ] Verify HTTP node (n8n-nodes-base.httpRequest) is correctly configured
- [ ] Validate JSON syntax with `npm run build`

#### pagination.json
- [ ] Verify all 5 nodes have `name` property
- [ ] Verify all 5 nodes have `typeVersion: 1`
- [ ] Add connections object with 4 connections (linear flow)
- [ ] Verify parallel nodes (Slice Data, Calculate Total Pages) both connect to Return
- [ ] Validate JSON syntax with `npm run build`

### Post-Implementation Validation

- [ ] All 4 files validate with JSON schema: `npm run build`
- [ ] No TypeScript compilation errors: `npm run typecheck`
- [ ] Run Python executor validation: `python -m workflow.executor.python.n8n_schema`
- [ ] Test with Python executor (if available)
- [ ] Compare updated files against original to confirm only structural changes
- [ ] Review with code reviewer
- [ ] Commit with message: "fix(data_table): add n8n schema compliance - names, typeVersion, connections"

### N8N Schema Compliance Verification

After implementation, validate with:

```python
# /workflow/executor/python/n8n_schema.py
from workflow.executor.python.n8n_schema import N8NNode, N8NWorkflow
import json

# Load and validate each workflow
with open('packages/data_table/workflow/sorting.json') as f:
    workflow = json.load(f)

# Validate all nodes
for node in workflow['nodes']:
    assert N8NNode.validate(node), f"Node {node['id']} invalid"

# Validate workflow structure
assert N8NWorkflow.validate(workflow), "Workflow structure invalid"

print("✅ All validations passed!")
```

---

## Implementation Timeline

### Phase 1: Critical Fixes (Blocking Issues) - ~1.5 hours

| Task | Duration | File(s) | Total |
|------|----------|---------|-------|
| Add `name` properties | 5 min | 4 | 20 min |
| Verify `typeVersion` | 2 min | 4 | 8 min |
| Define connections | 12 min | 4 | 48 min |
| Fix ACL bug | 1 min | fetch-data.json | 1 min |
| Validate syntax | 5 min | all | 5 min |
| **Phase 1 Total** | | | **82 minutes** |
| **Compliance Gain** | 28→70 | +42 points |

### Phase 2: Important Enhancements - ~1.5 hours (Optional)

| Task | Duration | File(s) | Total |
|------|----------|---------|-------|
| Add error handling nodes | 15 min | 4 | 60 min |
| Add error connections | 10 min | 4 | 40 min |
| Add node documentation | 5 min | 4 | 20 min |
| **Phase 2 Total** | | | **120 minutes** |
| **Compliance Gain** | 70→90 | +20 points |

### Phase 3: Polish (Optional) - ~30 minutes

| Task | Duration | File(s) | Total |
|------|----------|---------|-------|
| Add workflow metadata | 5 min | 4 | 20 min |
| Add trigger definitions | 5 min | 4 | 20 min |
| **Phase 3 Total** | | | **40 minutes** |
| **Compliance Gain** | 90→95 | +5 points |

---

## Critical Information About Current Workflows

### What's ALREADY Correct ✅

1. **Node Properties** (sorting.json, filtering.json, pagination.json)
   - Already have `name` property on all nodes
   - Already have `typeVersion: 1` on all nodes
   - Only connections are empty

2. **Node Properties** (fetch-data.json)
   - Already have `name` property on all 12 nodes
   - Already have `typeVersion: 1` on all 12 nodes
   - Only connections are empty (plus ACL bug fix)

3. **Position Properties**
   - All nodes have valid [x, y] coordinates
   - Grid layout is readable

4. **Parameter Structure**
   - Well-formatted with template expressions
   - Sound business logic

5. **Multi-Tenant Safety**
   - Tenant validation present (fetch-data.json)
   - User validation implemented
   - ACL enforcement attempted

### What NEEDS Fixing ❌

1. **Connections** (ALL 4 FILES)
   - Replace `"connections": {}` with proper n8n connection definitions
   - Define execution flow for each workflow

2. **ACL Bug** (fetch-data.json ONLY)
   - Line 120: `$build_filter` → `$steps.build_filter`

---

## Node Type Reference

### Custom MetaBuilder Types Used

```
metabuilder.transform  - Data transformation nodes
metabuilder.condition  - Conditional branching nodes
metabuilder.validate   - Input validation nodes
metabuilder.action     - Output/event emission nodes

n8n-nodes-base.httpRequest - Standard n8n HTTP request node (fetch-data.json)
```

All custom types require executor plugin support. Ensure plugins are registered in:
- `/workflow/executor/ts/registry/plugin-registry.ts`
- `/workflow/executor/python/plugins/`

---

## Security & Multi-Tenant Notes

### Tenant Filtering

All workflows properly filter by tenantId:
- `fetch-data.json`: Early validation of `$context.tenantId` ✅
- All HTTP requests include tenantId parameter ✅

### User ACL

Access control is implemented:
- `fetch-data.json`: ACL check for user level >= 3 ✅
- After fix: `$steps.build_filter.output.filters.userId` ✅

### Validation Safety

Multi-tenant validation is present:
- `validate_tenant_critical`: Ensures tenantId exists ✅
- `validate_user_critical`: Ensures userId exists ✅
- Error messages document safety requirements ✅

---

## Testing Strategy

### Unit Tests (Not applicable - workflows, not code)

### Integration Tests

1. **Syntax Validation**
   ```bash
   npm run build  # Should pass with no JSON errors
   ```

2. **Python Executor Validation**
   ```python
   python -c "
   from workflow.executor.python.n8n_schema import N8NWorkflow
   import json

   with open('packages/data_table/workflow/sorting.json') as f:
       workflow = json.load(f)

   assert N8NWorkflow.validate(workflow)
   print('✅ sorting.json is compliant')
   "
   ```

3. **Execution Test** (if executor available)
   ```bash
   # Run workflow with test data
   npm run test:e2e  # Should include data_table workflow tests
   ```

### Regression Tests

1. Ensure business logic is unchanged
2. Verify node parameters are identical
3. Confirm positions and metadata match original
4. Validate multi-tenant filtering still works

---

## Related Documentation

- **Full Compliance Audit**: `/docs/DATA_TABLE_N8N_COMPLIANCE_AUDIT.md`
- **Compliance Summary**: `/.claude/data-table-compliance-summary.md`
- **N8N Schema Reference**: `/workflow/executor/python/n8n_schema.py`
- **Python Executor Guide**: `/workflow/executor/python/README.md`
- **Workflow Best Practices**: `/docs/WORKFLOW_GUIDELINES.md`

---

## Success Criteria

### Phase 1 Success (Compliance Score: 28 → 70)
- [ ] All 28 nodes pass Python executor validation
- [ ] All 4 workflows have non-empty connections objects
- [ ] ACL bug fixed (if present)
- [ ] No JSON syntax errors
- [ ] Execution flows defined for all workflows

### Phase 2 Success (Compliance Score: 70 → 90)
- [ ] All error paths defined
- [ ] Error handling nodes added
- [ ] Error responses configured
- [ ] Node documentation added

### Phase 3 Success (Compliance Score: 90 → 95)
- [ ] Workflow metadata complete
- [ ] Trigger definitions added
- [ ] Advanced properties configured
- [ ] Ready for production deployment

---

## Rollback Plan

If issues occur during implementation:

```bash
# Revert to last known good version
git checkout HEAD -- packages/data_table/workflow/

# Or restore from backup
cp packages/data_table/workflow/*.json.bak packages/data_table/workflow/
```

---

## Questions & Clarifications

### Q: Why are typeVersion and name already present in current files?
A: The files appear to have been partially updated. Most nodes already have these properties. Only the connections object is empty.

### Q: What happens if connections are empty?
A: Workflows will either fail validation or only execute the first node, then stop. No execution flow is defined.

### Q: Is the ACL bug in current files?
A: Yes - `fetch-data.json` line 120 references `$build_filter` instead of `$steps.build_filter`.

### Q: Do we need to update anything besides connections?
A: In most files, only connections. In fetch-data.json, also fix the ACL variable reference.

### Q: What about error handling?
A: Not required for Phase 1 (basic compliance). Add in Phase 2 for production readiness.

### Q: Can we do a partial fix?
A: Yes. Phase 1 is minimum viable. Phases 2-3 are enhancements.

---

## References

- **N8N Workflow Format**: https://docs.n8n.io/workflows/
- **Python Executor**: `/workflow/executor/python/`
- **Data Table Package**: `/packages/data_table/`
- **Compliance Audit**: `/docs/DATA_TABLE_N8N_COMPLIANCE_AUDIT.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-22
**Status**: Ready for Implementation
**Owner**: Data Table Package Team
**Reviewers**: Workflow Team, Python Executor Team

