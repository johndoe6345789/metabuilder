"""Workflow plugin: absolute value."""

from ...base import NodeExecutor


class MathAbs(NodeExecutor):
    """Get absolute value."""

    node_type = "math.abs"
    category = "math"
    description = "Get absolute value"

    def execute(self, inputs, runtime=None):
        try:
            value = float(inputs.get("value", 0))
            return {"result": abs(value)}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
