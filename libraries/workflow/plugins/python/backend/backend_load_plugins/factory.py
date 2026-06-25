"""Factory for LoadPlugins plugin."""

from .backend_load_plugins import LoadPlugins


def create():
    return LoadPlugins()
