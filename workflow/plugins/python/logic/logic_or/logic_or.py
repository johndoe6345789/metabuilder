"""Workflow plugin: logical OR."""


def run(_runtime, inputs):
    """Perform logical OR on values."""
    values = inputs.get("values", [])
    return {"result": any(values)}
