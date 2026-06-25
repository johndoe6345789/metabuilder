"""Workflow plugin: multiply numbers.

Multiplies two or more numbers together and returns the product.
Input: {"numbers": [2, 3, 4]}
Output: {"result": 24.0}
"""

from collections import Dict
from python import PythonObject


struct MathMultiply:
    """Plugin that multiplies two or more numbers together."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the MathMultiply plugin."""
        self.node_type = "math.multiply"
        self.category = "math"
        self.description = "Multiply two or more numbers together"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Multiply two or more numbers.

        Args:
            inputs: Dictionary containing "numbers" key with a list of numbers.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the product as Float64.
        """
        var numbers = inputs.get("numbers", PythonObject([]))
        var output = Dict[String, PythonObject]()

        var length = len(numbers)
        if length == 0:
            output["result"] = PythonObject(0.0)
            return output

        var result: Float64 = 1.0

        for i in range(length):
            result *= Float64(numbers[i])

        output["result"] = PythonObject(result)
        return output


fn main():
    """Test the multiply plugin."""
    var plugin = MathMultiply()

    var inputs = Dict[String, PythonObject]()
    inputs["numbers"] = PythonObject([2, 3, 4])

    var result = plugin.execute(inputs)
    print("Product:", result["result"])  # Expected: 24.0
