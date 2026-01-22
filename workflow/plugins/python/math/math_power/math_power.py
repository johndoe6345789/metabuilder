"""Workflow plugin: power operation."""

from ...base import NodeExecutor


class MathPower(NodeExecutor):
    """Raise base to exponent power."""

    node_type = "math.power"
    category = "math"
    description = "Raise base to exponent power"

    def execute(self, inputs, runtime=None):
        try:
            a = float(inputs.get("a", inputs.get("base", 0)))
            b = float(inputs.get("b", inputs.get("exponent", 0)))
            return {"result": a**b}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
