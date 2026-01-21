"""Workflow plugin: convert to list."""


def run(_runtime, inputs):
    """Convert value to list."""
    value = inputs.get("value")

    if isinstance(value, list):
        return {"result": value}
    elif isinstance(value, (tuple, set)):
        return {"result": list(value)}
    elif isinstance(value, dict):
        return {"result": list(value.items())}
    elif value is None:
        return {"result": []}
    else:
        return {"result": [value]}
