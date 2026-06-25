"""Factory for ConfigureLogging plugin."""

from .backend_configure_logging import ConfigureLogging


def create():
    return ConfigureLogging()
