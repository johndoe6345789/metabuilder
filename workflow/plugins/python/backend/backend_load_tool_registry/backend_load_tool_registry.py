"""Workflow plugin: load tool registry."""

import os
import json

from ...base import NodeExecutor


class LoadToolRegistry(NodeExecutor):
    """Load tool registry defining available AI tools."""

    node_type = "backend.load_tool_registry"
    category = "backend"
    description = "Load tool registry for AI function calling"

    def execute(self, inputs, runtime=None):
        """Load tool registry defining available AI tools.

        Inputs:
            path: Path to tool registry file
        """
        path = inputs.get("path", "config/tool_registry.json")

        if not os.path.exists(path):
            return {"success": False, "error": f"File not found: {path}"}

        with open(path) as f:
            registry = json.load(f)

        runtime.context["tool_registry"] = registry

        return {"success": True, "tool_count": len(registry)}
