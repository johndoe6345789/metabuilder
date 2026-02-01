"""Workflow plugin: subtract numbers."""

from ...base import NodeExecutor


class MathSubtract(NodeExecutor):
    """Subtract b from a."""

    node_type = "math.subtract"
    category = "math"
    description = "Subtract b from a"

    def execute(self, inputs, runtime=None):
        try:
            a = float(inputs.get("a", 0))
            b = float(inputs.get("b", 0))
            return {"result": a - b}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
