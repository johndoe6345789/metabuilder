"""Workflow plugin: sort a list."""

from ...base import NodeExecutor


class ListSort(NodeExecutor):
    """Sort list by key or naturally."""

    node_type = "list.sort"
    category = "list"
    description = "Sort list by key or naturally"

    def execute(self, inputs, runtime=None):
        items = inputs.get("items", inputs.get("array", []))
        key = inputs.get("key")
        reverse = inputs.get("reverse", inputs.get("order") == "desc")

        try:
            if key:
                result = sorted(
                    items,
                    key=lambda x: x.get(key) if isinstance(x, dict) else x,
                    reverse=reverse,
                )
            else:
                result = sorted(items, reverse=reverse)
            return {"result": result}
        except (TypeError, AttributeError):
            return {"result": items, "error": "Cannot sort items"}
