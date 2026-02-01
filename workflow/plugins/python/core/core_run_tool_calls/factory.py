"""Factory for CoreRunToolCalls plugin."""

from .core_run_tool_calls import CoreRunToolCalls


def create():
    """Create a new CoreRunToolCalls instance."""
    return CoreRunToolCalls()
