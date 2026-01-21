"""Workflow plugin: modulo operation."""


def run(_runtime, inputs):
    """Calculate a modulo b."""
    a = inputs.get("a", 0)
    b = inputs.get("b", 1)

    if b == 0:
        return {"result": None, "error": "Modulo by zero"}

    return {"result": a % b}
