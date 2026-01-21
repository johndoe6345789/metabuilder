"""Workflow plugin: logical AND."""


def run(_runtime, inputs):
    """Perform logical AND on values."""
    values = inputs.get("values", [])
    return {"result": all(values)}
