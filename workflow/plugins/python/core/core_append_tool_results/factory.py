"""Factory for CoreAppendToolResults plugin."""

from .core_append_tool_results import CoreAppendToolResults


def create():
    """Create a new CoreAppendToolResults instance."""
    return CoreAppendToolResults()
