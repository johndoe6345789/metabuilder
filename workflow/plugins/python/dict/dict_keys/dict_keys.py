"""Workflow plugin: get dictionary keys."""

from ...base import NodeExecutor


class DictKeys(NodeExecutor):
    """Get all keys from dictionary."""

    node_type = "dict.keys"
    category = "dict"
    description = "Get all keys from dictionary"

    def execute(self, inputs, runtime=None):
        obj = inputs.get("object", inputs.get("dict", {}))

        if isinstance(obj, dict):
            result = list(obj.keys())
        else:
            result = []

        return {"result": result}
