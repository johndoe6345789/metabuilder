"""Workflow plugin: boolean not."""

from ...base import NodeExecutor


class Not(NodeExecutor):
    """Negate a boolean value."""

    node_type = "utils.not"
    category = "utils"
    description = "Negate a boolean value"

    def execute(self, inputs, runtime=None):
        """Negate a boolean value."""
        value = inputs.get("value")
        return {"result": not bool(value)}
