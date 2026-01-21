"""Workflow plugin: get string length."""


def run(_runtime, inputs):
    """Get length of a string."""
    text = inputs.get("text", "")
    return {"result": len(text)}
