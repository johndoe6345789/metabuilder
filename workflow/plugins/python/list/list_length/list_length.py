"""Workflow plugin: get list length."""

from ...base import NodeExecutor


class ListLength(NodeExecutor):
    """Get list length."""

    node_type = "list.length"
    category = "list"
    description = "Get list length"

    def execute(self, inputs, runtime=None):
        array = inputs.get("array", inputs.get("list", []))
        return {"result": len(array) if array is not None else 0}
