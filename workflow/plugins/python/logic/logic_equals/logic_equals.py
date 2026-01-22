"""Workflow plugin: equality comparison."""

from ...base import NodeExecutor


class LogicEquals(NodeExecutor):
    """Check if two values are equal."""

    node_type = "logic.equals"
    category = "logic"
    description = "Check if two values are equal"

    def execute(self, inputs, runtime=None):
        a = inputs.get("a")
        b = inputs.get("b")
        return {"result": a == b}
