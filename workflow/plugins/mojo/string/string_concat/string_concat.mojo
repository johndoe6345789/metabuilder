"""Workflow plugin: concatenate strings.

Concatenates multiple strings together with an optional separator.
Input: {"strings": ["Hello", "World"], "separator": " "}
Output: {"result": "Hello World"}
"""

from collections import Dict
from python import PythonObject


struct StringConcat:
    """Plugin that concatenates multiple strings with an optional separator."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the StringConcat plugin."""
        self.node_type = "string.concat"
        self.category = "string"
        self.description = "Concatenate multiple strings with optional separator"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Concatenate multiple strings with an optional separator.

        Args:
            inputs: Dictionary containing:
                - "strings": List of strings to concatenate
                - "separator": Optional separator string (default: "")
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the concatenated string.
        """
        var strings = inputs.get("strings", PythonObject([]))
        var separator = String(inputs.get("separator", PythonObject("")))
        var output = Dict[String, PythonObject]()

        var length = len(strings)
        if length == 0:
            output["result"] = PythonObject("")
            return output

        var result = String(strings[0])

        for i in range(1, length):
            result += separator + String(strings[i])

        output["result"] = PythonObject(result)
        return output


fn main():
    """Test the concat plugin."""
    var plugin = StringConcat()

    var inputs = Dict[String, PythonObject]()
    inputs["strings"] = PythonObject(["Hello", "World"])
    inputs["separator"] = PythonObject(" ")

    var result = plugin.execute(inputs)
    print("Concatenated:", result["result"])  # Expected: "Hello World"
