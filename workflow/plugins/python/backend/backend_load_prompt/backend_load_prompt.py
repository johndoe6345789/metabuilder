"""Workflow plugin: load system prompt."""
import os


def run(runtime, inputs):
    """Load system prompt from file.

    Inputs:
        path: Path to prompt file
    """
    path = inputs.get("path", "config/system_prompt.txt")

    if not os.path.exists(path):
        return {"success": False, "error": f"File not found: {path}"}

    with open(path) as f:
        prompt = f.read()

    runtime.context["system_prompt"] = prompt

    return {"success": True, "length": len(prompt)}
