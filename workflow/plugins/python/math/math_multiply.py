"""Workflow plugin: multiply numbers."""


def run(_runtime, inputs):
    """Multiply two or more numbers."""
    numbers = inputs.get("numbers", [])
    result = 1
    for num in numbers:
        result *= num
    return {"result": result}
