"""Workflow runtime container."""


class WorkflowRuntime:
    """Runtime state for workflow execution."""
    def __init__(self, context: dict, store: dict, tool_runner, logger):
        self.context = context
        self.store = store
        self.tool_runner = tool_runner
        self.logger = logger
