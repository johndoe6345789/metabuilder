"""Workflow plugin: merge dictionaries."""


def run(_runtime, inputs):
    """Merge multiple dictionaries."""
    objects = inputs.get("objects", [])
    result = {}

    for obj in objects:
        if isinstance(obj, dict):
            result.update(obj)

    return {"result": result}
