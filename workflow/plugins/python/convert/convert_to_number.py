"""Workflow plugin: convert to number."""


def run(_runtime, inputs):
    """Convert value to number."""
    value = inputs.get("value")
    default = inputs.get("default", 0)

    try:
        if isinstance(value, str) and "." in value:
            return {"result": float(value)}
        return {"result": int(value)}
    except (ValueError, TypeError):
        return {"result": default, "error": "Cannot convert to number"}
