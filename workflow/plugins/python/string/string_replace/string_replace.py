"""Workflow plugin: replace in string."""

from ...base import NodeExecutor


class StringReplace(NodeExecutor):
    """Replace occurrences in string."""

    node_type = "string.replace"
    category = "string"
    description = "Replace occurrences in string"

    def execute(self, inputs, runtime=None):
        value = str(inputs.get("value", inputs.get("text", "")))
        old = inputs.get("old", inputs.get("search", ""))
        new = inputs.get("new", inputs.get("replacement", ""))
        count = inputs.get("count", -1)
        return {"result": value.replace(old, new, count)}
