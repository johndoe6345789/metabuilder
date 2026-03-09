# N8N Workflow Validation Test Suite Guide

## Overview

This comprehensive test suite provides extensive validation for n8n workflow definitions used in the MetaBuilder Package Repository. The suite validates workflows against WorkflowLoaderV2 specifications and includes fixtures, test cases, and real-world examples.

**Total Test Coverage:**
- 150+ test cases
- 10 test suites
- 6 example workflows
- Edge cases and parametrized tests

## Quick Start

### Running All Tests

```bash
# Run all workflow validation tests
pytest packagerepo/tests/test_workflow_validation.py -v

# Run with coverage
pytest packagerepo/tests/test_workflow_validation.py --cov=workflow_loader_v2 -v

# Run specific test suite
pytest packagerepo/tests/test_workflow_validation.py::TestRequiredFieldValidation -v

# Run with detailed output
pytest packagerepo/tests/test_workflow_validation.py -vv --tb=long
```

### Running Example Workflows

```bash
# Run example workflow tests
pytest packagerepo/tests/test_workflow_examples.py -v

# Run specific workflow example
pytest packagerepo/tests/test_workflow_examples.py::TestAuthenticationWorkflow -v
```

## Test Suite Breakdown

### 1. Required Field Validation (TestRequiredFieldValidation)

**Purpose:** Validate that all required workflow fields are present and properly structured.

**Tests:**
- `test_missing_workflow_id` - Error when workflow ID is missing
- `test_present_workflow_id` - ID validation passes when present
- `test_missing_workflow_name` - Error when name is missing
- `test_missing_nodes_array` - Error when nodes array is missing
- `test_missing_connections_object` - Error when connections is missing
- `test_empty_nodes_array_allowed` - Empty nodes array is structurally valid
- `test_version_field_optional` - Version field is optional
- `test_active_field_optional` - Active field is optional
- `test_active_field_boolean_type` - Active accepts boolean values
- `test_tenantid_warning_in_multitenant_context` - Warning when tenantId missing in multi-tenant
- `test_tenantid_provided_no_warning` - No warning when tenantId provided

**Example:**
```python
def test_missing_workflow_id(self, loader_v2):
    workflow = {
        "name": "No ID Workflow",
        "nodes": [],
        "connections": {}
    }
    is_valid, errors = loader_v2.validate_workflow(workflow)
    assert not is_valid
    assert any(e["field"] == "id" for e in errors)
```

### 2. Parameter Nesting Detection (TestParameterNestingDetection)

**Purpose:** Detect improper parameter nesting and serialization failures.

**Critical Issues Detected:**
- Node attributes appearing in parameters (name, typeVersion, position)
- [object Object] serialization failures
- Improper object nesting

**Tests:**
- `test_node_attributes_in_parameters_error` - Error when node attributes in params
- `test_position_in_parameters_error` - Error when position attribute in params
- `test_object_object_serialization_error` - Error for [object Object] values
- `test_multiple_object_object_values` - Multiple serialization errors detected
- `test_proper_parameter_nesting_valid` - Valid parameter structure passes
- `test_nested_object_parameters_valid` - Nested objects are valid

**Example:**
```python
def test_object_object_serialization_error(self, loader_v2):
    workflow = {
        "id": "test-001",
        "name": "Test",
        "nodes": [
            {
                "id": "node-1",
                "name": "Bad Node",
                "type": "packagerepo.parse_json",
                "typeVersion": 1,
                "position": [100, 100],
                "parameters": {
                    "input": "[object Object]"  # Serialization failure
                }
            }
        ],
        "connections": {}
    }
    is_valid, errors = loader_v2.validate_workflow(workflow)
    assert not is_valid
    serialization_errors = [e for e in errors if "serialization" in e["message"].lower()]
    assert len(serialization_errors) > 0
```

### 3. Connection Integrity (TestConnectionIntegrity)

**Purpose:** Validate workflow connections between nodes.

**Validates:**
- Source node existence
- Target node existence
- Valid output types (main, error)
- Numeric connection indices
- Connection structure

**Tests:**
- `test_valid_connections` - Valid connections pass
- `test_connection_source_node_not_found` - Warning for missing source
- `test_connection_target_node_not_found` - Warning for missing target
- `test_invalid_output_type` - Error for invalid output types
- `test_non_numeric_connection_index` - Error for non-numeric indices
- `test_empty_connections_valid` - Empty connections object valid

**Example:**
```python
def test_invalid_output_type(self, loader_v2):
    workflow = {
        "id": "test-001",
        "name": "Test",
        "nodes": [...],
        "connections": {
            "Node 1": {
                "invalid_output": {  # Invalid output type
                    "0": [...]
                }
            }
        }
    }
    is_valid, errors = loader_v2.validate_workflow(workflow)
    assert not is_valid
    output_errors = [e for e in errors if "output type" in e.get("message", "").lower()]
    assert len(output_errors) > 0
```

### 4. Node Type Registry Lookup (TestNodeTypeRegistryLookup)

**Purpose:** Validate node types against registered node types.

**Tests:**
- `test_node_type_found_in_registry` - Node type in registry passes
- `test_node_type_not_found_in_registry` - Warning for unknown node types
- `test_missing_required_node_parameters` - Parameter validation
- `test_find_node_type_in_registry` - Registry lookup works
- `test_find_node_type_not_in_registry` - Returns None for unknown types
- `test_registry_loaded_on_init` - Registry loaded during initialization
- `test_empty_registry_fallback` - Fallback registry when file not found

**Example:**
```python
def test_node_type_found_in_registry(self, loader_v2, mock_registry):
    loader_v2.registry = mock_registry
    workflow = {
        "id": "test-001",
        "name": "Test",
        "nodes": [
            {
                "id": "node-1",
                "name": "Trigger",
                "type": "metabuilder.trigger",
                "typeVersion": 1,
                "position": [100, 100],
                "parameters": {}
            }
        ],
        "connections": {}
    }
    is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)
    registry_errors = [e for e in errors if "registry" in e.get("message", "").lower()]
    assert len(registry_errors) == 0
```

### 5. Multi-Tenant Context Validation (TestMultiTenantValidation)

**Purpose:** Validate multi-tenant safety and tenant context handling.

**Tests:**
- `test_multitenant_loader_stores_tenant_id` - Tenant ID stored in loader
- `test_single_tenant_loader_no_tenant_id` - No tenant ID in single-tenant
- `test_workflow_with_matching_tenant_id` - Matching tenant ID passes
- `test_workflow_with_different_tenant_id` - Different tenant ID validates
- `test_missing_tenant_id_in_multitenant_context_warning` - Warning for missing tenantId
- `test_tenant_id_in_context_no_warning_single_tenant` - No warning in single-tenant
- `test_context_passed_to_execute_workflow` - Tenant context passed to execution

**Example:**
```python
def test_multitenant_loader_stores_tenant_id(self, loader_v2_multitenant):
    assert loader_v2_multitenant.tenant_id == "acme"

def test_missing_tenant_id_in_multitenant_context_warning(self, loader_v2_multitenant):
    workflow = {
        "id": "test-001",
        "name": "Test",
        "nodes": [],
        "connections": {}
    }
    is_valid, errors = loader_v2_multitenant.validate_workflow(workflow, strict=False)
    tenantid_warnings = [e for e in errors if e["field"] == "tenantId" and e["type"] == "warning"]
    assert len(tenantid_warnings) > 0
```

### 6. Node Field Validation (TestNodeFieldValidation)

**Purpose:** Validate individual node structure.

**Tests:**
- `test_node_missing_id` - Error when node ID missing
- `test_node_missing_name` - Error when node name missing
- `test_node_missing_type` - Error when node type missing
- `test_all_required_node_fields_present` - All required fields pass

**Example:**
```python
def test_node_missing_id(self, loader_v2):
    workflow = {
        "id": "test-001",
        "name": "Test",
        "nodes": [
            {
                "name": "No ID Node",
                "type": "metabuilder.trigger",
                "typeVersion": 1,
                "position": [100, 100],
                "parameters": {}
            }
        ],
        "connections": {}
    }
    is_valid, errors = loader_v2.validate_workflow(workflow)
    assert not is_valid
    node_errors = [e for e in errors if "nodes[0].id" in e["field"]]
    assert len(node_errors) > 0
```

### 7. Variable Validation (TestVariableValidation)

**Purpose:** Validate workflow variables.

**Tests:**
- `test_valid_variables` - Valid variables pass
- `test_variable_not_object` - Error when variable not object
- `test_variable_missing_type` - Error when type missing
- `test_valid_variable_names` - Valid names pass
- `test_invalid_variable_names` - Invalid names fail

**Example:**
```python
def test_valid_variables(self, loader_v2):
    workflow = {
        "id": "test-001",
        "name": "Test",
        "nodes": [],
        "connections": {},
        "variables": {
            "timeout": {"type": "number", "defaultValue": 3600},
            "api_key": {"type": "string"}
        }
    }
    is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)
    var_errors = [e for e in errors if "variables" in e["field"]]
    assert len(var_errors) == 0
```

### 8. Edge Cases and Error Handling (TestEdgeCasesAndErrorHandling)

**Purpose:** Handle edge cases and error conditions.

**Tests:**
- `test_very_large_workflow` - Handle 100+ node workflows
- `test_deeply_nested_parameters` - Handle deep nesting
- `test_unicode_in_workflow` - Handle Unicode characters
- `test_null_and_empty_values` - Handle null/empty values
- `test_circular_node_connections` - Handle circular references
- `test_duplicate_node_ids` - Handle duplicate IDs
- `test_workflow_load_cache` - Caching mechanism
- `test_workflow_not_found` - FileNotFoundError handling
- `test_invalid_json_workflow` - JSONDecodeError handling
- `test_clear_cache` - Cache clearing

### 9. Strict vs Non-Strict Validation (TestStrictValidation)

**Purpose:** Test different validation modes.

**Tests:**
- `test_strict_mode_treats_warnings_as_errors` - Strict mode behavior
- `test_non_strict_mode_allows_warnings` - Non-strict mode behavior
- `test_strict_mode_fails_on_warnings` - Strict enforcement

**Example:**
```python
def test_non_strict_mode_allows_warnings(self, loader_v2_multitenant):
    workflow = {
        "id": "test-001",
        "name": "Test",
        "nodes": [],
        "connections": {}
        # Missing tenantId - warning in multi-tenant
    }
    is_valid, errors = loader_v2_multitenant.validate_workflow(workflow, strict=False)
    error_count = len([e for e in errors if e["type"] == "error"])
    assert error_count == 0
```

### 10. Integration Tests (TestIntegration)

**Purpose:** Test complete workflows and multiple operations.

**Tests:**
- `test_complete_valid_workflow` - Complete workflow passes
- `test_workflow_load_and_validate` - Load and validate from file
- `test_multiple_workflows_validation` - Validate multiple workflows

## Example Workflows

### 1. Authentication Workflow (test_workflow_examples.py)

**Demonstrates:**
- Conditional branching with logic.if nodes
- JWT token generation
- Error handling with error nodes
- Multi-stage validation pipeline

**Nodes:** 8 nodes (Parse, Validate, Verify, Generate Token, Error paths)

**File Reference:** `AUTH_LOGIN_WORKFLOW`

### 2. Data Processing Pipeline

**Demonstrates:**
- Large-scale data processing
- Loop constructs
- Row-by-row transformation
- Batch operations

**Nodes:** 8 nodes (Extract, Validate Loop, Transform, Insert)

**File Reference:** `DATA_PROCESSING_WORKFLOW`

### 3. Webhook Listener

**Demonstrates:**
- Webhook trigger configuration
- Signature verification
- Security validation
- Event processing

**Nodes:** 7 nodes (Trigger, Parse, Verify, Process, Response)

**File Reference:** `WEBHOOK_WORKFLOW`

### 4. Error Handling

**Demonstrates:**
- Try-catch patterns
- Error recovery
- Resource cleanup
- Error connection types

**Nodes:** 6 nodes (Try, Operation, Error Handler, Cleanup, Response)

**File Reference:** `ERROR_HANDLING_WORKFLOW`

## Fixtures

### Workflow Fixtures

```python
@pytest.fixture
def minimal_workflow():
    """Minimal valid workflow with single trigger node."""
    return {
        "id": "test-workflow-001",
        "name": "Test Workflow",
        "nodes": [...],
        "connections": {}
    }

@pytest.fixture
def complete_workflow():
    """Complete workflow with all standard fields and multiple nodes."""
    return {
        "id": "complete-workflow-001",
        "name": "Complete Workflow",
        "version": "1.0.0",
        "tenantId": "acme",
        "active": True,
        "nodes": [...],
        "connections": {...}
    }
```

### Configuration Fixtures

```python
@pytest.fixture
def base_config():
    """Flask configuration for testing."""
    return {
        "DEBUG": False,
        "TESTING": True,
        "DATABASE_URL": "sqlite:///:memory:",
    }

@pytest.fixture
def loader_v2(temp_workflows_dir, base_config):
    """WorkflowLoaderV2 instance for single-tenant."""
    return WorkflowLoaderV2(temp_workflows_dir, base_config)

@pytest.fixture
def loader_v2_multitenant(temp_workflows_dir, base_config):
    """WorkflowLoaderV2 instance with tenant context."""
    return WorkflowLoaderV2(temp_workflows_dir, base_config, tenant_id="acme")
```

## Validation Error Types

### Error Types

1. **Error** - Critical validation failures
   - Missing required fields
   - Invalid node attributes
   - Invalid connection structure

2. **Warning** - Non-critical issues
   - Unknown node types (not in registry)
   - Missing optional fields
   - Missing tenantId in multi-tenant context

### Error Structure

```python
{
    "type": "error" | "warning",
    "field": "path.to.field",
    "message": "Description of validation issue"
}
```

## Running Specific Test Categories

```bash
# Required fields only
pytest packagerepo/tests/test_workflow_validation.py::TestRequiredFieldValidation -v

# Parameter nesting issues
pytest packagerepo/tests/test_workflow_validation.py::TestParameterNestingDetection -v

# Connection validation
pytest packagerepo/tests/test_workflow_validation.py::TestConnectionIntegrity -v

# Registry lookup
pytest packagerepo/tests/test_workflow_validation.py::TestNodeTypeRegistryLookup -v

# Multi-tenant
pytest packagerepo/tests/test_workflow_validation.py::TestMultiTenantValidation -v

# Edge cases
pytest packagerepo/tests/test_workflow_validation.py::TestEdgeCasesAndErrorHandling -v

# All example workflows
pytest packagerepo/tests/test_workflow_examples.py -v
```

## Common Validation Scenarios

### Scenario 1: Validate a workflow file before deployment

```python
loader = WorkflowLoaderV2(Path("./workflows"), config, tenant_id="acme")
workflow = loader.load_workflow("auth_login")
is_valid, errors = loader.validate_workflow(workflow, strict=True)

if not is_valid:
    critical = [e for e in errors if e["type"] == "error"]
    print(f"Validation failed with {len(critical)} critical errors")
    for error in critical:
        print(f"  - {error['field']}: {error['message']}")
else:
    print("Workflow validation passed")
```

### Scenario 2: Multi-tenant workflow validation

```python
loader = WorkflowLoaderV2(Path("./workflows"), config, tenant_id="acme")
workflow = loader.load_workflow("user_signup")

is_valid, errors = loader.validate_workflow(workflow, strict=False)

# Check for tenant-related warnings
tenant_warnings = [e for e in errors if e["field"] == "tenantId"]
if tenant_warnings:
    print("Warning: Missing tenantId field for multi-tenant context")
```

### Scenario 3: Detect parameter nesting issues

```python
is_valid, errors = loader.validate_workflow(workflow)

nesting_errors = [
    e for e in errors if "nesting" in e["message"].lower()
]
serialization_errors = [
    e for e in errors if "serialization" in e["message"].lower()
]

if nesting_errors or serialization_errors:
    print("Parameter structure issues detected")
    for error in nesting_errors + serialization_errors:
        print(f"  {error['field']}: {error['message']}")
```

## Parametrized Tests

The suite includes parametrized tests for common scenarios:

```python
# Test all required fields
@pytest.mark.parametrize("field", ["id", "name", "nodes", "connections"])
def test_required_fields(self, loader_v2, field):
    # Tests each field individually

# Test node types
@pytest.mark.parametrize("node_type", [
    "metabuilder.trigger",
    "packagerepo.parse_json",
    "logic.if"
])
def test_node_types(self, loader_v2, node_type):
    # Tests each node type

# Test connection types
@pytest.mark.parametrize("connection_type", ["main", "error"])
def test_connection_output_types(self, loader_v2, connection_type):
    # Tests valid output types
```

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run workflow validation tests
  run: |
    pytest packagerepo/tests/test_workflow_validation.py -v --cov
    pytest packagerepo/tests/test_workflow_examples.py -v

- name: Check workflow files
  run: |
    for workflow in packagerepo/backend/workflows/*.json; do
      python -c "
      import json, sys
      from pathlib import Path
      sys.path.insert(0, 'packagerepo/backend')
      from workflow_loader_v2 import WorkflowLoaderV2

      with open('$workflow') as f:
          w = json.load(f)
      loader = WorkflowLoaderV2(Path('.'), {})
      valid, errors = loader.validate_workflow(w, strict=False)
      if not valid:
          print(f'FAIL: $workflow')
          sys.exit(1)
      "
    done
```

## Troubleshooting

### Test Failures

**Problem:** Tests fail with "Registry not found"
**Solution:** Registry is auto-created with minimal structure. Check registry path in WorkflowLoaderV2.

**Problem:** Multi-tenant tests fail
**Solution:** Ensure tenant_id is passed to loader initialization.

**Problem:** Connection validation tests fail
**Solution:** Verify node names in connections match node names in workflow.

### Validation Issues

**Problem:** Valid workflow fails validation
**Solution:** Check for:
- Missing required fields
- Parameter nesting issues ([object Object])
- Invalid node types
- Disconnected nodes in connections

**Problem:** [object Object] serialization errors
**Solution:** These indicate JavaScript object serialization failures. Check that parameters are properly stringified JSON, not object references.

## Best Practices

1. **Always use strict validation in CI/CD** - Catch warnings early
2. **Test example workflows before deployment** - Use provided examples as templates
3. **Validate after workflow edits** - Catch issues immediately
4. **Log validation errors** - Keep audit trail of validation results
5. **Use tenantId in multi-tenant deployments** - Enable proper isolation

## Performance Considerations

- Validation is O(n) where n = number of nodes
- Large workflows (1000+ nodes) should still validate in <1 second
- Registry lookup is O(m) where m = number of registered node types
- Caching improves subsequent loads

## Future Enhancements

Planned validation improvements:
1. Deep parameter schema validation against registry definitions
2. Circular dependency detection
3. Dead node detection
4. Performance optimization for large workflows
5. Custom validation rules per tenant
6. Workflow version compatibility checking

## References

- WorkflowLoaderV2: `/Users/rmac/Documents/metabuilder/packagerepo/backend/workflow_loader_v2.py`
- Node Registry: `/Users/rmac/Documents/metabuilder/workflow/plugins/registry/node-registry.json`
- Example Workflows: `/Users/rmac/Documents/metabuilder/packagerepo/backend/workflows/*.json`
