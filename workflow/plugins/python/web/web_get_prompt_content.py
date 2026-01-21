"""Workflow plugin: get prompt content."""
import os
from pathlib import Path


def run(_runtime, _inputs):
    """Get prompt content from prompt file."""
    path = Path(os.environ.get("PROMPT_PATH", "prompt.yml"))
    if path.is_file():
        content = path.read_text(encoding="utf-8")
        return {"result": content}
    return {"result": ""}
