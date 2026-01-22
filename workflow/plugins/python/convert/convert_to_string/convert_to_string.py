"""Workflow plugin: convert to string."""

from ...base import NodeExecutor


class ConvertToString(NodeExecutor):
    """Convert value to string."""

    node_type = "convert.toString"
    category = "convert"
    description = "Convert value to string"

    def execute(self, inputs, runtime=None):
        value = inputs.get("value")
        return {"result": str(value) if value is not None else ""}
