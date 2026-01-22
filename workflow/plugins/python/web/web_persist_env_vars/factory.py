"""Factory for WebPersistEnvVars plugin."""

from .web_persist_env_vars import WebPersistEnvVars


def create():
    return WebPersistEnvVars()
