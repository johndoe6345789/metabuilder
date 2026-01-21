"""Workflow plugin: convert to JSON string."""
import json


def run(_runtime, inputs):
    """Convert value to JSON string."""
    value = inputs.get("value")
    indent = inputs.get("indent")

    try:
        result = json.dumps(value, indent=indent)
        return {"result": result}
    except (TypeError, ValueError) as e:
        return {"result": None, "error": str(e)}
