"""Workflow plugin: replace in string."""


def run(_runtime, inputs):
    """Replace occurrences in string."""
    text = inputs.get("text", "")
    old = inputs.get("old", "")
    new = inputs.get("new", "")
    count = inputs.get("count", -1)

    result = text.replace(old, new, count)
    return {"result": result}
