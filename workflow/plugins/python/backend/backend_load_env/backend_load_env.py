"""Workflow plugin: load environment variables."""
import os
from dotenv import load_dotenv


def run(_runtime, inputs):
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
