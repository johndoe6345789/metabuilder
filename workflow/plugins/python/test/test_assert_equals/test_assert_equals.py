"""Workflow plugin: assert two values are equal."""


def run(_runtime, inputs):
    """Assert that two values are equal."""
    actual = inputs.get("actual")
    expected = inputs.get("expected")
    message = inputs.get("message", "")

    passed = actual == expected

    if not passed:
        error_msg = f"Assertion failed: {message}" if message else "Assertion failed"
        error_msg += f"\n  Expected: {expected}\n  Actual: {actual}"
        return {
            "passed": False,
            "error": error_msg,
            "expected": expected,
            "actual": actual
        }

    return {
        "passed": True,
        "expected": expected,
        "actual": actual
    }
