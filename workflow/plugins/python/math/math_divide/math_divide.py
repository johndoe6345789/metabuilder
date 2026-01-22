"""Workflow plugin: divide numbers."""

from ...base import NodeExecutor


class MathDivide(NodeExecutor):
    """Divide a by b."""

    node_type = "math.divide"
    category = "math"
    description = "Divide a by b"

    def execute(self, inputs, runtime=None):
        try:
            a = float(inputs.get("a", 0))
            b = float(inputs.get("b", 0))
            if b == 0:
                return {"error": "Division by zero"}
            return {"result": a / b}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
