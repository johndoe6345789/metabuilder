# Workflow plugin: concatenate lists
#
# Concatenates multiple lists into a single list.
# Input: {"lists": [[1, 2], [3, 4], [5]]}
# Output: {"result": [1, 2, 3, 4, 5]}

from collections import Dict
from python import PythonObject, Python


fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """Concatenate multiple lists into one.

    Args:
        inputs: Dictionary containing "lists" key with a list of lists.

    Returns:
        Dictionary with "result" key containing the concatenated list.
    """
    var lists = inputs.get("lists", PythonObject([]))
    var output = Dict[String, PythonObject]()

    # Use Python to concatenate lists for flexibility with mixed types
    var py = Python.import_module("builtins")
    var result = py.list()

    var num_lists = len(lists)
    for i in range(num_lists):
        var current_list = lists[i]
        var list_len = len(current_list)
        for j in range(list_len):
            result.append(current_list[j])

    output["result"] = result
    return output


fn main():
    """Test the concat plugin."""
    var inputs = Dict[String, PythonObject]()
    inputs["lists"] = PythonObject([[1, 2], [3, 4], [5]])

    var result = run(inputs)
    print("Concatenated:", result["result"])  # Expected: [1, 2, 3, 4, 5]
