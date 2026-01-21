"""Workflow plugin: get variable from workflow store."""


def run(runtime, inputs):
    """Get variable value from workflow store."""
    key = inputs.get("key")
    default = inputs.get("default")

    if key is None:
        return {"result": default, "exists": False, "error": "key is required"}

    exists = key in runtime.store
    value = runtime.store.get(key, default)

    return {"result": value, "exists": exists}
