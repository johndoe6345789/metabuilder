# Workflow plugin: get list length
#
# Returns the number of items in a list.
# Input: {"list": [1, 2, 3, 4, 5]}
# Output: {"result": 5}

from collections import Dict
from python import PythonObject


fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """Get the length of a list.

    Args:
        inputs: Dictionary containing "list" key with the list to measure.

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
    var inputs = Dict[String, PythonObject]()
    inputs["list"] = PythonObject([1, 2, 3, 4, 5])

    var result = run(inputs)
    print("Length:", result["result"])  # Expected: 5
