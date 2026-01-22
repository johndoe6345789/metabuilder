"""Workflow plugin: assert two values are equal."""

from ...base import NodeExecutor


class TestAssertEquals(NodeExecutor):
    """Assert that two values are equal."""

    node_type = "test.assert_equals"
    category = "test"
    description = "Assert that two values are equal"

    def execute(self, inputs, runtime=None):
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
