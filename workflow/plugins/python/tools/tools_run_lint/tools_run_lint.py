"""Workflow plugin: run lint."""

from ...base import NodeExecutor


class ToolsRunLint(NodeExecutor):
    """Run lint via tool runner."""

    node_type = "tools.run_lint"
    category = "tools"
    description = "Run linting on source files"

    def execute(self, inputs, runtime=None):
        """Run lint via tool runner."""
        result = runtime.tool_runner.call("run_lint", path=inputs.get("path", "src"))
        return {"results": result}
