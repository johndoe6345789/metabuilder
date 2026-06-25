"""Workflow plugin: modulo operation."""

from ...base import NodeExecutor


class MathModulo(NodeExecutor):
    """Calculate a modulo b."""

    node_type = "math.modulo"
    category = "math"
    description = "Calculate a modulo b"

    def execute(self, inputs, runtime=None):
        try:
            a = float(inputs.get("a", 0))
            b = float(inputs.get("b", 0))
            if b == 0:
                return {"error": "Modulo by zero"}
            return {"result": a % b}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
