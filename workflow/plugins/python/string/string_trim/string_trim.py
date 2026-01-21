"""Workflow plugin: trim whitespace from string."""


def run(_runtime, inputs):
    """Trim whitespace from string."""
    text = inputs.get("text", "")
    mode = inputs.get("mode", "both")

    if mode == "start":
        result = text.lstrip()
    elif mode == "end":
        result = text.rstrip()
    else:
        result = text.strip()

    return {"result": result}
