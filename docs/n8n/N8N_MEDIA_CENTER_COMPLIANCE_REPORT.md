# N8N Compliance Audit: media_center Workflows

**Date**: 2026-01-22
**Analysis Scope**: `/Users/rmac/Documents/metabuilder/packages/media_center/workflow/`
**Files Analyzed**: 4 workflow files
**Overall Compliance Score**: 25/100 (CRITICAL - NON-COMPLIANT)

---

## Executive Summary

The `media_center` workflows contain **significant n8n compliance violations** that will cause the Python executor to fail. While the workflows demonstrate good architectural patterns (multi-tenant filtering, event emission, structured data transformation), they are **missing critical n8n schema properties** required for execution.

### Critical Findings

| Category | Status | Issues | Severity |
|----------|--------|--------|----------|
| **Node Structure** | 🔴 FAIL | Missing `name`, `typeVersion`, `position` on ALL nodes | BLOCKING |
| **Connections** | 🔴 FAIL | Empty connections object on ALL workflows | BLOCKING |
| **Custom Node Types** | ⚠️ WARN | Using `metabuilder.*` types (non-standard n8n) | ARCHITECTURAL |
| **Workflow Metadata** | ⚠️ WARN | Missing workflow-level `active`, `settings`, `meta` fields | NON-BLOCKING |
| **Business Logic** | ✅ PASS | Good multi-tenant patterns, event handling | EXCELLENT |

---

## Detailed Analysis by File

### 1. extract-image-metadata.json

**Status**: 🔴 NON-COMPLIANT (0% compliance)

#### Missing Properties (Critical)

**Workflow Level:**
```json
{
  "name": "Extract Image Metadata",
  "nodes": [...],
  "connections": {},          // ❌ EMPTY - should define execution order
  "active": false,             // ✅ Has (optional)
  "settings": {...},           // ✅ Has (optional)
  "meta": {}                   // ✅ Has (optional)
}
```

**Node Level (All 7 nodes):**
Each node is missing:
- ❌ `name`: "Validate Context" (used in connections)
- ❌ `typeVersion`: 1 (required by n8n)
- ❌ `position`: [100, 100] (visual layout)

#### Node-by-Node Issues

| Node ID | Name (MISSING) | Type | Type OK? | TypeVersion | Position | Parameters |
|---------|---|---|---|---|---|---|
| validate_context | Validate Context | metabuilder.validate | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |
| validate_input | Validate Input | metabuilder.validate | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |
| fetch_asset | Fetch Asset | metabuilder.database | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |
| extract_image_info | Extract Image Info | metabuilder.operation | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |
| calculate_dimensions | Calculate Dimensions | metabuilder.transform | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |
| update_asset_metadata | Update Asset Metadata | metabuilder.database | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |
| emit_complete | Emit Complete | metabuilder.action | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |
| return_success | Return Success | metabuilder.action | ⚠️ Custom | ❌ MISSING | ❌ MISSING | ✅ PASS |

#### Positive Aspects

✅ **Multi-tenant filtering**: `"tenantId": "{{ $context.tenantId }}"`
✅ **Structured parameters**: All nodes use clear operation + parameters pattern
✅ **Event emission**: Proper event publishing with tenant-scoped channels
✅ **Data transformation**: Clean pipeline from validate → extract → calculate → update
✅ **Metadata structure**: Good handling of image metadata (EXIF, dimensions, colorspace)

#### Expected Execution Path (Currently Broken)

```
validate_context
    ↓
validate_input
    ↓
fetch_asset (parallel check with validate_input)
    ↓
extract_image_info
    ↓
calculate_dimensions
    ↓
update_asset_metadata
    ↓
emit_complete & return_success (parallel)
```

**Problem**: Connections object is `{}`, so executor can't determine this order.

---

### 2. list-user-media.json

**Status**: 🔴 NON-COMPLIANT (0% compliance)

#### Missing Properties (Critical)

Same issues as above:
- ❌ All 9 nodes missing `name`, `typeVersion`, `position`
- ❌ `connections` is empty object `{}`

#### Node Count & Types

**9 nodes total:**

| Node ID | Type | Issue |
|---------|------|-------|
| validate_context | metabuilder.validate | Missing name, typeVersion, position |
| validate_user | metabuilder.validate | Missing name, typeVersion, position |
| extract_params | metabuilder.transform | Missing name, typeVersion, position |
| build_filter | metabuilder.transform | Missing name, typeVersion, position |
| clean_filter | metabuilder.transform | Missing name, typeVersion, position |
| fetch_media | metabuilder.database | Missing name, typeVersion, position |
| count_total | metabuilder.operation | Missing name, typeVersion, position |
| format_response | metabuilder.transform | Missing name, typeVersion, position |
| return_success | metabuilder.action | Missing name, typeVersion, position |

#### Positive Aspects

✅ **Pagination handling**: Proper limit/offset with hasMore calculation
✅ **Dynamic filtering**: Type-safe filter building with null-value cleanup
✅ **User filtering**: `"uploadedBy": "{{ $context.user.id }}"` - proper authorization
✅ **Sort parameters**: Supports custom sorting with ASC/DESC
✅ **Parallel counting**: Fetches media and count in parallel (would work if connections defined)

#### Complex Parameter Issues

**Line 99-100**: Sort parameter uses dynamic key construction
```json
"sort": {
  "{{ $steps.extract_params.output.sortBy }}": "{{ $steps.extract_params.output.sortOrder === 'asc' ? 1 : -1 }}"
}
```
⚠️ This is valid for the metabuilder platform but might be problematic in standard n8n (doesn't support templated keys).

---

### 3. delete-media.json

**Status**: 🔴 NON-COMPLIANT (15% partial credit for conditional logic)

#### Missing Properties

Same blocking issues:
- ❌ All 6 nodes missing `name`, `typeVersion`, `position`
- ❌ `connections` is empty object `{}`

#### Critical Bug: Malformed Paths

**Lines 64-66** - String interpolation syntax errors:
```json
"paths": [
  "{{ $steps.fetch_asset.output.path }}",
  "{{ $steps.fetch_asset.output.path }}-thumbnail }}",  // ❌ Extra closing braces
  "{{ $steps.fetch_asset.output.path }}-optimized }}"   // ❌ Extra closing braces
]
```

**Fix needed:**
```json
"paths": [
  "{{ $steps.fetch_asset.output.path }}",
  "{{ $steps.fetch_asset.output.path }}-thumbnail }}",
  "{{ $steps.fetch_asset.output.path }}-optimized }}"
]
```

#### Positive Aspects

✅ **Authorization check**: Conditional node with proper role validation
```json
"condition": "{{ $steps.fetch_asset.output.uploadedBy === $context.user.id || $context.user.level >= 3 }}"
```

✅ **Multi-step deletion**: Handles file cleanup + database deletion + event emission
✅ **Cascading deletion**: Removes main file + thumbnail + optimized variants
✅ **Event emission**: Publishes deletion event to tenant channel

#### Missing Connections Impact

The workflow should have:
```
validate_context
    ↓
fetch_asset
    ↓
check_authorization
    ├─[TRUE]→ delete_files → delete_asset_record → emit_deleted → return_success
    └─[FALSE]→ [error response needed]
```

Currently broken - no true/false branch handling.

---

### 4. extract-video-metadata.json

**Status**: 🔴 NON-COMPLIANT (0% compliance)

#### Missing Properties (Critical)

Same blocking issues across all 8 nodes:
- ❌ All nodes missing `name`, `typeVersion`, `position`
- ❌ `connections` is empty object `{}`

#### Node Structure

| Node ID | Type | Parameters Quality |
|---------|------|-------------------|
| validate_context | metabuilder.validate | ✅ GOOD |
| validate_input | metabuilder.validate | ✅ GOOD |
| fetch_asset | metabuilder.database | ✅ GOOD |
| extract_video_info | metabuilder.operation | ✅ GOOD |
| format_duration | metabuilder.transform | ✅ GOOD |
| update_asset_metadata | metabuilder.database | ✅ GOOD |
| emit_complete | metabuilder.action | ✅ GOOD |
| return_success | metabuilder.action | ✅ GOOD |

#### Positive Aspects

✅ **Complex duration formatting**: HH:MM:SS transformation with proper padding
```json
"formatted": "{{ Math.floor($steps.extract_video_info.output.duration / 3600) }}:{{ Math.floor(($steps.extract_video_info.output.duration % 3600) / 60).toString().padStart(2, '0') }}:..."
```

✅ **Nested metadata structure**: Proper organization of video properties
```json
"resolution": {
  "width": "{{ ... }}",
  "height": "{{ ... }}"
}
```

✅ **Multi-codec support**: Handles video/audio codec extraction
✅ **Timestamp tracking**: Records `extractedAt` for audit trail

---

## Architectural Notes

### Custom Node Types (⚠️ Important)

All workflows use custom `metabuilder.*` node types:

```
metabuilder.validate       → Custom validation node
metabuilder.database       → Custom DBAL wrapper
metabuilder.transform      → Custom data transform
metabuilder.operation      → Custom operation executor
metabuilder.action         → Custom action handler
metabuilder.condition      → Custom conditional logic
```

**Status**: These are NOT standard n8n node types. The Python executor needs a plugin/node factory that handles these types. Currently missing from n8n's built-in nodes.

**Solution Options**:
1. Create `metabuilder` plugin package for n8n
2. Map to standard n8n types (Function, HTTP, etc.)
3. Extend Python executor to handle custom types
4. Use JSONScript v2.2.0 specification if available

---

## Compliance Score Breakdown

### Scoring Methodology

| Category | Max | Score | % |
|----------|-----|-------|---|
| Blocking Issues (Critical) | 50 | 0 | 0% |
| - Workflow connections structure | 20 | 0 | - |
| - Node name property | 15 | 0 | - |
| - Node typeVersion property | 15 | 0 | - |
| Important Issues (High) | 30 | 5 | 17% |
| - Node position property | 10 | 0 | - |
| - Workflow-level configuration | 20 | 5 | - |
| Non-blocking Issues (Low) | 20 | 20 | 100% |
| - Custom node types (architectural) | 10 | 5 | - |
| - Parameter quality | 10 | 10 | - |
| - Multi-tenant patterns | 0 | 0 | - |

**Final Score: (0 + 5 + 20) / 100 = 25/100**

---

## Fix Priority Matrix

### Priority 1: BLOCKING (Must Fix)
**Prevents execution entirely**

| Item | Impact | Effort | Time |
|------|--------|--------|------|
| Add `name` to all nodes | BLOCKING | Trivial | 5 min |
| Add `typeVersion: 1` to all nodes | BLOCKING | Trivial | 2 min |
| Add `position` to all nodes | BLOCKING | Easy | 15 min |
| Define `connections` structure | BLOCKING | Medium | 30 min |
| Fix delete-media.json path syntax | BLOCKING | Trivial | 2 min |

**Total Time: ~55 minutes for all 4 files**

### Priority 2: HIGH (Should Fix)
**Improves reliability and compatibility**

| Item | Impact | Effort |
|------|--------|--------|
| Map `metabuilder.*` types to standard n8n types | ARCHITECTURAL | High |
| Add error handling branches for conditionals | ROBUSTNESS | Medium |
| Add retry logic to database operations | RELIABILITY | Medium |

### Priority 3: LOW (Nice to Have)
**Improves maintainability and UX**

| Item | Impact | Effort |
|------|--------|--------|
| Add `notes` field to each node | DOCUMENTATION | Low |
| Add `disabled` flags for testing | DEBUGGING | Low |
| Add `continueOnFail` handlers | ERROR_HANDLING | Low |

---

## Required Changes Template

### For All 4 Files:

```diff
{
  "name": "...",
  "nodes": [
    {
      "id": "validate_context",
+     "name": "Validate Context",        // ADD THIS
      "type": "metabuilder.validate",
+     "typeVersion": 1,                 // ADD THIS
+     "position": [100, 100],           // ADD THIS (modify x,y)
      "parameters": { ... }
    }
  ],
- "connections": {},
+ "connections": {
+   "Validate Context": {
+     "main": {
+       "0": [
+         { "node": "Validate Input", "type": "main", "index": 0 }
+       ]
+     }
+   }
+ }
}
```

### For delete-media.json Only:

```diff
"parameters": {
  "operation": "delete_recursive",
  "paths": [
    "{{ $steps.fetch_asset.output.path }}",
-   "{{ $steps.fetch_asset.output.path }}-thumbnail }}",
+   "{{ $steps.fetch_asset.output.path }}-thumbnail }}",
-   "{{ $steps.fetch_asset.output.path }}-optimized }}"
+   "{{ $steps.fetch_asset.output.path }}-optimized }}"
  ]
}
```

---

## Python Executor Failure Points

### 1. n8n_schema.py Validation

```python
class N8NNode:
    REQUIRED_FIELDS = ["id", "name", "type", "typeVersion", "position"]

    @staticmethod
    def validate(value: Any) -> bool:
        if not all(field in value for field in N8NNode.REQUIRED_FIELDS):
            return False  # ❌ WILL FAIL on ALL nodes
        return True
```

**Error**: `KeyError: 'name'` when trying to access node.name in execution_order.py

### 2. execution_order.py Build

```python
def build_execution_order(nodes, connections, start_node_id=None):
    node_names = {node["name"] for node in nodes}  # ❌ KeyError: 'name'

    if not connections:
        # ... sequential mode ...
```

**Error**: Cannot build execution order from empty connections

### 3. n8n_executor.py Connection Resolution

```python
def _find_node_by_name(self, nodes: List[Dict], name: str):
    for node in nodes:
        if node.get("name") == name:  # ❌ Never matches (no 'name' field)
            return node
    raise ValueError(f"Node '{name}' not found")
```

**Error**: `ValueError: Node 'Validate Context' not found` when resolving connections

---

## Recommendations

### Immediate Actions (Today)

1. **Generate missing node properties**
   - Write script to auto-generate `name` from `id` (snake_case → Title Case)
   - Add `typeVersion: 1` to all nodes
   - Generate `position` grid layout (auto-increment x by 200)

2. **Build connections structure**
   - For sequential workflows: each node → next node
   - For branching workflows (delete-media): handle true/false branches
   - Define proper n8n connection format

3. **Fix syntax errors**
   - Fix delete-media.json path templates
   - Validate all parameter expressions

### Short Term (This Week)

1. **Schema validation**
   - Create `schemas/workflow-schemas/n8n-media-workflows.json`
   - Add validation tests
   - Document compliance requirements

2. **Documentation**
   - Update `/docs/N8N_COMPLIANCE_AUDIT.md` with media_center results
   - Create n8n migration guide
   - Document custom node type mapping

3. **Testing**
   - Add E2E tests for workflow execution
   - Test with Python executor
   - Verify multi-tenant isolation

### Long Term (Phase 3)

1. **Plugin Architecture**
   - Create proper n8n plugin for `metabuilder.*` nodes
   - Register with n8n plugin registry
   - Support versioning for node types

2. **Tooling**
   - Build workflow validator in CI/CD
   - Create workflow migration script
   - Develop workflow visual editor

---

## Summary Statistics

### Workflows Analyzed: 4

**Compliance Status**:
- 🔴 Non-Compliant: 4/4 (100%)
- ⚠️ Partially Compliant: 0/4 (0%)
- ✅ Compliant: 0/4 (0%)

### Nodes Analyzed: 30 total

**Node Property Issues**:
- Missing `name`: 30/30 (100%)
- Missing `typeVersion`: 30/30 (100%)
- Missing `position`: 30/30 (100%)
- Invalid `type`: 0/30 (0% - all custom types, not standard n8n)

**Critical Bugs**:
- Empty connections: 4/4 (100%)
- Malformed templates: 1/4 (25% - delete-media.json only)

---

## Conclusion

The media_center workflows demonstrate **excellent architectural patterns** (multi-tenant filtering, event handling, proper data transformation) but are **critically broken for n8n execution** due to missing schema properties.

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Architectural Quality** | ⭐⭐⭐⭐ | Good patterns, clean structure |
| **Business Logic** | ⭐⭐⭐⭐ | Well-designed operations |
| **N8N Compliance** | ⭐ | 25/100 - CRITICAL FAILURES |
| **Fixability** | ⭐⭐⭐⭐⭐ | All issues are additive, low risk |

**Estimated remediation time: 1-2 hours for all files + testing**

The fixes are straightforward and backwards-compatible. Once corrected, these workflows will be excellent examples of proper n8n compliance in MetaBuilder.
