# Data Table Workflow Validation Checklist

**Purpose**: Step-by-step checklist for validating and updating the 4 data table workflows
**Target Compliance**: N8N Schema v1.0
**Effort Estimate**: 1.5-2 hours (Phase 1)
**Status**: Ready to implement

---

## Quick Start - 5 Minute Overview

### Current Issues (28/100 compliance)
- ❌ Missing `connections` definitions (4 workflows)
- ❌ ACL variable reference bug (fetch-data.json only)

### What's Already Fixed ✅
- ✅ All nodes have `name` property
- ✅ All nodes have `typeVersion: 1`
- ✅ All node parameters are correct

### What Needs Fixing (90 minutes)
1. Add connections to sorting.json (10 min)
2. Add connections to filtering.json (12 min)
3. Add connections to fetch-data.json + fix ACL bug (15 min)
4. Add connections to pagination.json (10 min)
5. Validate and test (15 min)

---

## Pre-Implementation

### [ ] 1. Review Documentation
- [ ] Read `DATA_TABLE_WORKFLOW_UPDATE_PLAN.md`
- [ ] Review `DATA_TABLE_WORKFLOW_JSON_EXAMPLES.md`
- [ ] Understand current audit: `DATA_TABLE_N8N_COMPLIANCE_AUDIT.md`

### [ ] 2. Prepare Environment
```bash
# Create feature branch
git checkout -b fix/data-table-n8n-compliance

# Verify no uncommitted changes
git status
```

### [ ] 3. Backup Original Files
```bash
# Backup before making changes
cp packages/data_table/workflow/sorting.json packages/data_table/workflow/sorting.json.bak
cp packages/data_table/workflow/filtering.json packages/data_table/workflow/filtering.json.bak
cp packages/data_table/workflow/fetch-data.json packages/data_table/workflow/fetch-data.json.bak
cp packages/data_table/workflow/pagination.json packages/data_table/workflow/pagination.json.bak
```

### [ ] 4. Understand Current Status

Run this to confirm current state:
```bash
# Check file sizes and node counts
wc -l packages/data_table/workflow/*.json

# Validate current JSON syntax
python3 -m json.tool packages/data_table/workflow/sorting.json > /dev/null && echo "✅ sorting.json syntax valid"
python3 -m json.tool packages/data_table/workflow/filtering.json > /dev/null && echo "✅ filtering.json syntax valid"
python3 -m json.tool packages/data_table/workflow/fetch-data.json > /dev/null && echo "✅ fetch-data.json syntax valid"
python3 -m json.tool packages/data_table/workflow/pagination.json > /dev/null && echo "✅ pagination.json syntax valid"
```

---

## File 1: sorting.json

### Overview
- **Nodes**: 4
- **Flow**: Linear (no branching)
- **Complexity**: Low
- **Estimated Time**: 10 minutes

### Checklist

#### Step 1: Verify Current Structure
- [ ] Open `packages/data_table/workflow/sorting.json`
- [ ] Confirm 4 nodes present:
  - [ ] `extract_sort_params`
  - [ ] `validate_sort_fields`
  - [ ] `apply_sort`
  - [ ] `return_sorted`
- [ ] Verify all nodes have `name` property: ✅
- [ ] Verify all nodes have `typeVersion: 1`: ✅
- [ ] Confirm connections is empty: `"connections": {}`

#### Step 2: Add Connections Object

Replace:
```json
"connections": {},
```

With:
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
},
```

#### Step 3: Validate JSON Syntax
```bash
python3 -m json.tool packages/data_table/workflow/sorting.json > /dev/null && echo "✅ sorting.json valid JSON"
```

- [ ] No syntax errors
- [ ] File parses successfully

#### Step 4: Verify All Node Names Match

Check each connection node name matches actual node names:
- [ ] "Extract Sort Params" matches node with id `extract_sort_params`
- [ ] "Validate Sort Fields" matches node with id `validate_sort_fields`
- [ ] "Apply Sort" matches node with id `apply_sort`
- [ ] "Return Sorted" matches node with id `return_sorted`

#### Step 5: Test with Python Validator (Optional)
```python
from workflow.executor.python.n8n_schema import N8NWorkflow
import json

with open('packages/data_table/workflow/sorting.json') as f:
    workflow = json.load(f)

if N8NWorkflow.validate(workflow):
    print("✅ sorting.json passes N8N validation")
else:
    print("❌ sorting.json fails validation")
```

- [ ] Validation passes

---

## File 2: filtering.json

### Overview
- **Nodes**: 7
- **Flow**: Branching (multiple filters)
- **Complexity**: Medium
- **Estimated Time**: 12 minutes

### Checklist

#### Step 1: Verify Current Structure
- [ ] Open `packages/data_table/workflow/filtering.json`
- [ ] Confirm 7 nodes present:
  - [ ] `validate_context`
  - [ ] `extract_filters`
  - [ ] `apply_status_filter`
  - [ ] `apply_search_filter`
  - [ ] `apply_date_filter`
  - [ ] `filter_data`
  - [ ] `return_filtered`
- [ ] Verify all nodes have `name` property: ✅
- [ ] Verify all nodes have `typeVersion: 1`: ✅
- [ ] Confirm connections is empty: `"connections": {}`

#### Step 2: Add Connections Object

Replace:
```json
"connections": {},
```

With (branching pattern):
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
},
```

#### Step 3: Validate JSON Syntax
```bash
python3 -m json.tool packages/data_table/workflow/filtering.json > /dev/null && echo "✅ filtering.json valid JSON"
```

- [ ] No syntax errors

#### Step 4: Verify All Node Names Match
- [ ] "Validate Context" ✓
- [ ] "Extract Filters" ✓
- [ ] "Apply Status Filter" ✓
- [ ] "Apply Search Filter" ✓
- [ ] "Apply Date Filter" ✓
- [ ] "Filter Data" ✓
- [ ] "Return Filtered" ✓

#### Step 5: Test with Python Validator (Optional)
```python
from workflow.executor.python.n8n_schema import N8NWorkflow
import json

with open('packages/data_table/workflow/filtering.json') as f:
    workflow = json.load(f)

if N8NWorkflow.validate(workflow):
    print("✅ filtering.json passes N8N validation")
else:
    print("❌ filtering.json fails validation")
```

- [ ] Validation passes

---

## File 3: fetch-data.json

### Overview
- **Nodes**: 12
- **Flow**: Complex with HTTP request
- **Complexity**: High
- **Estimated Time**: 15 minutes
- **Special**: Has ACL bug that must be fixed

### Checklist

#### Step 1: Verify Current Structure
- [ ] Open `packages/data_table/workflow/fetch-data.json`
- [ ] Confirm 12 nodes present:
  - [ ] `validate_tenant_critical`
  - [ ] `validate_user_critical`
  - [ ] `validate_input`
  - [ ] `extract_params`
  - [ ] `calculate_offset`
  - [ ] `build_filter`
  - [ ] `apply_user_acl`
  - [ ] `fetch_data`
  - [ ] `validate_response`
  - [ ] `parse_response`
  - [ ] `format_response`
  - [ ] `return_success`
- [ ] Verify all nodes have `name` property: ✅
- [ ] Verify all nodes have `typeVersion: 1`: ✅
- [ ] Confirm connections is empty: `"connections": {}`

#### Step 2: Fix ACL Variable Reference Bug

**CRITICAL**: Line 120 has a bug!

Find this (WRONG):
```json
"condition": "{{ $context.user.level >= 3 || $build_filter.output.filters.userId === $context.user.id }}"
```

Replace with (CORRECT):
```json
"condition": "{{ $context.user.level >= 3 || $steps.build_filter.output.filters.userId === $context.user.id }}"
```

**Change**: `$build_filter` → `$steps.build_filter`

- [ ] ACL bug found and documented
- [ ] ACL bug fixed
- [ ] Verification: Search file for `$build_filter` (should find 0 results now)

#### Step 3: Add Connections Object

Replace:
```json
"connections": {},
```

With (complex pattern):
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
      "0": [{"node": "Apply User Acl", "type": "main", "index": 0}]
    }
  },
  "Calculate Offset": {
    "main": {
      "0": [{"node": "Apply User Acl", "type": "main", "index": 0}]
    }
  },
  "Build Filter": {
    "main": {
      "0": [{"node": "Apply User Acl", "type": "main", "index": 0}]
    }
  },
  "Apply User Acl": {
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
},
```

#### Step 4: Validate JSON Syntax
```bash
python3 -m json.tool packages/data_table/workflow/fetch-data.json > /dev/null && echo "✅ fetch-data.json valid JSON"
```

- [ ] No syntax errors

#### Step 5: Verify All Node Names Match
- [ ] "Validate Tenant Critical" ✓
- [ ] "Validate User Critical" ✓
- [ ] "Validate Input" ✓
- [ ] "Extract Params" ✓
- [ ] "Calculate Offset" ✓
- [ ] "Build Filter" ✓
- [ ] "Apply User Acl" ✓ (note lowercase 'Acl')
- [ ] "Fetch Data" ✓
- [ ] "Validate Response" ✓
- [ ] "Parse Response" ✓
- [ ] "Format Response" ✓
- [ ] "Return Success" ✓

#### Step 6: Test with Python Validator (Optional)
```python
from workflow.executor.python.n8n_schema import N8NWorkflow
import json

with open('packages/data_table/workflow/fetch-data.json') as f:
    workflow = json.load(f)

if N8NWorkflow.validate(workflow):
    print("✅ fetch-data.json passes N8N validation")
else:
    print("❌ fetch-data.json fails validation")
```

- [ ] Validation passes

---

## File 4: pagination.json

### Overview
- **Nodes**: 5
- **Flow**: Linear with parallel branches
- **Complexity**: Low
- **Estimated Time**: 10 minutes

### Checklist

#### Step 1: Verify Current Structure
- [ ] Open `packages/data_table/workflow/pagination.json`
- [ ] Confirm 5 nodes present:
  - [ ] `extract_pagination_params`
  - [ ] `calculate_offset`
  - [ ] `slice_data`
  - [ ] `calculate_total_pages`
  - [ ] `return_paginated`
- [ ] Verify all nodes have `name` property: ✅
- [ ] Verify all nodes have `typeVersion: 1`: ✅
- [ ] Confirm connections is empty: `"connections": {}`

#### Step 2: Add Connections Object

Replace:
```json
"connections": {},
```

With (parallel branches):
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
},
```

#### Step 3: Validate JSON Syntax
```bash
python3 -m json.tool packages/data_table/workflow/pagination.json > /dev/null && echo "✅ pagination.json valid JSON"
```

- [ ] No syntax errors

#### Step 4: Verify All Node Names Match
- [ ] "Extract Pagination Params" ✓
- [ ] "Calculate Offset" ✓
- [ ] "Slice Data" ✓
- [ ] "Calculate Total Pages" ✓
- [ ] "Return Paginated" ✓

#### Step 5: Test with Python Validator (Optional)
```python
from workflow.executor.python.n8n_schema import N8NWorkflow
import json

with open('packages/data_table/workflow/pagination.json') as f:
    workflow = json.load(f)

if N8NWorkflow.validate(workflow):
    print("✅ pagination.json passes N8N validation")
else:
    print("❌ pagination.json fails validation")
```

- [ ] Validation passes

---

## Post-Implementation Validation

### Step 1: Syntax Validation (5 minutes)

```bash
# Test all files for valid JSON
for file in packages/data_table/workflow/*.json; do
  if python3 -m json.tool "$file" > /dev/null; then
    echo "✅ $(basename $file) - valid JSON"
  else
    echo "❌ $(basename $file) - INVALID JSON"
  fi
done
```

- [ ] sorting.json - valid JSON
- [ ] filtering.json - valid JSON
- [ ] fetch-data.json - valid JSON
- [ ] pagination.json - valid JSON

### Step 2: Node Property Validation (5 minutes)

```python
import json

def validate_all_workflows():
    files = [
        'packages/data_table/workflow/sorting.json',
        'packages/data_table/workflow/filtering.json',
        'packages/data_table/workflow/fetch-data.json',
        'packages/data_table/workflow/pagination.json'
    ]

    required_props = ["id", "name", "type", "typeVersion", "position"]
    all_valid = True

    for filepath in files:
        with open(filepath) as f:
            workflow = json.load(f)

        for node in workflow['nodes']:
            for prop in required_props:
                if prop not in node:
                    print(f"❌ {filepath} - Node {node['id']} missing {prop}")
                    all_valid = False

    if all_valid:
        print("✅ All nodes have required properties")
    else:
        print("❌ Some nodes missing properties")

    return all_valid

validate_all_workflows()
```

- [ ] All nodes have `id` property
- [ ] All nodes have `name` property
- [ ] All nodes have `type` property
- [ ] All nodes have `typeVersion` property
- [ ] All nodes have `position` property

### Step 3: Connections Validation (5 minutes)

```python
import json

def validate_connections():
    files = [
        'packages/data_table/workflow/sorting.json',
        'packages/data_table/workflow/filtering.json',
        'packages/data_table/workflow/fetch-data.json',
        'packages/data_table/workflow/pagination.json'
    ]

    for filepath in files:
        with open(filepath) as f:
            workflow = json.load(f)

        # Check connections not empty
        if not workflow['connections']:
            print(f"❌ {filepath} - connections is empty")
            continue

        # Check all referenced nodes exist
        node_names = {node['name'] for node in workflow['nodes']}

        all_valid = True
        for from_node, connections in workflow['connections'].items():
            if from_node not in node_names:
                print(f"❌ {filepath} - connection from unknown node: {from_node}")
                all_valid = False

            for main_conn in connections.get('main', {}).values():
                for to_conn in main_conn:
                    if to_conn['node'] not in node_names:
                        print(f"❌ {filepath} - connection to unknown node: {to_conn['node']}")
                        all_valid = False

        if all_valid:
            print(f"✅ {filepath} - all connections valid")

validate_connections()
```

- [ ] sorting.json - connections valid
- [ ] filtering.json - connections valid
- [ ] fetch-data.json - connections valid
- [ ] pagination.json - connections valid

### Step 4: Python Executor Validation (5 minutes)

```bash
# Run Python executor validation
python3 << 'EOF'
from workflow.executor.python.n8n_schema import N8NWorkflow, N8NNode
import json

files = [
    'packages/data_table/workflow/sorting.json',
    'packages/data_table/workflow/filtering.json',
    'packages/data_table/workflow/fetch-data.json',
    'packages/data_table/workflow/pagination.json'
]

for filepath in files:
    with open(filepath) as f:
        workflow = json.load(f)

    try:
        # Validate workflow structure
        if not N8NWorkflow.validate(workflow):
            print(f"❌ {filepath} - workflow validation failed")
            continue

        # Validate each node
        all_nodes_valid = True
        for node in workflow['nodes']:
            if not N8NNode.validate(node):
                print(f"❌ {filepath} - node {node['id']} validation failed")
                all_nodes_valid = False

        if all_nodes_valid:
            print(f"✅ {filepath} - all nodes pass validation")

    except Exception as e:
        print(f"❌ {filepath} - validation error: {e}")
EOF
```

- [ ] sorting.json - passes executor validation
- [ ] filtering.json - passes executor validation
- [ ] fetch-data.json - passes executor validation
- [ ] pagination.json - passes executor validation

### Step 5: Verify No Business Logic Changes

For each file, compare with backup:
```bash
# Show only differences
diff -u packages/data_table/workflow/sorting.json.bak packages/data_table/workflow/sorting.json | head -20
```

Expected: ONLY changes should be in `connections` object and ACL variable reference (fetch-data.json)

- [ ] sorting.json - only connections changed
- [ ] filtering.json - only connections changed
- [ ] fetch-data.json - only connections and ACL variable changed
- [ ] pagination.json - only connections changed
- [ ] No node logic was modified
- [ ] No node parameters were changed
- [ ] No node positions were changed

### Step 6: Final Verification

```bash
# Count connections before/after
echo "Before:" $(grep -o '"connections": {}' packages/data_table/workflow/*.json.bak | wc -l)
echo "After:" $(grep -c '"connections":' packages/data_table/workflow/*.json)

# Should show: Before: 4, After: 4 (all have connections now)
```

- [ ] All 4 files have connections object
- [ ] No empty connections objects remain

---

## Git Commit & Review

### Step 1: Prepare Commit

```bash
# Add updated files
git add packages/data_table/workflow/sorting.json
git add packages/data_table/workflow/filtering.json
git add packages/data_table/workflow/fetch-data.json
git add packages/data_table/workflow/pagination.json

# Review changes
git diff --cached
```

- [ ] Changes reviewed
- [ ] No unintended modifications

### Step 2: Create Commit

```bash
git commit -m "fix(data_table): add n8n schema compliance - populate connections and fix ACL reference

- Sort: Add 3 connections for linear execution flow
- Filter: Add 6 connections for branching filter logic
- Fetch: Add 11 connections for complex data fetch + fix ACL variable ref ($build_filter → $steps.build_filter)
- Pagination: Add 4 connections for parallel pagination logic

All 28 nodes now have required properties (id, name, type, typeVersion, position).
All 4 workflows have non-empty connections objects defining execution flow.
Compliance score: 28/100 → 70/100 (Blocking issues resolved).
"
```

- [ ] Commit created
- [ ] Commit message is clear and complete

### Step 3: Push Changes

```bash
git push -u origin fix/data-table-n8n-compliance
```

- [ ] Changes pushed to remote
- [ ] Can create Pull Request

---

## Troubleshooting

### JSON Syntax Error

**Error**: `json.decoder.JSONDecodeError: Expecting value`

**Fix**:
1. Check for missing commas in connections object
2. Check for trailing commas (not allowed in JSON)
3. Use JSON validator: `python3 -m json.tool file.json`

### Node Name Mismatch

**Error**: `connection to unknown node: NodeName`

**Fix**:
1. Verify node `name` property exactly matches connection reference
2. Check for capitalization differences
3. Check for extra spaces

### ACL Bug Not Fixed

**Error**: `$build_filter is not defined`

**Fix** (fetch-data.json only):
- Find: `"condition": "{{ $context.user.level >= 3 || $build_filter.output...`
- Replace: `"condition": "{{ $context.user.level >= 3 || $steps.build_filter.output...`

### Validation Fails

**Error**: `Node validation failed`

**Fix**:
1. Ensure all required properties are present: id, name, type, typeVersion, position
2. Check for typos in node names
3. Verify connections reference valid node names

---

## Success Criteria

### Phase 1 Complete When:
- [ ] All 4 files updated with connections
- [ ] All syntax validated
- [ ] No business logic changed
- [ ] ACL bug fixed (fetch-data.json)
- [ ] Commit created and pushed
- [ ] Code review approved

### Expected Compliance Improvement:
- **Before**: 28/100
- **After Phase 1**: 70/100
- **Improvement**: +42 points (blocking issues resolved)

---

## Related Documents

- **Update Plan**: `DATA_TABLE_WORKFLOW_UPDATE_PLAN.md`
- **JSON Examples**: `DATA_TABLE_WORKFLOW_JSON_EXAMPLES.md`
- **Full Audit**: `DATA_TABLE_N8N_COMPLIANCE_AUDIT.md`
- **Quick Reference**: `.claude/DATA_TABLE_AUDIT_QUICK_REFERENCE.txt`

---

**Checklist Version**: 1.0
**Last Updated**: 2026-01-22
**Status**: Ready to Use
**Owner**: Data Table Workflow Team

