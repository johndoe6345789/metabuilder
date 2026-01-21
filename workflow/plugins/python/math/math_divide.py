"""Workflow plugin: divide numbers."""


def run(_runtime, inputs):
    """Divide a by b."""
    a = inputs.get("a", 0)
    b = inputs.get("b", 1)

    if b == 0:
        return {"result": None, "error": "Division by zero"}

    return {"result": a / b}
