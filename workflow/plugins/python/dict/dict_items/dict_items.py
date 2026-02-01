"""Workflow plugin: get dictionary items as key-value pairs."""

from ...base import NodeExecutor


class DictItems(NodeExecutor):
    """Get dictionary items as list of [key, value] pairs."""

    node_type = "dict.items"
    category = "dict"
    description = "Get dictionary items as list of [key, value] pairs"

    def execute(self, inputs, runtime=None):
        obj = inputs.get("object", inputs.get("dict", {}))

        if isinstance(obj, dict):
            result = [[k, v] for k, v in obj.items()]
        else:
            result = []

        return {"result": result}
