"""Workflow plugin: run tests."""

from ...base import NodeExecutor


class ToolsRunTests(NodeExecutor):
    """Run tests via tool runner."""

    node_type = "tools.run_tests"
    category = "tools"
    description = "Run tests in a specified directory"

    def execute(self, inputs, runtime=None):
        """Run tests via tool runner."""
        result = runtime.tool_runner.call("run_tests", path=inputs.get("path", "tests"))
        return {"results": result}
