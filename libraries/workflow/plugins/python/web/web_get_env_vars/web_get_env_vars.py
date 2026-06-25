"""Workflow plugin: get environment variables."""

from pathlib import Path

from ...base import NodeExecutor


class WebGetEnvVars(NodeExecutor):
    """Get environment variables from .env file."""

    node_type = "web.get_env_vars"
    category = "web"
    description = "Get environment variables from .env file"

    def execute(self, inputs, runtime=None):
        """Get environment variables from .env file."""
        env_path = Path(".env")
        if not env_path.exists():
            return {"result": {}}

        result = {}
        for raw in env_path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip("'\"")
            result[key.strip()] = value

        return {"result": result}
