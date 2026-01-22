"""Workflow plugin: read file."""

from ...base import NodeExecutor


class ToolsReadFile(NodeExecutor):
    """Read a file via tool runner."""

    node_type = "tools.read_file"
    category = "tools"
    description = "Read the contents of a file"

    def execute(self, inputs, runtime=None):
        """Read a file via tool runner."""
        result = runtime.tool_runner.call("read_file", path=inputs.get("path"))
        return {"content": result}
