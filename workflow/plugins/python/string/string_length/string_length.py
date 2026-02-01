"""Workflow plugin: get string length."""

from ...base import NodeExecutor


class StringLength(NodeExecutor):
    """Get string length."""

    node_type = "string.length"
    category = "string"
    description = "Get string length"

    def execute(self, inputs, runtime=None):
        value = str(inputs.get("value", inputs.get("text", "")))
        return {"result": len(value)}
