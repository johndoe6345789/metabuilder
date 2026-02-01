"""Workflow plugin: concatenate strings."""

from ...base import NodeExecutor


class StringConcat(NodeExecutor):
    """Concatenate multiple strings."""

    node_type = "string.concat"
    category = "string"
    description = "Concatenate multiple strings"

    def execute(self, inputs, runtime=None):
        separator = inputs.get("separator", "")
        strings = inputs.get("strings", inputs.get("values", []))
        return {"result": separator.join(str(s) for s in strings)}
