"""Workflow plugin: maximum value."""

from ...base import NodeExecutor


class MathMax(NodeExecutor):
    """Get maximum of values."""

    node_type = "math.max"
    category = "math"
    description = "Get maximum of values"

    def execute(self, inputs, runtime=None):
        numbers = inputs.get("numbers", inputs.get("values", []))
        try:
            result = max(float(n) for n in numbers)
            return {"result": result}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
