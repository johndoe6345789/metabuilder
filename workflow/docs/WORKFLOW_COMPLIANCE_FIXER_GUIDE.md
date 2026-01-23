# N8N Workflow Compliance Fixer - Complete Guide

## Overview

The `workflow_compliance_fixer.py` script automatically fixes n8n workflow compliance issues across your MetaBuilder codebase. It can process workflows in:

- `packages/*/workflow/*.json`
- `gameengine/packages/*/workflow/*.json`
- `packagerepo/backend/workflows/*.json`

## Features

### 1. Automatic Field Addition
- **ID Field**: Generates unique workflow IDs from filenames
- **Version Field**: Adds `3.0.0` (n8n v1.0+ standard)
- **TenantId Field**: Adds `${TENANT_ID}` for multi-tenant support
- **Active Field**: Adds `true` to activate workflows by default

### 2. Issue Detection
- **Missing required fields** (name, nodes, connections)
- **Malformed JSON structures**
- **Object serialization errors** (`[object Object]` in connections)
- **Nested parameter violations** (node-level fields in parameters)
- **Invalid node references** in connections
- **Type validation** (ID format, name length, position arrays)
- **TypeVersion validation** (must be integer >= 1)

### 3. Comprehensive Validation
- Validates node IDs against regex pattern `^[a-zA-Z_][a-zA-Z0-9_]*$`
- Checks position arrays are `[x, y]` format
- Validates all connection targets exist
- Detects circular references and dangling connections
- Verifies name lengths (1-255 characters)

### 4. Error Recovery
- Graceful handling of malformed JSON
- Detailed error messages with line context
- Non-destructive validation (dry-run mode)
- Automatic backup through git before modifications

## Installation

### Requirements
- Python 3.8+
- Standard library only (json, pathlib, logging, etc.)

### Setup
```bash
# Copy the script to your project root
cp workflow_compliance_fixer.py /path/to/metabuilder/

# Make it executable
chmod +x workflow_compliance_fixer.py

# Verify it works
python workflow_compliance_fixer.py --help
```

## Usage

### Basic Usage

#### 1. Dry Run (No Changes)
```bash
# See what would be fixed without modifying any files
python workflow_compliance_fixer.py . --dry-run
```

#### 2. Fix All Issues Automatically
```bash
# Process and fix all workflow files
python workflow_compliance_fixer.py .
```

#### 3. Report Only (No Fixes)
```bash
# Detect issues but don't apply fixes
python workflow_compliance_fixer.py . --no-fix
```

#### 4. Process Specific Directory
```bash
# Only process gameengine workflows
python workflow_compliance_fixer.py gameengine/

# Only process packagerepo workflows
python workflow_compliance_fixer.py packagerepo/
```

### Advanced Options

#### Verbose Output
```bash
# Show detailed debugging information
python workflow_compliance_fixer.py . -v
```

#### Generate Report File
```bash
# Save detailed report to file
python workflow_compliance_fixer.py . --report compliance_report.txt
```

#### Combined Options
```bash
# Dry run with verbose output and saved report
python workflow_compliance_fixer.py . --dry-run -v --report report.txt
```

## Output

### Console Report

The script generates a detailed report showing:

```
================================================================================
N8N WORKFLOW COMPLIANCE REPORT
================================================================================

SUMMARY
--------------------------------------------------------------------------------
Timestamp:        2026-01-22T14:30:45.123456
Total Files:      15
Successful:       12
Failed:           3
Success Rate:     80.0%
Files Modified:   10

ISSUES
--------------------------------------------------------------------------------
Total Found:      28
Total Fixed:      25

By Severity:
  Critical: 3
  Warning: 18
  Info: 7

By Type:
  missing_workflow_id: 5
  missing_tenantId: 5
  missing_version: 5
  missing_active_field: 8
  object_serialization_in_connections: 2
  invalid_connection_source: 2
  invalid_connection_target: 1

FILE RESULTS
--------------------------------------------------------------------------------
PASS packagerepo/backend/workflows/server.json [MODIFIED]
  Issues: 5
    - [warning] missing_workflow_id: Missing workflow-level id field
    - [warning] missing_version: Missing version field (should be 3.0.0 for n8n v1.0+)
    - [warning] missing_tenantId: Missing tenantId field (should be ${TENANT_ID} for multi-tenant systems)
    - [info] missing_active_field: Missing active field (defaults to true)
    - [critical] object_serialization_in_connections: Found serialized object in connections for source "Create App"
  Fixes Applied: 5
    ✓ add_workflow_id: Added workflow id: workflow_server
    ✓ add_version: Added version field: 3.0.0
    ✓ add_tenantId: Added tenantId field: ${TENANT_ID}
    ✓ add_active_field: Added active field: true
    ✓ fix_serialization_error: Fixed serialized object in connections

FAIL gameengine/packages/bootstrap/workflows/frame_default.json
  Issues: 2
    - [critical] invalid_connection_target: Connection target "Unknown Node" does not exist in nodes
    - [critical] missing_node_field: Node 2 missing required field: position
  Errors:
    ✗ Critical: Connection target "Unknown Node" does not exist in nodes

================================================================================
```

### Report File

When using `--report`, the complete report is saved to a file for reference and tracking.

## Compliance Rules

### Required Root Fields
1. **name** (string): Display name of the workflow
2. **nodes** (array): Array of at least 1 node object
3. **connections** (object): Connection map between nodes

### Recommended Root Fields
1. **id** (string): Unique workflow identifier
   - Generated format: `workflow_` + filename
   - Pattern: `^[a-zA-Z_][a-zA-Z0-9_]*$`
   - Example: `workflow_auth_login`

2. **version** (string): Workflow version
   - Standard: `3.0.0` (for n8n v1.0+)
   - Enables versioning and tracking

3. **tenantId** (string): Tenant identifier for multi-tenant systems
   - Standard: `${TENANT_ID}` (variable reference)
   - Enables multi-tenant isolation

4. **active** (boolean): Whether workflow is enabled
   - Standard: `true`
   - Set to false to disable without deleting

### Required Node Fields
1. **id** (string): Unique node identifier
   - Pattern: `^[a-zA-Z_][a-zA-Z0-9_]*$`
   - Example: `parse_body`, `validate_fields`

2. **name** (string): Display name (1-255 characters)
   - Example: "Parse Body", "Validate Fields"

3. **type** (string): Node type identifier
   - Pattern: `^[\w\.\-]+$`
   - Example: `packagerepo.parse_json`, `logic.if`

4. **typeVersion** (integer): Node type version
   - Minimum: 1
   - Current standard: 1

5. **position** (array): Canvas position [x, y]
   - Format: `[number, number]`
   - Example: `[100, 100]`

### Node Parameter Rules

**Do NOT put node-level fields in parameters:**
```json
{
  "id": "node_1",
  "name": "My Node",
  "type": "custom.type",
  "typeVersion": 1,
  "position": [0, 0],
  "parameters": {
    "inputValue": "some_value",
    "outputKey": "result"
    // ❌ DON'T DO THIS:
    // "id": "wrong_id",
    // "type": "wrong_type"
  }
}
```

### Connection Format

n8n uses a connection adjacency map:

```json
{
  "connections": {
    "Node Name": {
      "main": {
        "0": [
          { "node": "Next Node Name", "type": "main", "index": 0 }
        ]
      }
    }
  }
}
```

**Critical Rules:**
- Use node **name**, not id
- All target nodes must exist in the workflow
- No `[object Object]` string serialization
- Use "main" or "error" for output type
- Index must be non-negative integer

## Common Issues and Fixes

### Issue 1: Object Serialization Error

**Problem:**
```json
{
  "connections": {
    "Create App": {
      "main": {
        "0": [
          { "node": "[object Object]", "type": "main", "index": 0 }
        ]
      }
    }
  }
}
```

**Fix Applied:**
The script replaces `[object Object]` with a valid node name by:
1. Finding the first valid node in the workflow
2. Replacing the serialized object reference
3. Logging the fix for review

**Manual Verification Needed:** Review the connection to ensure it points to the correct target node.

### Issue 2: Missing Workflow ID

**Problem:**
```json
{
  "name": "Authenticate User",
  "nodes": [...]
}
```

**Fix Applied:**
```json
{
  "id": "workflow_auth_login",
  "name": "Authenticate User",
  "nodes": [...]
}
```

Generated from filename: `auth_login.json` → `workflow_auth_login`

### Issue 3: Nested Parameters

**Problem:**
```json
{
  "id": "parse_body",
  "name": "Parse Body",
  "type": "packagerepo.parse_json",
  "typeVersion": 1,
  "parameters": {
    "input": "$request.body",
    "type": "wrong_place"  // ❌ Node field in parameters
  }
}
```

**Fix Applied:**
Moves node-level fields to correct location:
```json
{
  "id": "parse_body",
  "name": "Parse Body",
  "type": "packagerepo.parse_json",  // ✅ Correct location
  "typeVersion": 1,
  "position": [100, 100],
  "parameters": {
    "input": "$request.body"
  }
}
```

### Issue 4: Invalid Connection Reference

**Problem:**
```json
{
  "connections": {
    "Parse Body": {
      "main": {
        "0": [
          { "node": "Nonexistent Node", "type": "main", "index": 0 }
        ]
      }
    }
  }
}
```

**Detection:**
```
[critical] invalid_connection_target: Connection target "Nonexistent Node" does not exist in nodes
```

**Manual Fix Required:** Update the connection target to match an actual node name.

## Workflow Examples

### Example 1: Minimal Compliant Workflow

```bash
# Create workflow
cat > my_workflow.json << 'EOF'
{
  "id": "workflow_minimal",
  "name": "Minimal Workflow",
  "version": "3.0.0",
  "tenantId": "${TENANT_ID}",
  "active": true,
  "nodes": [
    {
      "id": "step_1",
      "name": "Step 1",
      "type": "custom.action",
      "typeVersion": 1,
      "position": [0, 0],
      "parameters": {}
    }
  ],
  "connections": {}
}
EOF

# Verify compliance
python workflow_compliance_fixer.py . --no-fix
```

### Example 2: Fixing a Broken Workflow

```bash
# Start with broken workflow
cat > broken_workflow.json << 'EOF'
{
  "name": "Broken Workflow",
  "nodes": [
    {
      "id": "node_1",
      "name": "Action",
      "type": "custom.action",
      "parameters": {
        "typeVersion": 1,
        "position": [0, 0]
      }
    }
  ]
}
EOF

# Run fixer (reports what's wrong)
python workflow_compliance_fixer.py . --no-fix

# Fix automatically
python workflow_compliance_fixer.py .

# Verify result
cat broken_workflow.json | python -m json.tool | head -20
```

### Example 3: Batch Processing with Report

```bash
# Process entire gameengine directory
python workflow_compliance_fixer.py gameengine/ \
  --report gameengine_compliance_report.txt \
  -v

# Review the report
cat gameengine_compliance_report.txt

# Commit if satisfied
git add -A
git commit -m "fix(workflows): n8n compliance fixes

- Add missing workflow IDs
- Add version and tenantId fields
- Fix object serialization errors
- Validate all connections"
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Workflow Compliance Check

on: [pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Check workflow compliance
        run: |
          python workflow_compliance_fixer.py . \
            --no-fix \
            --report compliance_report.txt

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: compliance-report
          path: compliance_report.txt

      - name: Fail if critical issues
        run: |
          if grep -q "Failed:" compliance_report.txt; then
            echo "Critical compliance issues found!"
            cat compliance_report.txt
            exit 1
          fi
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

python workflow_compliance_fixer.py . \
  --no-fix \
  --report .git/workflow_compliance.txt

if [ $? -ne 0 ]; then
  echo "Workflow compliance issues detected!"
  cat .git/workflow_compliance.txt
  exit 1
fi
```

## Troubleshooting

### Issue: Script not finding workflow files

**Solution:**
```bash
# Check what files are found
python workflow_compliance_fixer.py . --no-fix -v

# Look for patterns in output
# "Processing packages/my_package/workflow/..."
```

### Issue: "Invalid JSON" errors

**Solution:**
```bash
# Validate JSON first
python -m json.tool < packages/my_package/workflow/workflow.json

# If that fails, check formatting
cat packages/my_package/workflow/workflow.json | head -10
```

### Issue: Changes look wrong in dry-run

**Solution:**
```bash
# Review the specific file
python workflow_compliance_fixer.py . --no-fix --verbose 2>&1 | grep "workflow_name"

# Check the actual file before changes
git show HEAD:packages/my_package/workflow/workflow.json | python -m json.tool
```

### Issue: Performance on large workflows

**Solution:**
```bash
# Process subdirectories separately
python workflow_compliance_fixer.py packages/ &
python workflow_compliance_fixer.py gameengine/packages/ &
wait

# Monitor progress with verbose mode
python workflow_compliance_fixer.py . -v 2>&1 | tee compliance.log
```

## API Usage

### Python Library Integration

```python
from workflow_compliance_fixer import N8NWorkflowCompliance
from pathlib import Path

# Initialize fixer
fixer = N8NWorkflowCompliance(
    base_path='/path/to/metabuilder',
    dry_run=False,
    auto_fix=True
)

# Process all workflows
results, summary = fixer.process_all_workflows()

# Examine results
for result in results:
    if not result.success:
        print(f"FAILED: {result.file_path}")
        for error in result.errors:
            print(f"  - {error}")

    if result.issues_fixed:
        print(f"Fixed {len(result.issues_fixed)} issues in {result.file_path}")

# Get summary statistics
print(f"Success rate: {summary['success_rate']}")
print(f"Total issues fixed: {summary['total_issues_fixed']}")
```

### Process Single File

```python
from pathlib import Path

fixer = N8NWorkflowCompliance('/path/to/metabuilder')
result = fixer.process_workflow_file(
    Path('/path/to/workflow.json')
)

if result.success:
    print(f"✓ {result.file_path} is compliant")
else:
    print(f"✗ {result.file_path} has {len(result.errors)} errors")
    for error in result.errors:
        print(f"  - {error}")
```

## Schema Validation

The fixer validates against n8n workflow schema constraints:

| Constraint | Rule | Example |
|-----------|------|---------|
| **ID Format** | `^[a-zA-Z_][a-zA-Z0-9_]*$` | `workflow_auth_login` |
| **Name Length** | 1-255 characters | "Authenticate User" |
| **Type Format** | `^[\w\.\-]+$` | `packagerepo.parse_json` |
| **TypeVersion** | Integer >= 1 | `1` |
| **Position** | `[number, number]` | `[100, 200]` |
| **Connection Node** | Must exist in nodes | Points to actual node |

## Best Practices

1. **Always do a dry-run first**
   ```bash
   python workflow_compliance_fixer.py . --dry-run --report preview.txt
   ```

2. **Review before committing**
   ```bash
   git diff --stat
   git diff packages/*/workflow/*.json | head -50
   ```

3. **Use verbose mode for debugging**
   ```bash
   python workflow_compliance_fixer.py . -v 2>&1 | grep ERROR
   ```

4. **Separate fixes by type**
   ```bash
   # First, just fix missing fields
   python workflow_compliance_fixer.py . --no-fix --report issues.txt
   # Review issues.txt
   # Then apply fixes
   python workflow_compliance_fixer.py .
   ```

5. **Keep audit trail**
   ```bash
   python workflow_compliance_fixer.py . --report compliance_$(date +%Y%m%d).txt
   ```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success - All files processed without critical issues |
| 1 | Failure - One or more files have critical issues |
| 130 | Interrupted - User pressed Ctrl+C |

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Run with `--verbose` flag for detailed output
3. Review the saved report file
4. Check git diff to see what changed

## Related Documentation

- **Workflow Engine**: `docs/workflow/`
- **Package System**: `docs/PACKAGES_INVENTORY.md`
- **Schema Reference**: `schemas/package-schemas/`
- **Multi-Tenant Guide**: `docs/MULTI_TENANT_AUDIT.md`

---

**Last Updated**: 2026-01-22
**Version**: 1.0.0
**Status**: Production Ready
