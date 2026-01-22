"""Workflow plugin: get prompt content."""

import os
from pathlib import Path

from ...base import NodeExecutor


class WebGetPromptContent(NodeExecutor):
    """Get prompt content from prompt file."""

    node_type = "web.get_prompt_content"
    category = "web"
    description = "Get prompt content from prompt file"

    def execute(self, inputs, runtime=None):
        """Get prompt content from prompt file."""
        path = Path(os.environ.get("PROMPT_PATH", "prompt.yml"))
        if path.is_file():
            content = path.read_text(encoding="utf-8")
            return {"result": content}
        return {"result": ""}
