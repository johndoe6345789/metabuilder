"""Workflow plugin: power operation."""


def run(_runtime, inputs):
    """Calculate a to the power of b."""
    a = inputs.get("a", 0)
    b = inputs.get("b", 1)
    return {"result": a ** b}
