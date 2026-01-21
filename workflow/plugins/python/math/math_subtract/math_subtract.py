"""Workflow plugin: subtract numbers."""


def run(_runtime, inputs):
    """Subtract b from a."""
    a = inputs.get("a", 0)
    b = inputs.get("b", 0)
    return {"result": a - b}
