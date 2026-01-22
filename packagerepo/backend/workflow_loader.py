"""
Workflow Loader for Package Repository
Integrates with MetaBuilder workflow system from root project.
"""

import json
import sys
from pathlib import Path
from typing import Dict, Any, Optional
from flask import Request, Response, jsonify

# Add root metabuilder to path to import workflow executor
METABUILDER_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(METABUILDER_ROOT / "workflow" / "executor" / "python"))

from executor import WorkflowExecutor


class WorkflowLoader:
    """Loads and executes workflow definitions for Flask endpoints."""

    def __init__(self, workflows_dir: Path, config: Dict[str, Any]):
        self.workflows_dir = workflows_dir
        self.config = config
        self.workflows_cache: Dict[str, Dict] = {}

        # Use plugins from root metabuilder project
        plugins_dir = METABUILDER_ROOT / "workflow" / "plugins" / "python"
        self.executor = WorkflowExecutor(str(plugins_dir))

    def load_workflow(self, workflow_name: str) -> Dict[str, Any]:
        """Load a workflow definition from filesystem or cache."""
        if workflow_name in self.workflows_cache:
            return self.workflows_cache[workflow_name]

        workflow_path = self.workflows_dir / f"{workflow_name}.json"
        if not workflow_path.exists():
            raise FileNotFoundError(f"Workflow {workflow_name} not found")

        with open(workflow_path) as f:
            workflow = json.load(f)

        self.workflows_cache[workflow_name] = workflow
        return workflow

    def execute_workflow_for_request(
        self,
        workflow_name: str,
        request: Request,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> Response:
        """
        Execute a workflow for a Flask request.

        Args:
            workflow_name: Name of the workflow to execute
            request: Flask request object
            additional_context: Additional context (kv_store, config, etc.)

        Returns:
            Flask Response object
        """
        workflow = self.load_workflow(workflow_name)

        # Build workflow context from request
        context = {
            "request": {
                "path": request.path,
                "method": request.method,
                "headers": dict(request.headers),
                "body": request.get_data(),
                "content_length": request.content_length,
                "args": dict(request.args),
                "json": request.get_json(silent=True),
            },
            "config": self.config,
            **(additional_context or {})
        }

        try:
            # Execute workflow using MetaBuilder executor
            result = self.executor.execute(workflow, context)

            # Handle workflow result
            if "response" in result:
                response_data = result["response"]
                return jsonify(response_data.get("body", {})), response_data.get("status_code", 200)

            # Default success response
            return jsonify({"ok": True, "result": result}), 200

        except Exception as e:
            # Workflow execution error
            return jsonify({
                "ok": False,
                "error": {
                    "message": str(e),
                    "code": "WORKFLOW_ERROR"
                }
            }), 500


def create_workflow_loader(config: Dict[str, Any]) -> WorkflowLoader:
    """Create a workflow loader instance."""
    backend_dir = Path(__file__).parent
    workflows_dir = backend_dir / "workflows"
    workflows_dir.mkdir(exist_ok=True)

    return WorkflowLoader(workflows_dir, config)
