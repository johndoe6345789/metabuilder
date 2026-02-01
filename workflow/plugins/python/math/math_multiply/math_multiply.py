"""Workflow plugin: multiply numbers."""

from functools import reduce
from operator import mul

from ...base import NodeExecutor


class MathMultiply(NodeExecutor):
    """Multiply numbers together."""

    node_type = "math.multiply"
    category = "math"
    description = "Multiply numbers together"

    def execute(self, inputs, runtime=None):
        numbers = inputs.get("numbers", inputs.get("values", []))
        try:
            result = reduce(mul, (float(n) for n in numbers), 1)
            return {"result": result}
        except (ValueError, TypeError) as e:
            return {"error": str(e)}
