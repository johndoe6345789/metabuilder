"""Workflow plugin: subtract numbers.

Subtracts numbers sequentially from the first number.
Input: {"numbers": [10, 3, 2]}
Output: {"result": 5.0}  (10 - 3 - 2 = 5)
"""

from collections import Dict
from python import PythonObject


struct MathSubtract:
    """Plugin that subtracts numbers sequentially from the first number."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the MathSubtract plugin."""
        self.node_type = "math.subtract"
        self.category = "math"
        self.description = "Subtract numbers sequentially from the first number"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Subtract numbers sequentially from the first number.

        Args:
            inputs: Dictionary containing "numbers" key with a list of numbers.
                    The first number is the starting value, subsequent numbers
                    are subtracted from it.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the difference as Float64.
        """
        var numbers = inputs.get("numbers", PythonObject([]))
        var output = Dict[String, PythonObject]()

        var length = len(numbers)
        if length == 0:
            output["result"] = PythonObject(0.0)
            return output

        var result: Float64 = Float64(numbers[0])

        for i in range(1, length):
            result -= Float64(numbers[i])

        output["result"] = PythonObject(result)
        return output


fn main():
    """Test the subtract plugin."""
    var plugin = MathSubtract()

    var inputs = Dict[String, PythonObject]()
    inputs["numbers"] = PythonObject([10, 3, 2])

    var result = plugin.execute(inputs)
    print("Difference:", result["result"])  # Expected: 5.0
