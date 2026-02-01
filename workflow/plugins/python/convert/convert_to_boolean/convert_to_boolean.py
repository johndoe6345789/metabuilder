"""Workflow plugin: convert to boolean."""

from ...base import NodeExecutor


class ConvertToBoolean(NodeExecutor):
    """Convert value to boolean."""

    node_type = "convert.toBoolean"
    category = "convert"
    description = "Convert value to boolean"

    def execute(self, inputs, runtime=None):
        value = inputs.get("value")
        if isinstance(value, str):
            return {"result": value.lower() not in ("false", "0", "", "none", "null")}
        return {"result": bool(value)}
