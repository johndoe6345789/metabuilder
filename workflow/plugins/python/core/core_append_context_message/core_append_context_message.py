"""Workflow plugin: append context message."""


def run(runtime, inputs):
    """Append context to the message list."""
    messages = list(inputs.get("messages") or [])
    context_val = inputs.get("context")
    if context_val:
        messages.append({
            "role": "system",
            "content": f"{runtime.context['msgs']['sdlc_context_label']}{context_val}",
        })
    return {"messages": messages}
