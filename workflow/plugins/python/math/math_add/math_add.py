"""Workflow plugin: add numbers."""


def run(_runtime, inputs):
    """Add two or more numbers."""
    numbers = inputs.get("numbers", [])
    return {"result": sum(numbers)}
