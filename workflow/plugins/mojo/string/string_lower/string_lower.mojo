"""Workflow plugin: convert string to lowercase.

Converts a string to all lowercase characters.
Input: {"text": "HELLO WORLD"}
Output: {"result": "hello world"}
"""

from collections import Dict
from python import PythonObject


struct StringLower:
    """Plugin that converts a string to lowercase."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the StringLower plugin."""
        self.node_type = "string.lower"
        self.category = "string"
        self.description = "Convert a string to lowercase"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Convert a string to lowercase.

        Args:
            inputs: Dictionary containing "text" key with the string to convert.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the lowercase string.
        """
        var text = String(inputs.get("text", PythonObject("")))
        var output = Dict[String, PythonObject]()

        # Convert to lowercase using Python interop for full Unicode support
        var py_text = PythonObject(text)
        var lower_text = py_text.lower()

        output["result"] = lower_text
        return output


fn main():
    """Test the lower plugin."""
    var plugin = StringLower()

    var inputs = Dict[String, PythonObject]()
    inputs["text"] = PythonObject("HELLO WORLD")

    var result = plugin.execute(inputs)
    print("Lowercase:", result["result"])  # Expected: "hello world"
