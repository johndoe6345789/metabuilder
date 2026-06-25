"""Workflow plugin: assert value is false."""

from ...base import NodeExecutor


class TestAssertFalse(NodeExecutor):
    """Assert that a value is false."""

    node_type = "test.assert_false"
    category = "test"
    description = "Assert that a value is false"

    def execute(self, inputs, runtime=None):
        """Assert that a value is false."""
        value = inputs.get("value")
        message = inputs.get("message", "")

        passed = value is False

        if not passed:
            error_msg = f"Assertion failed: {message}" if message else "Assertion failed"
            error_msg += f"\n  Expected: False\n  Actual: {value}"
            return {
                "passed": False,
                "error": error_msg,
                "value": value
            }

        return {
            "passed": True,
            "value": value
        }
