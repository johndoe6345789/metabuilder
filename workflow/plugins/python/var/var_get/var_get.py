"""Workflow plugin: get variable from workflow store."""

from ...base import NodeExecutor


class VarGet(NodeExecutor):
    """Get a variable value from the workflow store."""

    node_type = "var.get"
    category = "var"
    description = "Get variable from workflow store"

    def execute(self, inputs, runtime=None):
        """Get variable value from workflow store."""
        key = inputs.get("key")
        default = inputs.get("default")

        if key is None:
            return {"result": default, "exists": False, "error": "key is required"}

        exists = key in runtime.store
        value = runtime.store.get(key, default)

        return {"result": value, "exists": exists}
