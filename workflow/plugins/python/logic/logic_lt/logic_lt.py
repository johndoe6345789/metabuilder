"""Workflow plugin: less than comparison."""

from ...base import NodeExecutor


class LogicLt(NodeExecutor):
    """Check if a < b."""

    node_type = "logic.lt"
    category = "logic"
    description = "Check if a < b"

    def execute(self, inputs, runtime=None):
        a = inputs.get("a")
        b = inputs.get("b")
        return {"result": a < b}
