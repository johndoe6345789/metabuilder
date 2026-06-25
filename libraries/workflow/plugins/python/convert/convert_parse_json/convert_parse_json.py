"""Workflow plugin: parse JSON string."""

import json

from ...base import NodeExecutor


class ConvertParseJson(NodeExecutor):
    """Parse JSON string to object."""

    node_type = "convert.parseJson"
    category = "convert"
    description = "Parse JSON string to object"

    def execute(self, inputs, runtime=None):
        text = inputs.get("text", "")
        try:
            result = json.loads(text)
            return {"result": result}
        except json.JSONDecodeError as e:
            return {"result": None, "error": str(e)}
