"""Workflow plugin: assert value exists (is not None/null)."""

from ...base import NodeExecutor


class TestAssertExists(NodeExecutor):
    """Assert that a value exists (is not None)."""

    node_type = "test.assert_exists"
    category = "test"
    description = "Assert that a value exists (is not None/null)"

    def execute(self, inputs, runtime=None):
        """Assert that a value exists (is not None)."""
        value = inputs.get("value")
        message = inputs.get("message", "")

        passed = value is not None

        if not passed:
            error_msg = f"Assertion failed: {message}" if message else "Assertion failed"
            error_msg += f"\n  Expected: non-null value\n  Actual: None"
            return {
                "passed": False,
                "error": error_msg,
                "value": value
            }

        return {
            "passed": True,
            "value": value
        }
