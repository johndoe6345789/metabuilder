"""Workflow plugin: merge dictionaries."""

from ...base import NodeExecutor


class DictMerge(NodeExecutor):
    """Merge multiple dictionaries."""

    node_type = "dict.merge"
    category = "dict"
    description = "Merge multiple dictionaries"

    def execute(self, inputs, runtime=None):
        objects = inputs.get("objects", [])
        result = {}
        for obj in objects:
            if isinstance(obj, dict):
                result.update(obj)
        return {"result": result}
