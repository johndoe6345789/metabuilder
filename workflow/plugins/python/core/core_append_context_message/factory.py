"""Factory for CoreAppendContextMessage plugin."""

from .core_append_context_message import CoreAppendContextMessage


def create():
    """Create a new CoreAppendContextMessage instance."""
    return CoreAppendContextMessage()
