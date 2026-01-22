"""Workflow plugin: load tools for AI function calling."""

import os
import json

from ...base import NodeExecutor


class LoadTools(NodeExecutor):
    """Load tool definitions for AI function calling."""

    node_type = "backend.load_tools"
    category = "backend"
    description = "Load tool definitions for AI function calling"

    def execute(self, inputs, runtime=None):
        """Load tool definitions for AI function calling.

        Inputs:
            path: Path to tools definition file or directory
        """
        path = inputs.get("path", "config/tools.json")

        tools = []

        if os.path.isfile(path):
            with open(path) as f:
                tools = json.load(f)
        elif os.path.isdir(path):
            for filename in os.listdir(path):
                if filename.endswith(".json"):
                    with open(os.path.join(path, filename)) as f:
                        tools.extend(json.load(f))

        runtime.context["tools"] = tools

        return {"success": True, "tool_count": len(tools)}
