"""Workflow plugin: maximum value."""


def run(_runtime, inputs):
    """Find maximum value in numbers."""
    numbers = inputs.get("numbers", [])

    if not numbers:
        return {"result": None}

    return {"result": max(numbers)}
