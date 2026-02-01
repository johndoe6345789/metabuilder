"""Factory for ToolsRunDocker plugin."""

from .tools_run_docker import ToolsRunDocker


def create():
    """Create and return a ToolsRunDocker instance."""
    return ToolsRunDocker()
