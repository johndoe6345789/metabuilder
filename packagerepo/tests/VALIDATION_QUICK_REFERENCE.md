# Workflow Validation Quick Reference

## Test Files Location

```
packagerepo/tests/
├── test_workflow_validation.py      # Main test suite (150+ tests)
├── test_workflow_examples.py        # Real-world examples
├── WORKFLOW_VALIDATION_GUIDE.md     # Complete guide
└── VALIDATION_QUICK_REFERENCE.md    # This file
```

## Quick Test Commands

```bash
# Run all workflow validation tests
pytest packagerepo/tests/test_workflow_validation.py -v

# Run with coverage report
pytest packagerepo/tests/test_workflow_validation.py --cov=workflow_loader_v2 -v

# Run specific test suite
pytest packagerepo/tests/test_workflow_validation.py::TestRequiredFieldValidation -v

# Run example workflows
pytest packagerepo/tests/test_workflow_examples.py -v

# Run with markers (if configured)
pytest -m "workflow" -v

# Run tests matching pattern
pytest packagerepo/tests/test_workflow_validation.py -k "required_field" -v
```

## Test Suite Quick Reference

| Test Suite | Tests | Focus | Key Methods |
|---|---|---|---|
| TestRequiredFieldValidation | 11 | id, name, nodes, connections, version, tenantId | validate_workflow() |
| TestParameterNestingDetection | 6 | Parameter structure, [object Object], nesting | _validate_node() |
| TestConnectionIntegrity | 6 | Connection structure, node references | _validate_connections() |
| TestNodeTypeRegistryLookup | 7 | Registry lookup, node types | _find_node_type_in_registry() |
| TestMultiTenantValidation | 7 | Tenant context, multi-tenant safety | tenant_id parameter |
| TestNodeFieldValidation | 4 | Node id, name, type | _validate_node() |
| TestVariableValidation | 5 | Variable structure, types | _validate_variables() |
| TestEdgeCasesAndErrorHandling | 10 | Large workflows, Unicode, caching | load_workflow() |
| TestStrictValidation | 3 | Strict vs non-strict modes | strict parameter |
| TestIntegration | 3 | End-to-end validation | Multiple methods |
| Parametrized Tests | 10+ | Multiple scenarios | Various |

## Validation Error Reference

### Critical Errors (type: "error")

```python
# Missing required field
{
    "type": "error",
    "field": "id",
    "message": "Workflow must have an id field"
}

# Parameter nesting issue
{
    "type": "error",
    "field": "nodes[0].parameters",
    "message": "Parameters contain node-level attributes (name/typeVersion/position). This indicates improper parameter nesting."
}

# Serialization failure
{
    "type": "error",
    "field": "nodes[0].parameters.input",
    "message": "Parameter 'input' has serialization failure: [object Object]"
}

# Invalid connection structure
{
    "type": "error",
    "field": "connections.Node1.invalid_output",
    "message": "Invalid output type 'invalid_output'. Must be 'main' or 'error'"
}
```

### Warnings (type: "warning")

```python
# Unknown node type
{
    "type": "warning",
    "field": "nodes[0].type",
    "message": "Node type 'unknown.node' not found in registry"
}

# Missing tenantId in multi-tenant context
{
    "type": "warning",
    "field": "tenantId",
    "message": "Workflow should include tenantId for multi-tenant isolation. Current tenant: acme"
}

# Missing node reference
{
    "type": "warning",
    "field": "connections.Node1",
    "message": "Connection source node 'Node1' not found in workflow nodes"
}
```

## Validation Methods

### Primary Method

```python
is_valid, errors = loader_v2.validate_workflow(
    workflow: Dict[str, Any],
    strict: bool = True
) -> Tuple[bool, List[Dict]]
```

**Parameters:**
- `workflow`: Workflow definition dictionary
- `strict`: If True, warnings are treated as errors

**Returns:**
- `is_valid`: Boolean validation result
- `errors`: List of error dictionaries

### Helper Methods

```python
# Load workflow from file
workflow = loader_v2.load_workflow(workflow_name: str)

# Find node type in registry
node_type = loader_v2._find_node_type_in_registry(node_type_name: str)

# Clear caches
loader_v2.clear_cache()
```

## Common Validation Patterns

### Pattern 1: Quick Validation Check

```python
from pathlib import Path
from workflow_loader_v2 import WorkflowLoaderV2

loader = WorkflowLoaderV2(Path("./workflows"), {})
workflow = loader.load_workflow("auth_login")
is_valid, errors = loader.validate_workflow(workflow, strict=False)

if is_valid:
    print("✓ Workflow is valid")
else:
    print("✗ Validation failed:")
    for error in errors:
        print(f"  {error['field']}: {error['message']}")
```

### Pattern 2: Categorize Errors

```python
is_valid, errors = loader.validate_workflow(workflow)

critical = [e for e in errors if e["type"] == "error"]
warnings = [e for e in errors if e["type"] == "warning"]

print(f"Critical errors: {len(critical)}")
print(f"Warnings: {len(warnings)}")

for error in critical:
    print(f"ERROR {error['field']}: {error['message']}")
```

### Pattern 3: Multi-Tenant Validation

```python
loader_mt = WorkflowLoaderV2(Path("./workflows"), {}, tenant_id="acme")
workflow = loader_mt.load_workflow("user_signup")
is_valid, errors = loader_mt.validate_workflow(workflow, strict=False)

tenant_issues = [e for e in errors if e["field"] == "tenantId"]
if tenant_issues:
    print("Multi-tenant validation warnings:")
    for issue in tenant_issues:
        print(f"  {issue['message']}")
```

### Pattern 4: Detect Parameter Issues

```python
is_valid, errors = loader.validate_workflow(workflow)

param_errors = [
    e for e in errors
    if "parameters" in e["field"] or "nesting" in e["message"].lower()
]

if param_errors:
    print("Parameter structure issues found:")
    for error in param_errors:
        print(f"  {error['field']}: {error['message']}")
```

## Fixture Quick Reference

### Creating a Loader Instance

```python
# Single-tenant loader
@pytest.fixture
def loader_v2(temp_workflows_dir, base_config):
    return WorkflowLoaderV2(temp_workflows_dir, base_config)

# Multi-tenant loader
@pytest.fixture
def loader_v2_multitenant(temp_workflows_dir, base_config):
    return WorkflowLoaderV2(temp_workflows_dir, base_config, tenant_id="acme")
```

### Using Fixtures in Tests

```python
def test_workflow_validation(loader_v2, minimal_workflow):
    """Test using provided fixtures."""
    is_valid, errors = loader_v2.validate_workflow(minimal_workflow)
    assert is_valid
```

## Minimal Workflow Template

```python
minimal_workflow = {
    "id": "my-workflow-001",
    "name": "My Workflow",
    "nodes": [
        {
            "id": "node-1",
            "name": "Start",
            "type": "metabuilder.trigger",
            "typeVersion": 1,
            "position": [100, 100],
            "parameters": {}
        }
    ],
    "connections": {}
}
```

## Valid Workflow Fields

### Required Fields
- `id` (string) - Unique workflow identifier
- `name` (string) - Human-readable name
- `nodes` (array) - Array of node objects
- `connections` (object) - Node connection mappings

### Optional Fields
- `version` (string) - Workflow version (e.g., "1.0.0")
- `tenantId` (string) - Multi-tenant context
- `active` (boolean) - Workflow active state
- `variables` (object) - Workflow variables
- `staticData` (object) - Static data storage
- `meta` (object) - Metadata
- `settings` (object) - Execution settings

## Node Structure

### Required Node Fields
- `id` (string) - Unique node identifier
- `name` (string) - Human-readable name
- `type` (string) - Node type (e.g., "metabuilder.trigger")
- `typeVersion` (number) - Node type version

### Optional Node Fields
- `position` (array) - [x, y] coordinates
- `parameters` (object) - Node-specific parameters

## Connection Structure

```python
connections = {
    "Source Node Name": {
        "main": {
            "0": [
                {
                    "node": "Target Node Name",
                    "type": "main",
                    "index": 0
                }
            ]
        },
        "error": {  # Optional error output
            "0": [...]
        }
    }
}
```

## Registry Node Types

Common node types in registry:

```
Core:
- metabuilder.trigger         # Workflow trigger

Transform:
- packagerepo.parse_json      # Parse JSON input
- transform.map              # Map transformation
- transform.extract          # Extract data
- transform.filter           # Filter items

Logic:
- logic.if                    # Conditional branching
- logic.loop                  # Iterate over array
- logic.switch               # Switch statement

Response:
- packagerepo.respond_json   # Send JSON response
- packagerepo.respond_error  # Send error response

Auth:
- packagerepo.auth_verify_password
- packagerepo.auth_generate_jwt
```

## Validation Checklist

Use this checklist before deploying workflows:

- [ ] Workflow has `id` field
- [ ] Workflow has `name` field
- [ ] All nodes have required fields (id, name, type)
- [ ] All node names are unique
- [ ] Connections reference existing nodes
- [ ] Connection types are 'main' or 'error'
- [ ] Connection indices are numeric
- [ ] Node parameters don't contain node attributes
- [ ] No [object Object] values in parameters
- [ ] Node types are valid (in registry or recognized)
- [ ] Variables have proper structure and types
- [ ] Multi-tenant: tenantId is present (if applicable)
- [ ] No circular dependencies (if applicable)
- [ ] Workflow passes strict validation: `loader.validate_workflow(w, strict=True)`

## Performance Tips

1. **Cache workflows** - Load once, validate multiple times
2. **Batch validate** - Process multiple workflows together
3. **Use non-strict for dev** - strict=False for faster iteration
4. **Clear cache periodically** - Call `loader.clear_cache()` when needed

## Debugging Tips

### Enable verbose output
```python
is_valid, errors = loader.validate_workflow(workflow)
for error in errors:
    print(f"[{error['type'].upper()}] {error['field']}")
    print(f"  Message: {error['message']}")
    print()
```

### Inspect specific field
```python
field_errors = [e for e in errors if e["field"] == "nodes[0].parameters"]
print(f"Parameter errors: {field_errors}")
```

### Check workflow structure
```python
import json
print(json.dumps(workflow, indent=2))
```

## Integration Example

```python
# Validate before saving
def save_workflow(workflow_data):
    loader = WorkflowLoaderV2(Path("./workflows"), config)
    is_valid, errors = loader.validate_workflow(workflow_data, strict=True)

    if not is_valid:
        raise ValueError(f"Invalid workflow: {errors}")

    # Save to file
    with open(f"./workflows/{workflow_data['id']}.json", "w") as f:
        json.dump(workflow_data, f)

    return {"ok": True, "id": workflow_data['id']}
```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "id field" error | Add `"id": "unique-id"` to workflow root |
| "nodes not found" in connections | Ensure connection node names match workflow node names exactly |
| [object Object] in parameters | Check for unserialized objects - stringify with JSON.stringify() |
| Unknown node type warning | Add node type to registry or ignore in non-strict mode |
| Missing tenantId warning (multi-tenant) | Add `"tenantId": "acme"` to workflow root |
| Parameter nesting error | Move node attributes (name, position, typeVersion) out of parameters |

## Running in CI/CD

```yaml
# GitHub Actions
- name: Validate workflows
  run: |
    pytest packagerepo/tests/test_workflow_validation.py \
      --cov=workflow_loader_v2 \
      -v \
      --tb=short
```

```bash
# Manual validation script
#!/bin/bash
for workflow in packagerepo/backend/workflows/*.json; do
    python -c "
    import json, sys
    from pathlib import Path
    sys.path.insert(0, 'packagerepo/backend')
    from workflow_loader_v2 import WorkflowLoaderV2

    with open('$workflow') as f:
        w = json.load(f)
    loader = WorkflowLoaderV2(Path('.'), {})
    valid, errors = loader.validate_workflow(w, strict=True)
    if not valid:
        print(f'FAIL: $workflow')
        for e in errors:
            print(f'  {e[\"field\"]}: {e[\"message\"]}')
        sys.exit(1)
    print(f'PASS: $workflow')
    "
done
```

## API Reference Quick Lookup

```python
class WorkflowLoaderV2:
    def __init__(
        self,
        workflows_dir: Path,
        config: Dict[str, Any],
        tenant_id: Optional[str] = None
    ) -> None

    def load_workflow(self, workflow_name: str) -> Dict[str, Any]

    def validate_workflow(
        self,
        workflow: Dict[str, Any],
        strict: bool = True
    ) -> Tuple[bool, List[Dict]]

    def clear_cache(self) -> None

    # Private helper methods
    def _validate_node(self, node: Dict[str, Any], index: int) -> List
    def _validate_connections(self, connections: Dict[str, Any], nodes: List) -> List
    def _validate_variables(self, variables: Dict[str, Any]) -> List
    def _validate_parameters(self, params: Dict, schema_props: List, field_path: str) -> List
    def _find_node_type_in_registry(self, node_type: str) -> Optional[Dict]
```

---

**Last Updated:** 2026-01-22
**Test Count:** 150+
**Coverage:** All major validation scenarios
**Status:** Production Ready
