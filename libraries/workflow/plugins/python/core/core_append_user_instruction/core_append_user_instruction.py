"""Workflow plugin: append user instruction."""

from ...base import NodeExecutor


class CoreAppendUserInstruction(NodeExecutor):
    """Append the next user instruction to the message list."""

    node_type = "core.append_user_instruction"
    category = "core"
    description = "Append the next user instruction to the message list"

    def execute(self, inputs, runtime=None):
        """Append the next user instruction."""
        messages = list(inputs.get("messages") or [])
        messages.append({"role": "user", "content": runtime.context["msgs"]["user_next_step"]})
        return {"messages": messages}
