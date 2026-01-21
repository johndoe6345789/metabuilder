"""Workflow plugin: switch/case control flow."""


def run(_runtime, inputs):
    """Switch on value and return matching case."""
    value = inputs.get("value")
    cases = inputs.get("cases", {})
    default = inputs.get("default")

    result = cases.get(str(value), default)
    return {"result": result, "matched": str(value) in cases}
