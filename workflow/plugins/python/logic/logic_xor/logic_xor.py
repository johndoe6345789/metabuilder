"""Workflow plugin: logical XOR."""


def run(_runtime, inputs):
    """Perform logical XOR on two values."""
    a = inputs.get("a", False)
    b = inputs.get("b", False)
    return {"result": bool(a) != bool(b)}
