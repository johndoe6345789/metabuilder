"""Load workflow configuration JSON."""
import json
import os


def load_workflow_config(metadata: dict) -> dict:
    """Load workflow config referenced by metadata."""
    workflow_file = metadata.get("workflow_path", "workflow.json")
    workflow_path = os.path.join(os.path.dirname(__file__), workflow_file)
    with open(workflow_path, "r", encoding="utf-8") as f:
        return json.load(f)
