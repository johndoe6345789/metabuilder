"""Workflow plugin: add numbers.

Adds two or more numbers together and returns the sum.
Input: {"numbers": [1, 2, 3, ...]}
Output: {"result": 6.0}
"""

from collections import Dict
from python import PythonObject


struct MathAdd:
    """Plugin that adds two or more numbers together."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the MathAdd plugin."""
        self.node_type = "math.add"
        self.category = "math"
        self.description = "Add two or more numbers together"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Add two or more numbers.

        Args:
            inputs: Dictionary containing "numbers" key with a list of numbers.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the sum as Float64.
        """
        var numbers = inputs.get("numbers", PythonObject([]))
        var result: Float64 = 0.0

        for i in range(len(numbers)):
            result += Float64(numbers[i])

        var output = Dict[String, PythonObject]()
        output["result"] = PythonObject(result)
        return output


fn main():
    """Test the add plugin."""
    var plugin = MathAdd()

    var inputs = Dict[String, PythonObject]()
    inputs["numbers"] = PythonObject([1, 2, 3, 4, 5])

    var result = plugin.execute(inputs)
    print("Sum:", result["result"])  # Expected: 15.0
