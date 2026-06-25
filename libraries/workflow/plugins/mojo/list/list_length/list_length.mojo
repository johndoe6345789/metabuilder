"""Workflow plugin: get list length.

Returns the number of items in a list.
Input: {"list": [1, 2, 3, 4, 5]}
Output: {"result": 5}
"""

from collections import Dict
from python import PythonObject


struct ListLength:
    """Plugin that gets the length of a list."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the ListLength plugin."""
        self.node_type = "list.length"
        self.category = "list"
        self.description = "Get the number of items in a list"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Get the length of a list.

        Args:
            inputs: Dictionary containing "list" key with the list to measure.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the list length as integer.
        """
        var list_input = inputs.get("list", PythonObject([]))
        var output = Dict[String, PythonObject]()

        var length = len(list_input)

        output["result"] = PythonObject(length)
        return output


fn main():
    """Test the length plugin."""
    var plugin = ListLength()

    var inputs = Dict[String, PythonObject]()
    inputs["list"] = PythonObject([1, 2, 3, 4, 5])

    var result = plugin.execute(inputs)
    print("Length:", result["result"])  # Expected: 5
