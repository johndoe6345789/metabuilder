"""Workflow plugin: convert to number."""

from ...base import NodeExecutor


class ConvertToNumber(NodeExecutor):
    """Convert value to number."""

    node_type = "convert.toNumber"
    category = "convert"
    description = "Convert value to number"

    def execute(self, inputs, runtime=None):
        value = inputs.get("value")
        default = inputs.get("default", 0)
        try:
            if isinstance(value, str) and "." in value:
                return {"result": float(value)}
            return {"result": int(value)}
        except (ValueError, TypeError):
            return {"result": default, "error": "Cannot convert to number"}
