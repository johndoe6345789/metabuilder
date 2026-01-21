"""Workflow plugin: get environment variables."""
from pathlib import Path


def run(_runtime, _inputs):
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
