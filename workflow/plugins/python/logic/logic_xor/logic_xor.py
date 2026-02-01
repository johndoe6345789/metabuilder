"""Workflow plugin: logical XOR."""

from ...base import NodeExecutor


class LogicXor(NodeExecutor):
    """Perform logical XOR on two values."""

    node_type = "logic.xor"
    category = "logic"
    description = "Perform logical XOR on two values"

    def execute(self, inputs, runtime=None):
        a = bool(inputs.get("a", False))
        b = bool(inputs.get("b", False))
        return {"result": a != b}
