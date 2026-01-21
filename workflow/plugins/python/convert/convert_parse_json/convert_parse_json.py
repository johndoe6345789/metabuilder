"""Workflow plugin: parse JSON string."""
import json


def run(_runtime, inputs):
    """Parse JSON string to object."""
    text = inputs.get("text", "")

    try:
        result = json.loads(text)
        return {"result": result}
    except json.JSONDecodeError as e:
        return {"result": None, "error": str(e)}
