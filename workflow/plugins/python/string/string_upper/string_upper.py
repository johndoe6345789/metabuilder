"""Workflow plugin: convert string to uppercase."""


def run(_runtime, inputs):
    """Convert string to uppercase."""
    text = inputs.get("text", "")
    return {"result": text.upper()}
