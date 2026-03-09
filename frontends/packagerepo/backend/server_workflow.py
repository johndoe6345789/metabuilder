#!/usr/bin/env python3
"""
Package Repository Server - Workflow-Based
Boots entire Flask server from a workflow definition.
"""

import json
import sys
from pathlib import Path

# Add root metabuilder to path
METABUILDER_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(METABUILDER_ROOT / "workflow" / "executor" / "python"))

from executor import WorkflowExecutor
from workflow_loader import create_workflow_loader


def main():
    """Boot the Flask server using workflow definition."""

    # Create workflow executor
    plugins_dir = METABUILDER_ROOT / "workflow" / "plugins" / "python"
    executor = WorkflowExecutor(str(plugins_dir))

    # Create workflow loader
    config = {
        "jwt_secret": "dev-secret-key",
        "data_dir": "/tmp/packagerepo-data"
    }
    workflow_loader = create_workflow_loader(config)

    # Load server workflow
    workflow_path = Path(__file__).parent / "workflows" / "server.json"
    with open(workflow_path) as f:
        server_workflow = json.load(f)

    # Create runtime context with workflow loader
    runtime_context = {
        "workflow_loader": workflow_loader,
        "config": config
    }

    print("Starting Package Repository Server via workflow...")
    print(f"Workflow: {server_workflow['name']}")
    print(f"Registering {len(server_workflow['nodes']) - 2} routes...")

    # Execute workflow (this will start the Flask server)
    try:
        result = executor.execute(server_workflow, {}, runtime_context)
        print(f"Server stopped: {result}")
    except KeyboardInterrupt:
        print("\nServer shutdown requested")
    except Exception as e:
        print(f"Error: {e}")
        raise


if __name__ == "__main__":
    main()
