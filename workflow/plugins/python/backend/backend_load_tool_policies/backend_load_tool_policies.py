"""Workflow plugin: load tool policies."""
import os
import json


def run(runtime, inputs):
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
