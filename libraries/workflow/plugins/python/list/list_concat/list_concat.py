"""Workflow plugin: concatenate lists."""

from ...base import NodeExecutor


class ListConcat(NodeExecutor):
    """Concatenate multiple lists."""

    node_type = "list.concat"
    category = "list"
    description = "Concatenate multiple lists"

    def execute(self, inputs, runtime=None):
        array = inputs.get("array", inputs.get("list", []))
        lists = inputs.get("lists", inputs.get("arrays", [array]))
        result = []
        for lst in lists:
            if isinstance(lst, list):
                result.extend(lst)
        return {"result": result}
