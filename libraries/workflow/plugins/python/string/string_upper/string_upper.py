"""Workflow plugin: convert string to uppercase."""

from ...base import NodeExecutor


class StringUpper(NodeExecutor):
    """Convert string to uppercase."""

    node_type = "string.upper"
    category = "string"
    description = "Convert string to uppercase"

    def execute(self, inputs, runtime=None):
        value = str(inputs.get("value", inputs.get("text", "")))
        return {"result": value.upper()}
