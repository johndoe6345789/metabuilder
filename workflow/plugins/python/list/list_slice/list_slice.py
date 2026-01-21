"""Workflow plugin: slice a list."""


def run(_runtime, inputs):
    """Extract slice from list."""
    items = inputs.get("items", [])
    start = inputs.get("start", 0)
    end = inputs.get("end")

    if end is None:
        result = items[start:]
    else:
        result = items[start:end]

    return {"result": result}
