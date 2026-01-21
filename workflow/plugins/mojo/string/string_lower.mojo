# Workflow plugin: convert string to lowercase
#
# Converts a string to all lowercase characters.
# Input: {"text": "HELLO WORLD"}
# Output: {"result": "hello world"}

from collections import Dict
from python import PythonObject


fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """Convert a string to lowercase.

    Args:
        inputs: Dictionary containing "text" key with the string to convert.

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
    var inputs = Dict[String, PythonObject]()
    inputs["text"] = PythonObject("HELLO WORLD")

    var result = run(inputs)
    print("Lowercase:", result["result"])  # Expected: "hello world"
