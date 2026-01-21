"""Workflow plugin: split string."""


def run(_runtime, inputs):
    """Split string by separator."""
    text = inputs.get("text", "")
    separator = inputs.get("separator", " ")
    max_splits = inputs.get("max_splits")

    if max_splits is not None:
        result = text.split(separator, max_splits)
    else:
        result = text.split(separator)

    return {"result": result}
