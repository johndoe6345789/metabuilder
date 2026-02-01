"""Workflow plugin: map list."""

from ...base import NodeExecutor


class MapList(NodeExecutor):
    """Map items to formatted strings."""

    node_type = "utils.map_list"
    category = "utils"
    description = "Map items to formatted strings"

    def execute(self, inputs, runtime=None):
        """Map items to formatted strings."""
        items = inputs.get("items", [])
        if not isinstance(items, list):
            items = [items] if items else []

        template = inputs.get("template", "{item}")
        mapped = []

        for item in items:
            try:
                mapped.append(template.format(item=item))
            except Exception:
                mapped.append(str(item))

        return {"items": mapped}
