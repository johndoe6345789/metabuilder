"""Factory for CoreAiRequest plugin."""

from .core_ai_request import CoreAiRequest


def create():
    """Create a new CoreAiRequest instance."""
    return CoreAiRequest()
