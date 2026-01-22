"""Workflow plugin: list files."""

from ...base import NodeExecutor


class ToolsListFiles(NodeExecutor):
    """List files in a directory via tool runner."""

    node_type = "tools.list_files"
    category = "tools"
    description = "List files in a directory"

    def execute(self, inputs, runtime=None):
        """List files via tool runner."""
        result = runtime.tool_runner.call("list_files", directory=inputs.get("path", "."))
        return {"files": result}
