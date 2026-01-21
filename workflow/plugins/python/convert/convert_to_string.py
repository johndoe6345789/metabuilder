"""Workflow plugin: convert to string."""


def run(_runtime, inputs):
    """Convert value to string."""
    value = inputs.get("value")
    return {"result": str(value) if value is not None else ""}
