"""Workflow plugin: check if some items match condition."""

from ...base import NodeExecutor


class ListSome(NodeExecutor):
    """Check if some items match condition."""

    node_type = "list.some"
    category = "list"
    description = "Check if some items match condition"

    def execute(self, inputs, runtime=None):
        items = inputs.get("items", inputs.get("array", []))
        key = inputs.get("key")
        value = inputs.get("value")

        if key is not None and value is not None:
            result = any(isinstance(item, dict) and item.get(key) == value for item in items)
        else:
            result = any(items)

        return {"result": result}
