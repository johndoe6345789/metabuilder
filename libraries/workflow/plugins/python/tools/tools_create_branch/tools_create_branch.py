"""Workflow plugin: create branch."""

from ...base import NodeExecutor


class ToolsCreateBranch(NodeExecutor):
    """Create a Git branch via tool runner."""

    node_type = "tools.create_branch"
    category = "tools"
    description = "Create a Git branch from a base branch"

    def execute(self, inputs, runtime=None):
        """Create a branch via tool runner."""
        result = runtime.tool_runner.call(
            "create_branch",
            branch_name=inputs.get("branch_name"),
            base_branch=inputs.get("base_branch", "main")
        )
        return {"result": result}
