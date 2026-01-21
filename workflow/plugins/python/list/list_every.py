"""Workflow plugin: check if all items match condition."""


def run(_runtime, inputs):
    """Check if all items match condition."""
    items = inputs.get("items", [])
    key = inputs.get("key")
    value = inputs.get("value")

    if not items:
        return {"result": True}

    if key is not None and value is not None:
        result = all(isinstance(item, dict) and item.get(key) == value for item in items)
    else:
        result = all(items)

    return {"result": result}
