"""Workflow plugin: assert value is true."""


def run(_runtime, inputs):
    """Assert that a value is true."""
    value = inputs.get("value")
    message = inputs.get("message", "")

    passed = value is True

    if not passed:
        error_msg = f"Assertion failed: {message}" if message else "Assertion failed"
        error_msg += f"\n  Expected: True\n  Actual: {value}"
        return {
            "passed": False,
            "error": error_msg,
            "value": value
        }

    return {
        "passed": True,
        "value": value
    }
