"""Workflow plugin: convert to JSON string."""

import json

from ...base import NodeExecutor


class ConvertToJson(NodeExecutor):
    """Convert value to JSON string."""

    node_type = "convert.toJson"
    category = "convert"
    description = "Convert value to JSON string"

    def execute(self, inputs, runtime=None):
        value = inputs.get("value")
        indent = inputs.get("indent")

        try:
            result = json.dumps(value, indent=indent)
            return {"result": result}
        except (TypeError, ValueError) as e:
            return {"result": None, "error": str(e)}
