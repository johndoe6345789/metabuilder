# Workflow plugin: convert string to uppercase
#
# Converts a string to all uppercase characters.
# Input: {"text": "hello world"}
# Output: {"result": "HELLO WORLD"}

from collections import Dict
from python import PythonObject


fn run(inputs: Dict[String, PythonObject]) -> Dict[String, PythonObject]:
    """Convert a string to uppercase.

    Args:
        inputs: Dictionary containing "text" key with the string to convert.

    Returns:
        Dictionary with "result" key containing the uppercase string.
    """
    var text = String(inputs.get("text", PythonObject("")))
    var output = Dict[String, PythonObject]()

    # Convert to uppercase using Python interop for full Unicode support
    var py_text = PythonObject(text)
    var upper_text = py_text.upper()

    output["result"] = upper_text
    return output


fn main():
    """Test the upper plugin."""
    var inputs = Dict[String, PythonObject]()
    inputs["text"] = PythonObject("hello world")

    var result = run(inputs)
    print("Uppercase:", result["result"])  # Expected: "HELLO WORLD"
