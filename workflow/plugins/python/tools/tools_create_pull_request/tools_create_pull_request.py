"""Workflow plugin: create pull request."""

from ...base import NodeExecutor


class ToolsCreatePullRequest(NodeExecutor):
    """Create a pull request via tool runner."""

    node_type = "tools.create_pull_request"
    category = "tools"
    description = "Create a pull request with title, body, and branch information"

    def execute(self, inputs, runtime=None):
        """Create a pull request via tool runner."""
        result = runtime.tool_runner.call(
            "create_pull_request",
            title=inputs.get("title"),
            body=inputs.get("body"),
            head_branch=inputs.get("head_branch"),
            base_branch=inputs.get("base_branch", "main")
        )
        return {"result": result}
