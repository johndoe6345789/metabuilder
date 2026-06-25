"""Workflow plugin: convert string to uppercase.

Converts a string to all uppercase characters.
Input: {"text": "hello world"}
Output: {"result": "HELLO WORLD"}
"""

from collections import Dict
from python import PythonObject


struct StringUpper:
    """Plugin that converts a string to uppercase."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the StringUpper plugin."""
        self.node_type = "string.upper"
        self.category = "string"
        self.description = "Convert a string to uppercase"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Convert a string to uppercase.

        Args:
            inputs: Dictionary containing "text" key with the string to convert.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the uppercase string.
        """
        var text = String(inputs.get("text", PythonObject("")))
        var output = Dict[String, PythonObject]()

        # Convert to uppercase using Python interop for full Unicode support
        var py_text = PythonObject(text)
        var upper_text = py_text.upper()

        output["result"] = upper_text
        return output


fn main():
    """Test the upper plugin."""
    var plugin = StringUpper()

    var inputs = Dict[String, PythonObject]()
    inputs["text"] = PythonObject("hello world")

    var result = plugin.execute(inputs)
    print("Uppercase:", result["result"])  # Expected: "HELLO WORLD"
