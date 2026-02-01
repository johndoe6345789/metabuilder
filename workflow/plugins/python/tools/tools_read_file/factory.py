"""Factory for ToolsReadFile plugin."""

from .tools_read_file import ToolsReadFile


def create():
    """Create and return a ToolsReadFile instance."""
    return ToolsReadFile()
