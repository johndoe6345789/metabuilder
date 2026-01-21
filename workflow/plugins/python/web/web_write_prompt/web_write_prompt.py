"""Workflow plugin: write prompt."""
import os
from pathlib import Path


def run(_runtime, inputs):
    """Write prompt content to file."""
    content = inputs.get("content", "")
    path = Path(os.environ.get("PROMPT_PATH", "prompt.yml"))
    path.write_text(content or "", encoding="utf-8")
    return {"result": "Prompt written successfully"}
