"""
Workflow Loader V2 for Package Repository
Enhanced version with N8N schema support, validation, and registry integration.

This module bridges the Flask backend with MetaBuilder's workflow execution system,
providing automatic validation, type checking, and multi-tenant safety.
"""

import json
import sys
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from flask import Request, Response, jsonify
from datetime import datetime

# Add root metabuilder to path
METABUILDER_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(METABUILDER_ROOT / "workflow" / "executor" / "python"))
sys.path.insert(0, str(METABUILDER_ROOT / "workflow" / "executor" / "ts"))

from executor import WorkflowExecutor

logger = logging.getLogger(__name__)


class WorkflowValidationError(Exception):
    """Raised when workflow validation fails."""
    pass


class WorkflowLoaderV2:
    """
    Enhanced workflow loader with N8N schema validation and registry support.

    Features:
    - Automatic workflow validation against schema
    - Multi-tenant safety checks
    - Registry-based node type validation
    - Error handling with detailed diagnostics
    - Execution context management
    """

    def __init__(self, workflows_dir: Path, config: Dict[str, Any], tenant_id: Optional[str] = None):
        """
        Initialize the workflow loader.

        Args:
            workflows_dir: Directory containing workflow JSON files
            config: Flask application configuration
            tenant_id: Optional tenant ID for multi-tenant isolation
        """
        self.workflows_dir = workflows_dir
        self.config = config
        self.tenant_id = tenant_id
        self.workflows_cache: Dict[str, Dict] = {}
        self.validation_cache: Dict[str, Tuple[bool, list]] = {}

        # Initialize executor with Python plugins
        plugins_dir = METABUILDER_ROOT / "workflow" / "plugins" / "python"
        self.executor = WorkflowExecutor(str(plugins_dir))

        # Load node registry for validation
        self.registry = self._load_registry()

        logger.info(f"WorkflowLoaderV2 initialized with {len(self.registry.get('nodeTypes', []))} node types")

    def _load_registry(self) -> Dict[str, Any]:
        """Load the node registry for validation."""
        registry_path = METABUILDER_ROOT / "workflow" / "plugins" / "registry" / "node-registry.json"

        try:
            with open(registry_path) as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Registry not found at {registry_path}, using minimal registry")
            return {
                "nodeTypes": [],
                "categories": [],
                "plugins": []
            }

    def load_workflow(self, workflow_name: str) -> Dict[str, Any]:
        """
        Load a workflow definition from filesystem or cache.

        Args:
            workflow_name: Name of the workflow (without .json extension)

        Returns:
            Workflow definition dictionary

        Raises:
            FileNotFoundError: If workflow file not found
            json.JSONDecodeError: If workflow JSON is invalid
        """
        if workflow_name in self.workflows_cache:
            return self.workflows_cache[workflow_name]

        workflow_path = self.workflows_dir / f"{workflow_name}.json"
        if not workflow_path.exists():
            raise FileNotFoundError(f"Workflow '{workflow_name}' not found at {workflow_path}")

        try:
            with open(workflow_path) as f:
                workflow = json.load(f)
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Invalid JSON in workflow {workflow_name}: {str(e)}",
                e.doc,
                e.pos
            )

        self.workflows_cache[workflow_name] = workflow
        return workflow

    def validate_workflow(self, workflow: Dict[str, Any], strict: bool = True) -> Tuple[bool, list]:
        """
        Validate a workflow against schema and registry.

        Args:
            workflow: Workflow definition
            strict: If True, treat warnings as errors

        Returns:
            Tuple of (is_valid, errors_list)
        """
        errors = []

        # Check workflow ID
        if "id" not in workflow:
            errors.append({
                "type": "error",
                "field": "id",
                "message": "Workflow must have an id field"
            })

        # Check required fields
        for required_field in ["name", "nodes", "connections"]:
            if required_field not in workflow:
                errors.append({
                    "type": "error",
                    "field": required_field,
                    "message": f"Workflow must have '{required_field}' field"
                })

        # Validate nodes
        if "nodes" in workflow:
            for i, node in enumerate(workflow["nodes"]):
                node_errors = self._validate_node(node, i)
                errors.extend(node_errors)

        # Validate connections
        if "connections" in workflow:
            conn_errors = self._validate_connections(workflow["connections"], workflow.get("nodes", []))
            errors.extend(conn_errors)

        # Validate variables if present
        if "variables" in workflow:
            var_errors = self._validate_variables(workflow["variables"])
            errors.extend(var_errors)

        # Multi-tenant safety check
        if self.tenant_id and "tenantId" not in workflow:
            errors.append({
                "type": "warning",
                "field": "tenantId",
                "message": f"Workflow should include tenantId for multi-tenant isolation. Current tenant: {self.tenant_id}"
            })

        is_valid = all(e["type"] != "error" for e in errors)
        if strict:
            is_valid = all(e["type"] != "warning" for e in errors) and is_valid

        return is_valid, errors

    def _validate_node(self, node: Dict[str, Any], index: int) -> list:
        """Validate individual node."""
        errors = []
        node_path = f"nodes[{index}]"

        # Check required fields
        if not node.get("id"):
            errors.append({
                "type": "error",
                "field": f"{node_path}.id",
                "message": "Node must have an id"
            })

        if not node.get("name"):
            errors.append({
                "type": "error",
                "field": f"{node_path}.name",
                "message": "Node must have a name"
            })

        if not node.get("type"):
            errors.append({
                "type": "error",
                "field": f"{node_path}.type",
                "message": "Node must have a type"
            })

        # Validate against registry
        if node.get("type"):
            node_type_name = node["type"]
            registry_node = self._find_node_type_in_registry(node_type_name)

            if not registry_node:
                errors.append({
                    "type": "warning",
                    "field": f"{node_path}.type",
                    "message": f"Node type '{node_type_name}' not found in registry"
                })
            else:
                # Validate parameters against registry definition
                if "properties" in registry_node and "parameters" in node:
                    param_errors = self._validate_parameters(
                        node["parameters"],
                        registry_node["properties"],
                        f"{node_path}.parameters"
                    )
                    errors.extend(param_errors)

        # Check for deprecated parameter structure
        if "parameters" in node:
            params = node["parameters"]
            if isinstance(params, dict):
                # Check for node-level attributes in parameters (nesting issue)
                if any(k in params for k in ["name", "typeVersion", "position"]):
                    errors.append({
                        "type": "error",
                        "field": f"{node_path}.parameters",
                        "message": "Parameters contain node-level attributes (name/typeVersion/position). "
                                 "This indicates improper parameter nesting."
                    })

                # Check for [object Object] serialization
                for key, value in params.items():
                    if isinstance(value, str) and value == "[object Object]":
                        errors.append({
                            "type": "error",
                            "field": f"{node_path}.parameters.{key}",
                            "message": f"Parameter '{key}' has serialization failure: [object Object]"
                        })

        return errors

    def _validate_connections(self, connections: Dict[str, Any], nodes: list) -> list:
        """Validate workflow connections."""
        errors = []
        node_names = {n.get("name") for n in nodes if n.get("name")}

        for from_node, outputs in connections.items():
            if from_node not in node_names:
                errors.append({
                    "type": "warning",
                    "field": f"connections.{from_node}",
                    "message": f"Connection source node '{from_node}' not found in workflow nodes"
                })

            if isinstance(outputs, dict):
                for output_type, indices in outputs.items():
                    if output_type not in ["main", "error"]:
                        errors.append({
                            "type": "error",
                            "field": f"connections.{from_node}.{output_type}",
                            "message": f"Invalid output type '{output_type}'. Must be 'main' or 'error'"
                        })

                    if isinstance(indices, dict):
                        for idx_str, targets in indices.items():
                            if not idx_str.isdigit():
                                errors.append({
                                    "type": "error",
                                    "field": f"connections.{from_node}.{output_type}.{idx_str}",
                                    "message": f"Connection index must be numeric"
                                })

                            if isinstance(targets, list):
                                for target in targets:
                                    if isinstance(target, dict) and "node" in target:
                                        if target["node"] not in node_names:
                                            errors.append({
                                                "type": "warning",
                                                "field": f"connections.{from_node}.{output_type}.{idx_str}",
                                                "message": f"Connection target node '{target['node']}' not found"
                                            })

        return errors

    def _validate_variables(self, variables: Dict[str, Any]) -> list:
        """Validate workflow variables."""
        errors = []

        for var_name, var_def in variables.items():
            if not isinstance(var_def, dict):
                errors.append({
                    "type": "error",
                    "field": f"variables.{var_name}",
                    "message": "Variable definition must be an object"
                })
                continue

            # Validate variable name format
            if not var_name.replace("_", "").replace("0", "").replace("1", "").replace("2", "").replace("3", "").replace("4", "").replace("5", "").replace("6", "").replace("7", "").replace("8", "").replace("9", "").isalnum():
                errors.append({
                    "type": "error",
                    "field": f"variables.{var_name}",
                    "message": "Variable name must be alphanumeric with underscores"
                })

            # Check type
            if "type" not in var_def:
                errors.append({
                    "type": "error",
                    "field": f"variables.{var_name}.type",
                    "message": "Variable must have a type"
                })

        return errors

    def _validate_parameters(self, params: Dict[str, Any], schema_props: list, field_path: str) -> list:
        """Validate node parameters against schema properties."""
        errors = []
        # Simplified parameter validation
        # Full implementation would check each param against schema
        return errors

    def _find_node_type_in_registry(self, node_type: str) -> Optional[Dict[str, Any]]:
        """Find node type in registry."""
        for nt in self.registry.get("nodeTypes", []):
            if nt.get("name") == node_type:
                return nt
        return None

    def execute_workflow_for_request(
        self,
        workflow_name: str,
        request: Request,
        additional_context: Optional[Dict[str, Any]] = None,
        validate: bool = True
    ) -> Response:
        """
        Execute a workflow for a Flask request with validation.

        Args:
            workflow_name: Name of workflow to execute
            request: Flask request object
            additional_context: Additional context data
            validate: If True, validate workflow before execution

        Returns:
            Flask Response object
        """
        try:
            # Load workflow
            workflow = self.load_workflow(workflow_name)

            # Validate workflow
            if validate:
                is_valid, errors = self.validate_workflow(workflow, strict=False)
                if not is_valid:
                    error_details = [e for e in errors if e["type"] == "error"]
                    if error_details:
                        return jsonify({
                            "ok": False,
                            "error": {
                                "code": "WORKFLOW_VALIDATION_ERROR",
                                "message": f"Workflow validation failed: {len(error_details)} error(s)",
                                "details": error_details
                            }
                        }), 400

            # Build workflow context from request
            context = {
                "request": {
                    "path": request.path,
                    "method": request.method,
                    "headers": dict(request.headers),
                    "body": request.get_data().decode("utf-8", errors="ignore") if request.data else None,
                    "content_length": request.content_length,
                    "args": dict(request.args),
                    "json": request.get_json(silent=True),
                },
                "config": self.config,
                "workflow": {
                    "variables": {}
                },
                "execution": {
                    "startedAt": datetime.utcnow().isoformat(),
                    "tenantId": self.tenant_id,
                }
            }

            # Add workflow variables to context
            if "variables" in workflow:
                for var_name, var_def in workflow["variables"].items():
                    context["workflow"]["variables"][var_name] = var_def.get("defaultValue")

            # Merge additional context
            if additional_context:
                context.update(additional_context)

            # Execute workflow
            result = self.executor.execute(workflow, context)

            # Handle workflow result
            if isinstance(result, dict):
                if "response" in result:
                    response_data = result["response"]
                    return jsonify(response_data.get("body", {})), response_data.get("status_code", 200)

                # Standard success response
                return jsonify({"ok": True, "result": result}), 200

            return jsonify({"ok": True, "result": result}), 200

        except FileNotFoundError as e:
            return jsonify({
                "ok": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": str(e)
                }
            }), 404

        except json.JSONDecodeError as e:
            return jsonify({
                "ok": False,
                "error": {
                    "code": "INVALID_WORKFLOW",
                    "message": f"Workflow JSON is invalid: {str(e)}"
                }
            }), 400

        except Exception as e:
            logger.exception(f"Workflow execution error: {str(e)}")
            return jsonify({
                "ok": False,
                "error": {
                    "code": "WORKFLOW_ERROR",
                    "message": str(e)
                }
            }), 500

    def clear_cache(self):
        """Clear workflow cache."""
        self.workflows_cache.clear()
        self.validation_cache.clear()
        logger.info("Workflow cache cleared")


def create_workflow_loader_v2(
    config: Dict[str, Any],
    tenant_id: Optional[str] = None
) -> WorkflowLoaderV2:
    """
    Create a WorkflowLoaderV2 instance.

    Args:
        config: Flask application configuration
        tenant_id: Optional tenant ID for multi-tenant isolation

    Returns:
        Configured WorkflowLoaderV2 instance
    """
    backend_dir = Path(__file__).parent
    workflows_dir = backend_dir / "workflows"
    workflows_dir.mkdir(exist_ok=True)

    return WorkflowLoaderV2(workflows_dir, config, tenant_id)
