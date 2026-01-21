"""Workflow plugin: check if some items match condition."""


def run(_runtime, inputs):
    """Check if at least one item matches condition."""
    items = inputs.get("items", [])
    key = inputs.get("key")
    value = inputs.get("value")

    if key is not None and value is not None:
        result = any(isinstance(item, dict) and item.get(key) == value for item in items)
    else:
        result = any(items)

    return {"result": result}
