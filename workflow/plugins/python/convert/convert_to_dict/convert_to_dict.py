"""Workflow plugin: convert to dictionary."""

from ...base import NodeExecutor


class ConvertToDict(NodeExecutor):
    """Convert value to dictionary."""

    node_type = "convert.toDict"
    category = "convert"
    description = "Convert value to dictionary"

    def execute(self, inputs, runtime=None):
        value = inputs.get("value")

        if isinstance(value, dict):
            return {"result": value}
        elif isinstance(value, list):
            # Convert list of [key, value] pairs to dict
            try:
                return {"result": dict(value)}
            except (TypeError, ValueError):
                return {"result": {}, "error": "Cannot convert list to dict"}
        else:
            return {"result": {}}
