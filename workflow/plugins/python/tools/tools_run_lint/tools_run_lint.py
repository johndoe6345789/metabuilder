"""Workflow plugin: run lint."""


def run(runtime, inputs):
    """Run lint via tool runner."""
    result = runtime.tool_runner.call("run_lint", path=inputs.get("path", "src"))
    return {"results": result}
