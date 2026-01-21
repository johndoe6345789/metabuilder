"""Workflow plugin: get dictionary items as key-value pairs."""


def run(_runtime, inputs):
    """Get dictionary items as list of [key, value] pairs."""
    obj = inputs.get("object", {})

    if not isinstance(obj, dict):
        return {"result": []}

    return {"result": [[k, v] for k, v in obj.items()]}
