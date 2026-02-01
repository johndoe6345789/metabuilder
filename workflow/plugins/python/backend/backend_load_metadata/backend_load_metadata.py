"""Workflow plugin: load workflow metadata."""

import os
import json

from ...base import NodeExecutor


class LoadMetadata(NodeExecutor):
    """Load workflow metadata from package.json or config."""

    node_type = "backend.load_metadata"
    category = "backend"
    description = "Load workflow metadata from config"

    def execute(self, inputs, runtime=None):
        """Load workflow metadata from package.json or config.

        Inputs:
            path: Path to metadata file
        """
        path = inputs.get("path", "package.json")

        if not os.path.exists(path):
            return {"success": False, "error": f"File not found: {path}"}

        with open(path) as f:
            metadata = json.load(f)

        runtime.context["metadata"] = metadata

        return {
            "success": True,
            "name": metadata.get("name"),
            "version": metadata.get("version")
        }
