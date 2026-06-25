"""Factory for ToolsRunLint plugin."""

from .tools_run_lint import ToolsRunLint


def create():
    """Create and return a ToolsRunLint instance."""
    return ToolsRunLint()
