"""Workflow plugin: convert to list."""

from ...base import NodeExecutor


class ConvertToList(NodeExecutor):
    """Convert value to list."""

    node_type = "convert.toList"
    category = "convert"
    description = "Convert value to list"

    def execute(self, inputs, runtime=None):
        value = inputs.get("value")

        if isinstance(value, list):
            return {"result": value}
        elif isinstance(value, (tuple, set)):
            return {"result": list(value)}
        elif isinstance(value, dict):
            return {"result": list(value.items())}
        elif value is None:
            return {"result": []}
        else:
            return {"result": [value]}
