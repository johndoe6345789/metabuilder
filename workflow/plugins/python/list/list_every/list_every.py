"""Workflow plugin: check if all items match condition."""

from ...base import NodeExecutor


class ListEvery(NodeExecutor):
    """Check if all items match condition."""

    node_type = "list.every"
    category = "list"
    description = "Check if all items match condition"

    def execute(self, inputs, runtime=None):
        items = inputs.get("items", inputs.get("array", []))
        key = inputs.get("key")
        value = inputs.get("value")

        if not items:
            return {"result": True}

        if key is not None and value is not None:
            result = all(isinstance(item, dict) and item.get(key) == value for item in items)
        else:
            result = all(items)

        return {"result": result}
