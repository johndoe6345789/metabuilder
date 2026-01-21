"""Workflow plugin: get value from dictionary."""


def run(_runtime, inputs):
    """Get value from dictionary by key."""
    obj = inputs.get("object", {})
    key = inputs.get("key")
    default = inputs.get("default")

    if not isinstance(obj, dict):
        return {"result": default, "found": False}

    result = obj.get(key, default)
    return {"result": result, "found": key in obj}
