"""Workflow plugin: delete variable from workflow store."""

from ...base import NodeExecutor


class VarDelete(NodeExecutor):
    """Delete a variable from the workflow store."""

    node_type = "var.delete"
    category = "var"
    description = "Delete variable from workflow store"

    def execute(self, inputs, runtime=None):
        """Delete variable from workflow store."""
        key = inputs.get("key")

        if key is None:
            return {"result": False, "deleted": False, "error": "key is required"}

        if key in runtime.store:
            del runtime.store[key]
            return {"result": True, "deleted": True}

        return {"result": False, "deleted": False}
