"""Workflow plugin: membership test."""


def run(_runtime, inputs):
    """Check if value is in collection."""
    value = inputs.get("value")
    collection = inputs.get("collection", [])
    return {"result": value in collection}
