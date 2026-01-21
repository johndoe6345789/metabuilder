"""Workflow plugin: get list length."""


def run(_runtime, inputs):
    """Get length of a list or string."""
    items = inputs.get("items", [])
    return {"result": len(items) if items is not None else 0}
