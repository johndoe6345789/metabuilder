"""Workflow plugin: read JSON file."""

import json
from pathlib import Path

from ...base import NodeExecutor


class WebReadJson(NodeExecutor):
    """Read JSON file."""

    node_type = "web.read_json"
    category = "web"
    description = "Read JSON file"

    def execute(self, inputs, runtime=None):
        """Read JSON file."""
        path = inputs.get("path")
        if not path:
            return {"error": "path is required"}

        path_obj = Path(path)
        if not path_obj.exists():
            return {"result": {}}

        try:
            json_data = json.loads(path_obj.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {"result": {}}

        return {"result": json_data}
