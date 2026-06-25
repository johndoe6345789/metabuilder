"""Workflow plugin: load tool policies."""

import os
import json

from ...base import NodeExecutor


class LoadToolPolicies(NodeExecutor):
    """Load tool policies for access control."""

    node_type = "backend.load_tool_policies"
    category = "backend"
    description = "Load tool policies for access control"

    def execute(self, inputs, runtime=None):
        """Load tool policies for access control.

        Inputs:
            path: Path to tool policies file
        """
        path = inputs.get("path", "config/tool_policies.json")

        if not os.path.exists(path):
            # Default to permissive if no policies file
            runtime.context["tool_policies"] = {}
            return {"success": True, "policy_count": 0}

        with open(path) as f:
            policies = json.load(f)

        runtime.context["tool_policies"] = policies

        return {"success": True, "policy_count": len(policies)}
