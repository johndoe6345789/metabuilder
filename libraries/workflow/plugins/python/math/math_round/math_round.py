"""Workflow plugin: round number."""

from ...base import NodeExecutor


class MathRound(NodeExecutor):
    """Round to specified decimals."""

    node_type = "math.round"
    category = "math"
    description = "Round to specified decimals"

    def execute(self, inputs, runtime=None):
        try:
            value = float(inputs.get("value", 0))
            decimals = int(inputs.get("decimals", inputs.get("precision", 0)))
            return {"result": round(value, decimals)}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
