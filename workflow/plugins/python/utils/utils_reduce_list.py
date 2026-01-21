"""Workflow plugin: reduce list."""


def run(_runtime, inputs):
    """Reduce a list into a string."""
    items = inputs.get("items", [])
    if not isinstance(items, list):
        items = [items] if items else []

    separator = inputs.get("separator", "")
    # Handle escape sequences
    if separator == "\\n":
        separator = "\n"
    elif separator == "\\t":
        separator = "\t"

    reduced = separator.join([str(item) for item in items])
    return {"result": reduced}
