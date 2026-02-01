"""Workflow plugin: load environment variables."""

import os

from dotenv import load_dotenv

from ...base import NodeExecutor


class LoadEnv(NodeExecutor):
    """Load environment variables from .env file."""

    node_type = "backend.load_env"
    category = "backend"
    description = "Load environment variables from .env file"

    def execute(self, inputs, runtime=None):
        """Load environment variables from .env file.

        Inputs:
            path: Optional path to .env file (default: .env)
            override: Whether to override existing env vars (default: False)
        """
        path = inputs.get("path", ".env")
        override = inputs.get("override", False)

        if os.path.exists(path):
            load_dotenv(path, override=override)
            return {"success": True, "path": path}

        return {"success": False, "error": f"File not found: {path}"}
