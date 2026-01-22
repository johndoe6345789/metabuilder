"""Workflow plugin: split string."""

from ...base import NodeExecutor


class StringSplit(NodeExecutor):
    """Split string by separator."""

    node_type = "string.split"
    category = "string"
    description = "Split string by separator"

    def execute(self, inputs, runtime=None):
        text = str(inputs.get("text", inputs.get("value", "")))
        separator = inputs.get("separator", " ")
        max_splits = inputs.get("max_splits", inputs.get("limit"))
        if max_splits is not None:
            return {"result": text.split(separator, max_splits)}
        return {"result": text.split(separator)}
