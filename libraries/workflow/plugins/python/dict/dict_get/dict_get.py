"""Workflow plugin: get value from dictionary."""

from ...base import NodeExecutor


class DictGet(NodeExecutor):
    """Get value from dictionary by key."""

    node_type = "dict.get"
    category = "dict"
    description = "Get value from dictionary by key"

    def execute(self, inputs, runtime=None):
        obj = inputs.get("object", inputs.get("dict", {}))
        key = inputs.get("key", inputs.get("path"))
        default = inputs.get("default")

        if not isinstance(obj, dict):
            return {"result": default, "found": False}

        # Support dot notation paths
        if key and "." in key:
            parts = key.split(".")
            current = obj
            for part in parts:
                if isinstance(current, dict):
                    current = current.get(part)
                else:
                    return {"result": default, "found": False}
            return {"result": current if current is not None else default, "found": current is not None}

        result = obj.get(key, default)
        return {"result": result, "found": key in obj}
