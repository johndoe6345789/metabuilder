"""Workflow plugin: set variable in workflow store."""

from ...base import NodeExecutor


class VarSet(NodeExecutor):
    """Set a variable value in the workflow store."""

    node_type = "var.set"
    category = "var"
    description = "Set variable in workflow store"

    def execute(self, inputs, runtime=None):
        """Set variable value in workflow store."""
        key = inputs.get("key")
        value = inputs.get("value")

        if key is None:
            return {"result": None, "key": None, "error": "key is required"}

        runtime.store[key] = value

        return {"result": value, "key": key}
