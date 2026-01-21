"""Workflow plugin: get dictionary values."""


def run(_runtime, inputs):
    """Get all values from dictionary."""
    obj = inputs.get("object", {})

    if not isinstance(obj, dict):
        return {"result": []}

    return {"result": list(obj.values())}
