# Workflow plugin: reverse a list
#
# Reverses the order of items in a list.
# Input: {"list": [1, 2, 3, 4, 5]}
# Output: {"result": [5, 4, 3, 2, 1]}

from collections import Dict
from python import PythonObject, Python


fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """Reverse the order of items in a list.

    Args:
        inputs: Dictionary containing "list" key with the list to reverse.

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
    var inputs = Dict[String, PythonObject]()
    inputs["list"] = PythonObject([1, 2, 3, 4, 5])

    var result = run(inputs)
    print("Reversed:", result["result"])  # Expected: [5, 4, 3, 2, 1]
