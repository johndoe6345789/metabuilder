"""Workflow plugin: sort a list."""


def run(_runtime, inputs):
    """Sort list by key or naturally."""
    items = inputs.get("items", [])
    key = inputs.get("key")
    reverse = inputs.get("reverse", False)

    try:
        if key:
            result = sorted(items, key=lambda x: x.get(key) if isinstance(x, dict) else x, reverse=reverse)
        else:
            result = sorted(items, reverse=reverse)
        return {"result": result}
    except (TypeError, AttributeError):
        return {"result": items, "error": "Cannot sort items"}
