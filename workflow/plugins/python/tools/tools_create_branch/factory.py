"""Factory for ToolsCreateBranch plugin."""

from .tools_create_branch import ToolsCreateBranch


def create():
    """Create and return a ToolsCreateBranch instance."""
    return ToolsCreateBranch()
