"""Workflow plugin: boolean not."""


def run(_runtime, inputs):
    """Negate a boolean value."""
    value = inputs.get("value")
    return {"result": not bool(value)}
