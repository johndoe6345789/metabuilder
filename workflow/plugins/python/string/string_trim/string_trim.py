"""Workflow plugin: trim whitespace from string."""

from ...base import NodeExecutor


class StringTrim(NodeExecutor):
    """Trim whitespace from string."""

    node_type = "string.trim"
    category = "string"
    description = "Trim whitespace from string"

    def execute(self, inputs, runtime=None):
        value = str(inputs.get("value", inputs.get("text", "")))
        mode = inputs.get("mode", "both")
        if mode == "start":
            return {"result": value.lstrip()}
        elif mode == "end":
            return {"result": value.rstrip()}
        return {"result": value.strip()}
