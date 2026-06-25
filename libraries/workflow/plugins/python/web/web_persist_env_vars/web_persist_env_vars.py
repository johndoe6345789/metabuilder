"""Workflow plugin: persist environment variables."""

from pathlib import Path

from ...base import NodeExecutor


class WebPersistEnvVars(NodeExecutor):
    """Persist environment variables to .env file."""

    node_type = "web.persist_env_vars"
    category = "web"
    description = "Persist environment variables to .env file"

    def execute(self, inputs, runtime=None):
        """Persist environment variables to .env file."""
        from dotenv import set_key

        updates = inputs.get("updates", {})
        env_path = Path(".env")
        env_path.touch(exist_ok=True)
        for key, value in updates.items():
            set_key(env_path, key, value)

        return {"result": "Environment variables persisted"}
