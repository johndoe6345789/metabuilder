"""Workflow plugin: delete variable from workflow store."""


def run(runtime, inputs):
    """Delete variable from workflow store."""
    key = inputs.get("key")

    if key is None:
        return {"result": False, "deleted": False, "error": "key is required"}

    if key in runtime.store:
        del runtime.store[key]
        return {"result": True, "deleted": True}

    return {"result": False, "deleted": False}
