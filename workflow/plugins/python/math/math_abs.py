"""Workflow plugin: absolute value."""


def run(_runtime, inputs):
    """Calculate absolute value."""
    value = inputs.get("value", 0)
    return {"result": abs(value)}
