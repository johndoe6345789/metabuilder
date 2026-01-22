"""Factory for ToolsRunTests plugin."""

from .tools_run_tests import ToolsRunTests


def create():
    """Create and return a ToolsRunTests instance."""
    return ToolsRunTests()
