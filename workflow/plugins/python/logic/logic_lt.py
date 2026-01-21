"""Workflow plugin: less than comparison."""


def run(_runtime, inputs):
    """Check if a < b."""
    a = inputs.get("a")
    b = inputs.get("b")
    return {"result": a < b}
