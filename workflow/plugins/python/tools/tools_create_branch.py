"""Workflow plugin: create branch."""


def run(runtime, inputs):
    """Create a branch via tool runner."""
    result = runtime.tool_runner.call(
        "create_branch",
        branch_name=inputs.get("branch_name"),
        base_branch=inputs.get("base_branch", "main")
    )
    return {"result": result}
