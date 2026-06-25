"""Workflow plugin: add numbers."""

from ...base import NodeExecutor


class MathAdd(NodeExecutor):
    """Add numbers together."""

    node_type = "math.add"
    category = "math"
    description = "Add numbers together"

    def execute(self, inputs, runtime=None):
        numbers = inputs.get("numbers", inputs.get("values", []))
        try:
            result = sum(float(n) for n in numbers)
            return {"result": result}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
