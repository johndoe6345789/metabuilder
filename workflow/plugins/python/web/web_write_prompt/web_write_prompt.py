"""Workflow plugin: write prompt."""

import os
from pathlib import Path

from ...base import NodeExecutor


class WebWritePrompt(NodeExecutor):
    """Write prompt content to file."""

    node_type = "web.write_prompt"
    category = "web"
    description = "Write prompt content to file"

    def execute(self, inputs, runtime=None):
        """Write prompt content to file."""
        content = inputs.get("content", "")
        path = Path(os.environ.get("PROMPT_PATH", "prompt.yml"))
        path.write_text(content or "", encoding="utf-8")
        return {"result": "Prompt written successfully"}
