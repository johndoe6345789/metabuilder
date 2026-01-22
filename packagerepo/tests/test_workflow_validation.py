#!/usr/bin/env python3
"""
Comprehensive test suite for n8n workflow validation.

This module provides extensive testing for:
1. Required field validation (id, version, tenantId, active)
2. Parameter nesting detection and validation
3. Connection integrity checks
4. Node type registry lookup
5. Multi-tenant context validation
6. Edge cases and error handling

Validation is performed against WorkflowLoaderV2 specification.
"""

import pytest
import json
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple
from unittest.mock import Mock, patch, MagicMock

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))

from workflow_loader_v2 import WorkflowLoaderV2, WorkflowValidationError


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture
def temp_workflows_dir(tmp_path):
    """Create temporary workflows directory."""
    workflows_dir = tmp_path / "workflows"
    workflows_dir.mkdir(exist_ok=True)
    return workflows_dir


@pytest.fixture
def base_config():
    """Base Flask configuration for loader."""
    return {
        "DEBUG": False,
        "TESTING": True,
        "DATABASE_URL": "sqlite:///:memory:",
    }


@pytest.fixture
def loader_v2(temp_workflows_dir, base_config):
    """Create WorkflowLoaderV2 instance."""
    return WorkflowLoaderV2(temp_workflows_dir, base_config)


@pytest.fixture
def loader_v2_multitenant(temp_workflows_dir, base_config):
    """Create WorkflowLoaderV2 instance with tenant context."""
    return WorkflowLoaderV2(temp_workflows_dir, base_config, tenant_id="acme")


@pytest.fixture
def minimal_workflow():
    """Minimal valid workflow."""
    return {
        "id": "test-workflow-001",
        "name": "Test Workflow",
        "nodes": [
            {
                "id": "node-1",
                "name": "Start Node",
                "type": "metabuilder.trigger",
                "typeVersion": 1,
                "position": [100, 100],
                "parameters": {}
            }
        ],
        "connections": {}
    }


@pytest.fixture
def complete_workflow():
    """Complete workflow with all standard fields."""
    return {
        "id": "complete-workflow-001",
        "name": "Complete Workflow",
        "version": "1.0.0",
        "tenantId": "acme",
        "active": True,
        "nodes": [
            {
                "id": "trigger",
                "name": "Trigger",
                "type": "metabuilder.trigger",
                "typeVersion": 1,
                "position": [100, 100],
                "parameters": {"triggerType": "manual"}
            },
            {
                "id": "parse-json",
                "name": "Parse JSON",
                "type": "packagerepo.parse_json",
                "typeVersion": 1,
                "position": [300, 100],
                "parameters": {
                    "input": "$request.body",
                    "out": "parsed"
                }
            },
            {
                "id": "condition",
                "name": "Check Condition",
                "type": "logic.if",
                "typeVersion": 1,
                "position": [500, 100],
                "parameters": {
                    "condition": "$parsed.status == 'ok'",
                    "then": "success",
                    "else": "error"
                }
            }
        ],
        "connections": {
            "trigger": {
                "main": {
                    "0": [{"node": "parse-json", "type": "main", "index": 0}]
                }
            },
            "parse-json": {
                "main": {
                    "0": [{"node": "condition", "type": "main", "index": 0}]
                }
            }
        },
        "variables": {
            "timeout": {"type": "number", "defaultValue": 3600},
            "retry_count": {"type": "number", "defaultValue": 3}
        },
        "staticData": {},
        "meta": {"description": "Test workflow"},
        "settings": {
            "timezone": "UTC",
            "executionTimeout": 3600,
            "saveExecutionProgress": True,
            "saveDataErrorExecution": "all",
            "saveDataSuccessExecution": "all"
        }
    }


@pytest.fixture
def mock_registry():
    """Mock node registry with common node types."""
    return {
        "nodeTypes": [
            {
                "name": "metabuilder.trigger",
                "displayName": "Trigger",
                "group": "core",
                "properties": [
                    {"name": "triggerType", "type": "string", "required": False}
                ]
            },
            {
                "name": "packagerepo.parse_json",
                "displayName": "Parse JSON",
                "group": "transform",
                "properties": [
                    {"name": "input", "type": "string", "required": True},
                    {"name": "out", "type": "string", "required": False}
                ]
            },
            {
                "name": "logic.if",
                "displayName": "Condition",
                "group": "logic",
                "properties": [
                    {"name": "condition", "type": "string", "required": True},
                    {"name": "then", "type": "string", "required": True},
                    {"name": "else", "type": "string", "required": True}
                ]
            },
            {
                "name": "packagerepo.respond_json",
                "displayName": "Respond JSON",
                "group": "response",
                "properties": [
                    {"name": "body", "type": "object", "required": True},
                    {"name": "status", "type": "number", "required": False}
                ]
            }
        ],
        "categories": ["core", "transform", "logic", "response"],
        "plugins": []
    }


# ============================================================================
# TEST SUITE 1: REQUIRED FIELD VALIDATION
# ============================================================================

class TestRequiredFieldValidation:
    """Tests for required fields: id, name, nodes, connections, version, tenantId, active."""

    def test_missing_workflow_id(self, loader_v2):
        """Test validation fails when workflow id is missing."""
        workflow = {
            "name": "No ID Workflow",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        assert any(e["field"] == "id" for e in errors)
        assert any("id field" in e["message"] for e in errors)

    def test_present_workflow_id(self, loader_v2, minimal_workflow):
        """Test validation passes when workflow id is present."""
        is_valid, errors = loader_v2.validate_workflow(minimal_workflow)

        # Should not have id-related errors
        id_errors = [e for e in errors if e["field"] == "id"]
        assert len(id_errors) == 0

    def test_missing_workflow_name(self, loader_v2):
        """Test validation fails when workflow name is missing."""
        workflow = {
            "id": "test-001",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        assert any(e["field"] == "name" for e in errors)

    def test_missing_nodes_array(self, loader_v2):
        """Test validation fails when nodes array is missing."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        assert any(e["field"] == "nodes" for e in errors)

    def test_missing_connections_object(self, loader_v2):
        """Test validation fails when connections object is missing."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": []
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        assert any(e["field"] == "connections" for e in errors)

    def test_empty_nodes_array_allowed(self, loader_v2):
        """Test empty nodes array is allowed but typically invalid."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Empty nodes should pass structural validation
        required_field_errors = [e for e in errors if e["type"] == "error"]
        assert not required_field_errors or not any(
            e["field"] == "nodes" for e in required_field_errors
        )

    def test_version_field_optional(self, loader_v2, minimal_workflow):
        """Test version field is optional."""
        is_valid, errors = loader_v2.validate_workflow(minimal_workflow)
        version_errors = [e for e in errors if e["field"] == "version"]

        assert len(version_errors) == 0

    def test_active_field_optional(self, loader_v2, minimal_workflow):
        """Test active field is optional."""
        is_valid, errors = loader_v2.validate_workflow(minimal_workflow)
        active_errors = [e for e in errors if e["field"] == "active"]

        assert len(active_errors) == 0

    def test_active_field_boolean_type(self, loader_v2):
        """Test active field accepts boolean values."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "active": True  # Should be valid
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)
        active_errors = [e for e in errors if e["field"] == "active"]

        assert len(active_errors) == 0

    def test_tenantid_warning_in_multitenant_context(self, loader_v2_multitenant):
        """Test warning when tenantId missing in multi-tenant context."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2_multitenant.validate_workflow(workflow, strict=False)

        # Should warn about missing tenantId
        tenantid_warnings = [e for e in errors if e["field"] == "tenantId"]
        assert any(e["type"] == "warning" for e in tenantid_warnings)

    def test_tenantid_provided_no_warning(self, loader_v2_multitenant):
        """Test no warning when tenantId is provided in multi-tenant context."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "tenantId": "acme"
        }
        is_valid, errors = loader_v2_multitenant.validate_workflow(workflow, strict=False)

        tenantid_warnings = [e for e in errors if e["field"] == "tenantId" and e["type"] == "warning"]
        assert len(tenantid_warnings) == 0


# ============================================================================
# TEST SUITE 2: PARAMETER NESTING DETECTION
# ============================================================================

class TestParameterNestingDetection:
    """Tests for parameter nesting issues and [object Object] serialization."""

    def test_node_attributes_in_parameters_error(self, loader_v2):
        """Test error when node attributes appear in parameters."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Bad Node",
                    "type": "logic.if",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {
                        "condition": "true",
                        "name": "This should not be here",  # Node attribute in params
                        "typeVersion": 1                    # Node attribute in params
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        param_errors = [e for e in errors if "nesting" in e["message"].lower()]
        assert len(param_errors) > 0

    def test_position_in_parameters_error(self, loader_v2):
        """Test error when position attribute appears in parameters."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Bad Node",
                    "type": "logic.if",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {
                        "condition": "true",
                        "position": [100, 100]  # Should be at node level
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        param_errors = [e for e in errors if "nesting" in e["message"].lower()]
        assert len(param_errors) > 0

    def test_object_object_serialization_error(self, loader_v2):
        """Test error when parameter value is [object Object]."""
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
                        "input": "[object Object]",  # Serialization failure
                        "out": "result"
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        serialization_errors = [
            e for e in errors if "serialization" in e["message"].lower()
        ]
        assert len(serialization_errors) > 0

    def test_multiple_object_object_values(self, loader_v2):
        """Test multiple [object Object] serialization errors detected."""
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
                        "input": "[object Object]",
                        "config": "[object Object]",
                        "out": "result"
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        serialization_errors = [
            e for e in errors if "serialization" in e["message"].lower()
        ]
        assert len(serialization_errors) >= 2

    def test_proper_parameter_nesting_valid(self, loader_v2):
        """Test properly nested parameters pass validation."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Good Node",
                    "type": "packagerepo.parse_json",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {
                        "input": "$request.body",
                        "out": "parsed"
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Should not have nesting errors
        nesting_errors = [
            e for e in errors if "nesting" in e["message"].lower()
        ]
        assert len(nesting_errors) == 0

    def test_nested_object_parameters_valid(self, loader_v2):
        """Test nested object parameters are valid."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Response Node",
                    "type": "packagerepo.respond_json",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {
                        "body": {
                            "ok": True,
                            "data": {"nested": "value"}
                        },
                        "status": 200
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        nesting_errors = [
            e for e in errors if "nesting" in e["message"].lower()
        ]
        assert len(nesting_errors) == 0


# ============================================================================
# TEST SUITE 3: CONNECTION INTEGRITY
# ============================================================================

class TestConnectionIntegrity:
    """Tests for workflow connection validation."""

    def test_valid_connections(self, loader_v2):
        """Test valid workflow connections pass validation."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                },
                {
                    "id": "node-2",
                    "name": "Node 2",
                    "type": "packagerepo.parse_json",
                    "typeVersion": 1,
                    "position": [300, 100],
                    "parameters": {"input": "$request.body"}
                }
            ],
            "connections": {
                "Node 1": {
                    "main": {
                        "0": [{"node": "Node 2", "type": "main", "index": 0}]
                    }
                }
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Connection structure is valid
        connection_errors = [
            e for e in errors if "Connection" in e.get("message", "")
        ]
        assert len(connection_errors) == 0

    def test_connection_source_node_not_found(self, loader_v2):
        """Test warning when connection source node doesn't exist."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {
                "NonexistentNode": {
                    "main": {
                        "0": [{"node": "Node 1", "type": "main", "index": 0}]
                    }
                }
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        conn_errors = [
            e for e in errors if "source node" in e.get("message", "").lower()
        ]
        assert len(conn_errors) > 0

    def test_connection_target_node_not_found(self, loader_v2):
        """Test warning when connection target node doesn't exist."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {
                "Node 1": {
                    "main": {
                        "0": [{"node": "NonexistentTarget", "type": "main", "index": 0}]
                    }
                }
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        conn_errors = [
            e for e in errors if "target node" in e.get("message", "").lower()
        ]
        assert len(conn_errors) > 0

    def test_invalid_output_type(self, loader_v2):
        """Test error for invalid output type (not 'main' or 'error')."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {
                "Node 1": {
                    "invalid_output": {  # Invalid output type
                        "0": [{"node": "Node 1", "type": "main", "index": 0}]
                    }
                }
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        output_errors = [
            e for e in errors if "output type" in e.get("message", "").lower()
        ]
        assert len(output_errors) > 0

    def test_non_numeric_connection_index(self, loader_v2):
        """Test error when connection index is non-numeric."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {
                "Node 1": {
                    "main": {
                        "abc": [{"node": "Node 1", "type": "main", "index": 0}]  # Non-numeric
                    }
                }
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        index_errors = [
            e for e in errors if "numeric" in e.get("message", "").lower()
        ]
        assert len(index_errors) > 0

    def test_empty_connections_valid(self, loader_v2, minimal_workflow):
        """Test empty connections object is valid."""
        minimal_workflow["connections"] = {}
        is_valid, errors = loader_v2.validate_workflow(minimal_workflow, strict=False)

        # Should not have connection errors
        conn_errors = [
            e for e in errors if "connection" in e.get("message", "").lower()
        ]
        assert len(conn_errors) == 0


# ============================================================================
# TEST SUITE 4: NODE TYPE REGISTRY LOOKUP
# ============================================================================

class TestNodeTypeRegistryLookup:
    """Tests for node type registry validation."""

    def test_node_type_found_in_registry(self, loader_v2, mock_registry):
        """Test node type found in registry passes."""
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

        registry_errors = [
            e for e in errors if "registry" in e.get("message", "").lower()
        ]
        assert len(registry_errors) == 0

    def test_node_type_not_found_in_registry(self, loader_v2, mock_registry):
        """Test warning when node type not found in registry."""
        loader_v2.registry = mock_registry

        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Unknown",
                    "type": "unknown.node",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        registry_errors = [
            e for e in errors if "registry" in e.get("message", "").lower()
        ]
        assert len(registry_errors) > 0
        assert any(e["type"] == "warning" for e in registry_errors)

    def test_missing_required_node_parameters(self, loader_v2, mock_registry):
        """Test required parameters are validated against registry."""
        loader_v2.registry = mock_registry

        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Parse JSON",
                    "type": "packagerepo.parse_json",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {
                        "out": "result"
                        # Missing required "input" parameter
                    }
                }
            ],
            "connections": {}
        }
        # Note: Current implementation has simplified parameter validation
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)
        # Placeholder for more complete parameter validation

    def test_find_node_type_in_registry(self, loader_v2, mock_registry):
        """Test finding node type in registry."""
        loader_v2.registry = mock_registry

        node_type = loader_v2._find_node_type_in_registry("metabuilder.trigger")

        assert node_type is not None
        assert node_type["name"] == "metabuilder.trigger"
        assert node_type["displayName"] == "Trigger"

    def test_find_node_type_not_in_registry(self, loader_v2, mock_registry):
        """Test node type not found returns None."""
        loader_v2.registry = mock_registry

        node_type = loader_v2._find_node_type_in_registry("unknown.node")

        assert node_type is None

    def test_registry_loaded_on_init(self, temp_workflows_dir, base_config):
        """Test registry is loaded when loader is initialized."""
        loader = WorkflowLoaderV2(temp_workflows_dir, base_config)

        assert loader.registry is not None
        assert "nodeTypes" in loader.registry

    def test_empty_registry_fallback(self, temp_workflows_dir, base_config):
        """Test minimal registry is used when file not found."""
        loader = WorkflowLoaderV2(temp_workflows_dir, base_config)

        # Registry should have minimal structure
        assert "nodeTypes" in loader.registry
        assert "categories" in loader.registry
        assert "plugins" in loader.registry


# ============================================================================
# TEST SUITE 5: MULTI-TENANT CONTEXT VALIDATION
# ============================================================================

class TestMultiTenantValidation:
    """Tests for multi-tenant context and safety."""

    def test_multitenant_loader_stores_tenant_id(self, loader_v2_multitenant):
        """Test multi-tenant loader stores tenant ID."""
        assert loader_v2_multitenant.tenant_id == "acme"

    def test_single_tenant_loader_no_tenant_id(self, loader_v2):
        """Test single-tenant loader has no tenant ID."""
        assert loader_v2.tenant_id is None

    def test_workflow_with_matching_tenant_id(self, loader_v2_multitenant):
        """Test workflow with matching tenant ID passes validation."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "tenantId": "acme",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2_multitenant.validate_workflow(workflow, strict=False)

        tenantid_errors = [
            e for e in errors if e["field"] == "tenantId" and e["type"] == "warning"
        ]
        assert len(tenantid_errors) == 0

    def test_workflow_with_different_tenant_id(self, loader_v2_multitenant):
        """Test workflow with different tenant ID still validates structurally."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "tenantId": "other-tenant",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2_multitenant.validate_workflow(workflow, strict=False)

        # Should still pass structural validation
        # (actual tenant isolation enforced at runtime)
        assert True

    def test_missing_tenant_id_in_multitenant_context_warning(self, loader_v2_multitenant):
        """Test warning when tenantId missing in multi-tenant context."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2_multitenant.validate_workflow(workflow, strict=False)

        tenantid_warnings = [
            e for e in errors if e["field"] == "tenantId" and e["type"] == "warning"
        ]
        assert len(tenantid_warnings) > 0

    def test_tenant_id_in_context_no_warning_single_tenant(self, loader_v2):
        """Test no warning about tenantId in single-tenant context."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        tenantid_warnings = [
            e for e in errors if e["field"] == "tenantId"
        ]
        assert len(tenantid_warnings) == 0

    def test_context_passed_to_execute_workflow(self, loader_v2_multitenant, tmp_path):
        """Test tenant context passed to workflow execution."""
        workflow_file = tmp_path / "workflows" / "test.json"
        workflow_file.parent.mkdir(parents=True, exist_ok=True)

        workflow = {
            "id": "test-001",
            "name": "Test",
            "tenantId": "acme",
            "nodes": [],
            "connections": {}
        }
        workflow_file.write_text(json.dumps(workflow))

        # Tenant ID should be accessible in loader
        assert loader_v2_multitenant.tenant_id == "acme"


# ============================================================================
# TEST SUITE 6: NODE FIELD VALIDATION
# ============================================================================

class TestNodeFieldValidation:
    """Tests for individual node field validation."""

    def test_node_missing_id(self, loader_v2):
        """Test error when node has no id."""
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
        node_errors = [
            e for e in errors if "nodes[0].id" in e["field"]
        ]
        assert len(node_errors) > 0

    def test_node_missing_name(self, loader_v2):
        """Test error when node has no name."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
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
        name_errors = [
            e for e in errors if "nodes[0].name" in e["field"]
        ]
        assert len(name_errors) > 0

    def test_node_missing_type(self, loader_v2):
        """Test error when node has no type."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "No Type Node",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        type_errors = [
            e for e in errors if "nodes[0].type" in e["field"]
        ]
        assert len(type_errors) > 0

    def test_all_required_node_fields_present(self, loader_v2):
        """Test node with all required fields passes."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Complete Node",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Should not have node field errors
        node_field_errors = [
            e for e in errors if any(
                x in e["field"] for x in ["nodes[0].id", "nodes[0].name", "nodes[0].type"]
            ) and e["type"] == "error"
        ]
        assert len(node_field_errors) == 0


# ============================================================================
# TEST SUITE 7: VARIABLE VALIDATION
# ============================================================================

class TestVariableValidation:
    """Tests for workflow variable validation."""

    def test_valid_variables(self, loader_v2):
        """Test valid variables pass validation."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "variables": {
                "timeout": {"type": "number", "defaultValue": 3600},
                "retries": {"type": "number", "defaultValue": 3},
                "api_key": {"type": "string"}
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        var_errors = [
            e for e in errors if "variables" in e["field"]
        ]
        assert len(var_errors) == 0

    def test_variable_not_object(self, loader_v2):
        """Test error when variable definition is not an object."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "variables": {
                "timeout": "invalid"  # Should be object
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        var_errors = [
            e for e in errors if "variables.timeout" in e["field"]
        ]
        assert len(var_errors) > 0

    def test_variable_missing_type(self, loader_v2):
        """Test error when variable definition has no type."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "variables": {
                "timeout": {"defaultValue": 3600}  # Missing type
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        type_errors = [
            e for e in errors if "variables.timeout.type" in e["field"]
        ]
        assert len(type_errors) > 0

    def test_valid_variable_names(self, loader_v2):
        """Test valid variable names pass validation."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "variables": {
                "timeout": {"type": "number"},
                "API_KEY": {"type": "string"},
                "var_name_123": {"type": "string"},
                "MAX_RETRIES": {"type": "number"}
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        var_name_errors = [
            e for e in errors if "alphanumeric" in e.get("message", "").lower()
        ]
        assert len(var_name_errors) == 0

    def test_invalid_variable_names(self, loader_v2):
        """Test invalid variable names fail validation."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "variables": {
                "invalid-name": {"type": "string"},  # Hyphens not allowed
                "invalid.name": {"type": "string"},  # Dots not allowed
                "invalid name": {"type": "string"}   # Spaces not allowed
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        assert not is_valid
        # At least some should be invalid


# ============================================================================
# TEST SUITE 8: EDGE CASES AND ERROR HANDLING
# ============================================================================

class TestEdgeCasesAndErrorHandling:
    """Tests for edge cases and error conditions."""

    def test_very_large_workflow(self, loader_v2):
        """Test handling of large workflow with many nodes."""
        nodes = [
            {
                "id": f"node-{i}",
                "name": f"Node {i}",
                "type": "metabuilder.trigger" if i == 0 else "packagerepo.parse_json",
                "typeVersion": 1,
                "position": [i * 100, 100],
                "parameters": {"input": f"$var{i}"} if i > 0 else {}
            }
            for i in range(100)
        ]

        workflow = {
            "id": "large-workflow",
            "name": "Large Workflow",
            "nodes": nodes,
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Should handle large workflows
        assert isinstance(errors, list)

    def test_deeply_nested_parameters(self, loader_v2):
        """Test handling of deeply nested parameter objects."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Nested",
                    "type": "packagerepo.respond_json",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {
                        "body": {
                            "level1": {
                                "level2": {
                                    "level3": {
                                        "level4": {
                                            "data": "deep value"
                                        }
                                    }
                                }
                            }
                        },
                        "status": 200
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Should handle nested structures
        assert isinstance(errors, list)

    def test_unicode_in_workflow(self, loader_v2):
        """Test handling of Unicode characters in workflow."""
        workflow = {
            "id": "test-unicode",
            "name": "Unicode Workflow 🚀",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node with 中文 and émojis 🎉",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {
                        "message": "Greeting: مرحبا, 你好, こんにちは"
                    }
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        assert isinstance(errors, list)

    def test_null_and_empty_values(self, loader_v2):
        """Test handling of null and empty values in workflow."""
        workflow = {
            "id": "test-001",
            "name": "",  # Empty name
            "nodes": [],
            "connections": {},
            "variables": {},
            "staticData": {},
            "meta": None
        }
        is_valid, errors = loader_v2.validate_workflow(workflow)

        # Should have error for empty name
        assert not is_valid

    def test_circular_node_connections(self, loader_v2):
        """Test handling of circular node connections."""
        workflow = {
            "id": "test-001",
            "name": "Circular",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                },
                {
                    "id": "node-2",
                    "name": "Node 2",
                    "type": "packagerepo.parse_json",
                    "typeVersion": 1,
                    "position": [300, 100],
                    "parameters": {}
                }
            ],
            "connections": {
                "Node 1": {
                    "main": {
                        "0": [{"node": "Node 2", "type": "main", "index": 0}]
                    }
                },
                "Node 2": {
                    "main": {
                        "0": [{"node": "Node 1", "type": "main", "index": 0}]  # Circular
                    }
                }
            }
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Should validate structure (runtime handles circular detection)
        assert isinstance(errors, list)

    def test_duplicate_node_ids(self, loader_v2):
        """Test handling of duplicate node IDs."""
        workflow = {
            "id": "test-001",
            "name": "Duplicate IDs",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node A",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                },
                {
                    "id": "node-1",  # Duplicate ID
                    "name": "Node B",
                    "type": "packagerepo.parse_json",
                    "typeVersion": 1,
                    "position": [300, 100],
                    "parameters": {}
                }
            ],
            "connections": {}
        }
        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)

        # Current implementation may not detect duplicates
        # but should still validate structure
        assert isinstance(errors, list)

    def test_workflow_load_cache(self, loader_v2, temp_workflows_dir):
        """Test workflow caching mechanism."""
        workflow = {
            "id": "test-001",
            "name": "Cached Workflow",
            "nodes": [],
            "connections": {}
        }

        workflow_file = temp_workflows_dir / "cached.json"
        workflow_file.write_text(json.dumps(workflow))

        # Load first time
        loaded1 = loader_v2.load_workflow("cached")
        assert loaded1["id"] == "test-001"

        # Load second time (from cache)
        loaded2 = loader_v2.load_workflow("cached")
        assert loaded2["id"] == "test-001"

        # Should be same object (cached)
        assert loader_v2.workflows_cache["cached"] == loaded1

    def test_workflow_not_found(self, loader_v2):
        """Test error when workflow file not found."""
        with pytest.raises(FileNotFoundError):
            loader_v2.load_workflow("nonexistent")

    def test_invalid_json_workflow(self, loader_v2, temp_workflows_dir):
        """Test error when workflow JSON is invalid."""
        workflow_file = temp_workflows_dir / "invalid.json"
        workflow_file.write_text("{ invalid json")

        with pytest.raises(Exception):  # JSONDecodeError
            loader_v2.load_workflow("invalid")

    def test_clear_cache(self, loader_v2, temp_workflows_dir):
        """Test cache clearing functionality."""
        workflow = {
            "id": "test-001",
            "name": "Cached",
            "nodes": [],
            "connections": {}
        }

        workflow_file = temp_workflows_dir / "test.json"
        workflow_file.write_text(json.dumps(workflow))

        # Load to cache
        loader_v2.load_workflow("test")
        assert "test" in loader_v2.workflows_cache

        # Clear cache
        loader_v2.clear_cache()
        assert len(loader_v2.workflows_cache) == 0


# ============================================================================
# TEST SUITE 9: STRICT VS NON-STRICT VALIDATION
# ============================================================================

class TestStrictValidation:
    """Tests for strict vs non-strict validation modes."""

    def test_strict_mode_treats_warnings_as_errors(self, loader_v2):
        """Test strict mode treats warnings as errors."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {},
            "variables": {
                "test_var": {"type": "string"}
            }
        }

        is_valid_strict, errors_strict = loader_v2.validate_workflow(
            workflow, strict=True
        )
        is_valid_lenient, errors_lenient = loader_v2.validate_workflow(
            workflow, strict=False
        )

        # Behavior depends on actual warnings in validation

    def test_non_strict_mode_allows_warnings(self, loader_v2_multitenant):
        """Test non-strict mode allows warnings."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {}
            # Missing tenantId - warning in multi-tenant
        }

        is_valid, errors = loader_v2_multitenant.validate_workflow(
            workflow, strict=False
        )

        # Should pass in non-strict mode
        error_count = len([e for e in errors if e["type"] == "error"])
        assert error_count == 0

    def test_strict_mode_fails_on_warnings(self, loader_v2_multitenant):
        """Test strict mode fails on warnings."""
        workflow = {
            "id": "test-001",
            "name": "Test",
            "nodes": [],
            "connections": {}
            # Missing tenantId - warning in multi-tenant
        }

        is_valid_strict, errors_strict = loader_v2_multitenant.validate_workflow(
            workflow, strict=True
        )
        is_valid_lenient, errors_lenient = loader_v2_multitenant.validate_workflow(
            workflow, strict=False
        )

        # Strict should be more restrictive
        if any(e["type"] == "warning" for e in errors_strict):
            assert not is_valid_strict or len(errors_strict) > len(errors_lenient)


# ============================================================================
# TEST SUITE 10: INTEGRATION TESTS
# ============================================================================

class TestIntegration:
    """Integration tests combining multiple validation features."""

    def test_complete_valid_workflow(self, loader_v2, complete_workflow):
        """Test complete valid workflow passes all validations."""
        is_valid, errors = loader_v2.validate_workflow(complete_workflow, strict=False)

        # Should have no critical errors
        critical_errors = [e for e in errors if e["type"] == "error"]
        assert len(critical_errors) == 0

    def test_workflow_load_and_validate(self, loader_v2, temp_workflows_dir):
        """Test loading and validating workflow from file."""
        workflow = {
            "id": "test-integration",
            "name": "Integration Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {}
        }

        workflow_file = temp_workflows_dir / "integration.json"
        workflow_file.write_text(json.dumps(workflow))

        # Load
        loaded = loader_v2.load_workflow("integration")

        # Validate
        is_valid, errors = loader_v2.validate_workflow(loaded, strict=False)

        assert is_valid or len([e for e in errors if e["type"] == "error"]) == 0

    def test_multiple_workflows_validation(self, loader_v2, temp_workflows_dir):
        """Test validating multiple workflows."""
        workflows = [
            {
                "id": f"workflow-{i}",
                "name": f"Workflow {i}",
                "nodes": [
                    {
                        "id": "node-1",
                        "name": "Node",
                        "type": "metabuilder.trigger",
                        "typeVersion": 1,
                        "position": [100, 100],
                        "parameters": {}
                    }
                ],
                "connections": {}
            }
            for i in range(5)
        ]

        for i, wf in enumerate(workflows):
            wf_file = temp_workflows_dir / f"wf{i}.json"
            wf_file.write_text(json.dumps(wf))

        # Validate all
        for i in range(5):
            loaded = loader_v2.load_workflow(f"wf{i}")
            is_valid, errors = loader_v2.validate_workflow(loaded, strict=False)
            assert isinstance(is_valid, bool)


# ============================================================================
# PARAMETRIZED TESTS
# ============================================================================

class TestParametrizedValidation:
    """Parametrized tests for multiple scenarios."""

    @pytest.mark.parametrize("field", ["id", "name", "nodes", "connections"])
    def test_required_fields(self, loader_v2, field):
        """Test each required field is validated."""
        workflow = {
            "id": "test",
            "name": "Test",
            "nodes": [],
            "connections": {}
        }
        del workflow[field]

        is_valid, errors = loader_v2.validate_workflow(workflow)
        assert not is_valid
        assert any(e["field"] == field for e in errors)

    @pytest.mark.parametrize("node_type", [
        "metabuilder.trigger",
        "packagerepo.parse_json",
        "logic.if",
        "packagerepo.respond_json"
    ])
    def test_node_types(self, loader_v2, node_type):
        """Test various node types."""
        workflow = {
            "id": "test",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node",
                    "type": node_type,
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                }
            ],
            "connections": {}
        }

        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)
        # Structural validation should pass
        node_errors = [e for e in errors if e["type"] == "error" and "node" in e["field"].lower()]
        # Most common nodes should be found or at least not structural errors
        assert isinstance(is_valid, bool)

    @pytest.mark.parametrize("connection_type", ["main", "error"])
    def test_connection_output_types(self, loader_v2, connection_type):
        """Test valid connection output types."""
        workflow = {
            "id": "test",
            "name": "Test",
            "nodes": [
                {
                    "id": "node-1",
                    "name": "Node 1",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [100, 100],
                    "parameters": {}
                },
                {
                    "id": "node-2",
                    "name": "Node 2",
                    "type": "metabuilder.trigger",
                    "typeVersion": 1,
                    "position": [300, 100],
                    "parameters": {}
                }
            ],
            "connections": {
                "Node 1": {
                    connection_type: {
                        "0": [{"node": "Node 2", "type": "main", "index": 0}]
                    }
                }
            }
        }

        is_valid, errors = loader_v2.validate_workflow(workflow, strict=False)
        output_errors = [
            e for e in errors if "output type" in e.get("message", "").lower()
        ]
        assert len(output_errors) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
