"""Workflow plugin: run tests."""


def run(runtime, inputs):
    """Run tests via tool runner."""
    result = runtime.tool_runner.call("run_tests", path=inputs.get("path", "tests"))
    return {"results": result}
