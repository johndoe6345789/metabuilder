"""Workflow plugin: append context message."""

from ...base import NodeExecutor


class CoreAppendContextMessage(NodeExecutor):
    """Append context to the message list."""

    node_type = "core.append_context_message"
    category = "core"
    description = "Append context information to the message list as a system message"

    def execute(self, inputs, runtime=None):
        """Append context to the message list."""
        messages = list(inputs.get("messages") or [])
        context_val = inputs.get("context")
        if context_val:
            messages.append({
                "role": "system",
                "content": f"{runtime.context['msgs']['sdlc_context_label']}{context_val}",
            })
        return {"messages": messages}
