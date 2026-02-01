"""Workflow plugin: get dictionary values."""

from ...base import NodeExecutor


class DictValues(NodeExecutor):
    """Get all values from dictionary."""

    node_type = "dict.values"
    category = "dict"
    description = "Get all values from dictionary"

    def execute(self, inputs, runtime=None):
        obj = inputs.get("object", inputs.get("dict", {}))

        if isinstance(obj, dict):
            result = list(obj.values())
        else:
            result = []

        return {"result": result}
