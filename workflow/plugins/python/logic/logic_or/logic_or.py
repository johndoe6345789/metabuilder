"""Workflow plugin: logical OR."""

from ...base import NodeExecutor


class LogicOr(NodeExecutor):
    """Perform logical OR on values."""

    node_type = "logic.or"
    category = "logic"
    description = "Perform logical OR on values"

    def execute(self, inputs, runtime=None):
        values = inputs.get("values", [])
        return {"result": any(values)}
