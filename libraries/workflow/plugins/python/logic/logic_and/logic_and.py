"""Workflow plugin: logical AND."""

from ...base import NodeExecutor


class LogicAnd(NodeExecutor):
    """Perform logical AND on values."""

    node_type = "logic.and"
    category = "logic"
    description = "Perform logical AND on values"

    def execute(self, inputs, runtime=None):
        values = inputs.get("values", [])
        return {"result": all(values)}
