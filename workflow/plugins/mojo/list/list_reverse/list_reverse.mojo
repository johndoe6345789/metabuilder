"""Workflow plugin: reverse a list.

Reverses the order of items in a list.
Input: {"list": [1, 2, 3, 4, 5]}
Output: {"result": [5, 4, 3, 2, 1]}
"""

from collections import Dict
from python import PythonObject, Python


struct ListReverse:
    """Plugin that reverses the order of items in a list."""

    var node_type: String
    var category: String
    var description: String

    fn __init__(inout self):
        """Initialize the ListReverse plugin."""
        self.node_type = "list.reverse"
        self.category = "list"
        self.description = "Reverse the order of items in a list"

    fn execute(self, inputs: Dict[String, PythonObject], runtime: PythonObject = PythonObject(None)) -> Dict[String, PythonObject]:
        """Reverse the order of items in a list.

        Args:
            inputs: Dictionary containing "list" key with the list to reverse.
            runtime: Optional runtime context (unused).

        Returns:
            Dictionary with "result" key containing the reversed list.
        """
        var list_input = inputs.get("list", PythonObject([]))
        var output = Dict[String, PythonObject]()

        # Use Python to create reversed list for flexibility with mixed types
        var py = Python.import_module("builtins")
        var result = py.list()

        var length = len(list_input)

        # Build reversed list
        for i in range(length - 1, -1, -1):
            result.append(list_input[i])

        output["result"] = result
        return output


fn main():
    """Test the reverse plugin."""
    var plugin = ListReverse()

    var inputs = Dict[String, PythonObject]()
    inputs["list"] = PythonObject([1, 2, 3, 4, 5])

    var result = plugin.execute(inputs)
    print("Reversed:", result["result"])  # Expected: [5, 4, 3, 2, 1]
