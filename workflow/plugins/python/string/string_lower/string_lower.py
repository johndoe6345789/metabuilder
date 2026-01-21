"""Workflow plugin: convert string to lowercase."""


def run(_runtime, inputs):
    """Convert string to lowercase."""
    text = inputs.get("text", "")
    return {"result": text.lower()}
