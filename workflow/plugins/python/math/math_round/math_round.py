"""Workflow plugin: round number."""


def run(_runtime, inputs):
    """Round number to specified precision."""
    value = inputs.get("value", 0)
    precision = inputs.get("precision", 0)
    return {"result": round(value, precision)}
