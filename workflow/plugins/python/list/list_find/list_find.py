"""Workflow plugin: find item in list."""


def run(_runtime, inputs):
    """Find first item matching condition."""
    items = inputs.get("items", [])
    key = inputs.get("key")
    value = inputs.get("value")

    for item in items:
        if isinstance(item, dict) and item.get(key) == value:
            return {"result": item, "found": True}

    return {"result": None, "found": False}
