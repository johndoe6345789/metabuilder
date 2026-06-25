"""Workflow plugin: minimum value."""

from ...base import NodeExecutor


class MathMin(NodeExecutor):
    """Get minimum of values."""

    node_type = "math.min"
    category = "math"
    description = "Get minimum of values"

    def execute(self, inputs, runtime=None):
        numbers = inputs.get("numbers", inputs.get("values", []))
        try:
            result = min(float(n) for n in numbers)
            return {"result": result}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
