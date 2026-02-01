"""Workflow plugin: get string length.

Returns the length of a string.
Input: {"text": "hello"}
Output: {"result": 5}
"""

from collections import Dict
from python import PythonObject


struct StringLength:
    """Plugin that gets the length of a string."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the StringLength plugin."""
        self.node_type = "string.length"
        self.category = "string"
        self.description = "Get the length of a string"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Get the length of a string.

        Args:
            inputs: Dictionary containing "text" key with the string to measure.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the string length as integer.
        """
        var text = String(inputs.get("text", PythonObject("")))
        var output = Dict[String, PythonObject]()

        var length = len(text)

        output["result"] = PythonObject(length)
        return output


fn main():
    """Test the length plugin."""
    var plugin = StringLength()

    var inputs = Dict[String, PythonObject]()
    inputs["text"] = PythonObject("hello")

    var result = plugin.execute(inputs)
    print("Length:", result["result"])  # Expected: 5
