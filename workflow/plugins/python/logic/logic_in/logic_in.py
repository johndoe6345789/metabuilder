"""Workflow plugin: membership test."""

from ...base import NodeExecutor


class LogicIn(NodeExecutor):
    """Check if value is in collection."""

    node_type = "logic.in"
    category = "logic"
    description = "Check if value is in collection"

    def execute(self, inputs, runtime=None):
        value = inputs.get("value")
        collection = inputs.get("collection", inputs.get("array", []))
        return {"result": value in collection}
