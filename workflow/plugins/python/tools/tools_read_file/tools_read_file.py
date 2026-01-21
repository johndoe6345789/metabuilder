"""Workflow plugin: read file."""


def run(runtime, inputs):
    """Read a file via tool runner."""
    result = runtime.tool_runner.call("read_file", path=inputs.get("path"))
    return {"content": result}
