"""Workflow plugin: divide numbers.

Divides numbers sequentially from the first number.
Input: {"numbers": [100, 2, 5]}
Output: {"result": 10.0}  (100 / 2 / 5 = 10)
"""

from collections import Dict
from python import PythonObject


struct MathDivide:
    """Plugin that divides numbers sequentially from the first number."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the MathDivide plugin."""
        self.node_type = "math.divide"
        self.category = "math"
        self.description = "Divide numbers sequentially from the first number"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Divide numbers sequentially from the first number.

        Args:
            inputs: Dictionary containing "numbers" key with a list of numbers.
                    The first number is the dividend, subsequent numbers are divisors.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the quotient as Float64,
            or "error" key if division by zero is attempted.
        """
        var numbers = inputs.get("numbers", PythonObject([]))
        var output = Dict[String, PythonObject]()

        var length = len(numbers)
        if length == 0:
            output["result"] = PythonObject(0.0)
            return output

        var result: Float64 = Float64(numbers[0])

        for i in range(1, length):
            var divisor = Float64(numbers[i])
            if divisor == 0.0:
                output["error"] = PythonObject("Division by zero")
                return output
            result /= divisor

        output["result"] = PythonObject(result)
        return output


fn main():
    """Test the divide plugin."""
    var plugin = MathDivide()

    var inputs = Dict[String, PythonObject]()
    inputs["numbers"] = PythonObject([100, 2, 5])

    var result = plugin.execute(inputs)
    if "error" in result:
        print("Error:", result["error"])
    else:
        print("Quotient:", result["result"])  # Expected: 10.0
