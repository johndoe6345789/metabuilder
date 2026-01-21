"""Workflow plugin: list files."""


def run(runtime, inputs):
    """List files via tool runner."""
    result = runtime.tool_runner.call("list_files", directory=inputs.get("path", "."))
    return {"files": result}
