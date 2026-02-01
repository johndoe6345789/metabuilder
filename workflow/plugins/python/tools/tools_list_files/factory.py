"""Factory for ToolsListFiles plugin."""

from .tools_list_files import ToolsListFiles


def create():
    """Create and return a ToolsListFiles instance."""
    return ToolsListFiles()
