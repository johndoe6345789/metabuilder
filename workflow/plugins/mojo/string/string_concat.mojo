# Workflow plugin: concatenate strings
#
# Concatenates multiple strings together with an optional separator.
# Input: {"strings": ["Hello", "World"], "separator": " "}
# Output: {"result": "Hello World"}

from collections import Dict
from python import PythonObject


fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """Concatenate multiple strings with an optional separator.

    Args:
        inputs: Dictionary containing:
            - "strings": List of strings to concatenate
            - "separator": Optional separator string (default: "")

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
    var inputs = Dict[String, PythonObject]()
    inputs["strings"] = PythonObject(["Hello", "World"])
    inputs["separator"] = PythonObject(" ")

    var result = run(inputs)
    print("Concatenated:", result["result"])  # Expected: "Hello World"
