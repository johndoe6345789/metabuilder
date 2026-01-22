"""Workflow plugin: set value in dictionary."""

from ...base import NodeExecutor


class DictSet(NodeExecutor):
    """Set value in dictionary by key."""

    node_type = "dict.set"
    category = "dict"
    description = "Set value in dictionary by key"

    def execute(self, inputs, runtime=None):
        obj = inputs.get("object", inputs.get("dict", {}))
        key = inputs.get("key", inputs.get("path"))
        value = inputs.get("value")

        if not isinstance(obj, dict):
            obj = {}

        result = {**obj, key: value}
        return {"result": result}
