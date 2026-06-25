"""Workflow plugin: find item in list."""

from ...base import NodeExecutor


class ListFind(NodeExecutor):
    """Find first item matching condition."""

    node_type = "list.find"
    category = "list"
    description = "Find first item matching condition"

    def execute(self, inputs, runtime=None):
        items = inputs.get("items", inputs.get("array", []))
        key = inputs.get("key")
        value = inputs.get("value")

        for item in items:
            if isinstance(item, dict) and item.get(key) == value:
                return {"result": item, "found": True}

        return {"result": None, "found": False}
