"""Factory for ToolsCreatePullRequest plugin."""

from .tools_create_pull_request import ToolsCreatePullRequest


def create():
    """Create and return a ToolsCreatePullRequest instance."""
    return ToolsCreatePullRequest()
