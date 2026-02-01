"""Factory for CoreLoadContext plugin."""

from .core_load_context import CoreLoadContext


def create():
    """Create a new CoreLoadContext instance."""
    return CoreLoadContext()
