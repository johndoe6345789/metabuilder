"""Workflow plugin: check if variable exists in workflow store."""


def run(runtime, inputs):
    """Check if variable exists in workflow store."""
    key = inputs.get("key")

    if key is None:
        return {"result": False, "error": "key is required"}

    exists = key in runtime.store

    return {"result": exists}
