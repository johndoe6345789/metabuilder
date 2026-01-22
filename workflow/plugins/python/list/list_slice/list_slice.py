"""Workflow plugin: slice a list."""

from ...base import NodeExecutor


class ListSlice(NodeExecutor):
    """Extract slice from list."""

    node_type = "list.slice"
    category = "list"
    description = "Extract slice from list"

    def execute(self, inputs, runtime=None):
        array = inputs.get("array", inputs.get("items", inputs.get("list", [])))
        start = inputs.get("start", 0)
        end = inputs.get("end")

        result = array[start:end] if end is not None else array[start:]
        return {"result": result}
