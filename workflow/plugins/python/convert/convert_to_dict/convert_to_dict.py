"""Workflow plugin: convert to dictionary."""


def run(_runtime, inputs):
    """Convert value to dictionary."""
    value = inputs.get("value")

    if isinstance(value, dict):
        return {"result": value}
    elif isinstance(value, list):
        # Convert list of [key, value] pairs to dict
        try:
            return {"result": dict(value)}
        except (TypeError, ValueError):
            return {"result": {}, "error": "Cannot convert list to dict"}
    else:
        return {"result": {}}
