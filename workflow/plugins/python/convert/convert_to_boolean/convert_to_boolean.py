"""Workflow plugin: convert to boolean."""


def run(_runtime, inputs):
    """Convert value to boolean."""
    value = inputs.get("value")

    if isinstance(value, str):
        return {"result": value.lower() not in ("false", "0", "", "none", "null")}

    return {"result": bool(value)}
