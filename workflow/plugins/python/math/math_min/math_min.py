"""Workflow plugin: minimum value."""


def run(_runtime, inputs):
    """Find minimum value in numbers."""
    numbers = inputs.get("numbers", [])

    if not numbers:
        return {"result": None}

    return {"result": min(numbers)}
