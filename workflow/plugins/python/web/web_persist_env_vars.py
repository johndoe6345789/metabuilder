"""Workflow plugin: persist environment variables."""
from pathlib import Path


def run(_runtime, inputs):
    """Persist environment variables to .env file."""
    from dotenv import set_key

    updates = inputs.get("updates", {})
    env_path = Path(".env")
    env_path.touch(exist_ok=True)
    for key, value in updates.items():
        set_key(env_path, key, value)

    return {"result": "Environment variables persisted"}
