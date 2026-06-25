"""Workflow plugin: greater than or equal comparison."""

from ...base import NodeExecutor


class LogicGte(NodeExecutor):
    """Check if a >= b."""

    node_type = "logic.gte"
    category = "logic"
    description = "Check if a >= b"

    def execute(self, inputs, runtime=None):
        a = inputs.get("a")
        b = inputs.get("b")
        return {"result": a >= b}
