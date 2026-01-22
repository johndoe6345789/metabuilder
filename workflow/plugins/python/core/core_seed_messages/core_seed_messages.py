"""Workflow plugin: seed messages."""

from ...base import NodeExecutor


class CoreSeedMessages(NodeExecutor):
    """Seed messages from the prompt."""

    node_type = "core.seed_messages"
    category = "core"
    description = "Initialize the message list from the prompt configuration"

    def execute(self, inputs, runtime=None):
        """Seed messages from the prompt."""
        prompt = runtime.context["prompt"]
        return {"messages": list(prompt["messages"])}
