"""Workflow plugin: seed messages."""


def run(runtime, _inputs):
    """Seed messages from the prompt."""
    prompt = runtime.context["prompt"]
    return {"messages": list(prompt["messages"])}
