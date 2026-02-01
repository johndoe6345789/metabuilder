"""Workflow plugin: check if variable exists in workflow store."""

from ...base import NodeExecutor


class VarExists(NodeExecutor):
    """Check if a variable exists in the workflow store."""

    node_type = "var.exists"
    category = "var"
    description = "Check if variable exists in workflow store"

    def execute(self, inputs, runtime=None):
        """Check if variable exists in workflow store."""
        key = inputs.get("key")

        if key is None:
            return {"result": False, "error": "key is required"}

        exists = key in runtime.store

        return {"result": exists}
