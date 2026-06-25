"""Factory for WebGetEnvVars plugin."""

from .web_get_env_vars import WebGetEnvVars


def create():
    return WebGetEnvVars()
