"""Workflow plugin: append user instruction."""


def run(runtime, inputs):
    """Append the next user instruction."""
    messages = list(inputs.get("messages") or [])
    messages.append({"role": "user", "content": runtime.context["msgs"]["user_next_step"]})
    return {"messages": messages}
