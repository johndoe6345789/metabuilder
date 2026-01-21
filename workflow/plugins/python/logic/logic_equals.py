"""Workflow plugin: equality comparison."""


def run(_runtime, inputs):
    """Check if two values are equal."""
    a = inputs.get("a")
    b = inputs.get("b")
    return {"result": a == b}
