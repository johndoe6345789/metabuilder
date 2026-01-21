"""Workflow plugin: set variable in workflow store."""


def run(runtime, inputs):
    """Set variable value in workflow store."""
    key = inputs.get("key")
    value = inputs.get("value")

    if key is None:
        return {"result": None, "key": None, "error": "key is required"}

    runtime.store[key] = value

    return {"result": value, "key": key}
