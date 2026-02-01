"""Factory for LoadToolRegistry plugin."""

from .backend_load_tool_registry import LoadToolRegistry


def create():
    return LoadToolRegistry()
