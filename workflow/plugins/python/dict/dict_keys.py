"""Workflow plugin: get dictionary keys."""


def run(_runtime, inputs):
    """Get all keys from dictionary."""
    obj = inputs.get("object", {})

    if not isinstance(obj, dict):
        return {"result": []}

    return {"result": list(obj.keys())}
