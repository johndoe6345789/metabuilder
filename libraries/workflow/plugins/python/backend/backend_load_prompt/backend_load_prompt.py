"""Workflow plugin: load system prompt."""

import os

from ...base import NodeExecutor


class LoadPrompt(NodeExecutor):
    """Load system prompt from file."""

    node_type = "backend.load_prompt"
    category = "backend"
    description = "Load system prompt from file"

    def execute(self, inputs, runtime=None):
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
