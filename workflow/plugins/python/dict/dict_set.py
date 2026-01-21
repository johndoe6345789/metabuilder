"""Workflow plugin: set value in dictionary."""


def run(_runtime, inputs):
    """Set value in dictionary by key."""
    obj = inputs.get("object", {})
    key = inputs.get("key")
    value = inputs.get("value")

    if not isinstance(obj, dict):
        obj = {}

    result = dict(obj)
    result[key] = value
    return {"result": result}
