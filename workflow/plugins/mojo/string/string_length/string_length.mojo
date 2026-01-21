# Workflow plugin: get string length
#
# Returns the length of a string.
# Input: {"text": "hello"}
# Output: {"result": 5}

from collections import Dict
from python import PythonObject


fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """Get the length of a string.

    Args:
        inputs: Dictionary containing "text" key with the string to measure.

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
    var inputs = Dict[String, PythonObject]()
    inputs["text"] = PythonObject("hello")

    var result = run(inputs)
    print("Length:", result["result"])  # Expected: 5
