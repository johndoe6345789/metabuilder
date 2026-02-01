"""Workflow plugin: convert string to lowercase."""

from ...base import NodeExecutor


class StringLower(NodeExecutor):
    """Convert string to lowercase."""

    node_type = "string.lower"
    category = "string"
    description = "Convert string to lowercase"

    def execute(self, inputs, runtime=None):
        value = str(inputs.get("value", inputs.get("text", "")))
        return {"result": value.lower()}
