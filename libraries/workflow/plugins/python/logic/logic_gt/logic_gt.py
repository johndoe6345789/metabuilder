"""Workflow plugin: greater than comparison."""

from ...base import NodeExecutor


class LogicGt(NodeExecutor):
    """Check if a > b."""

    node_type = "logic.gt"
    category = "logic"
    description = "Check if a > b"

    def execute(self, inputs, runtime=None):
        a = inputs.get("a")
        b = inputs.get("b")
        return {"result": a > b}
