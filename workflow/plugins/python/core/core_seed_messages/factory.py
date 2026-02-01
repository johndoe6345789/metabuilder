"""Factory for CoreSeedMessages plugin."""

from .core_seed_messages import CoreSeedMessages


def create():
    """Create a new CoreSeedMessages instance."""
    return CoreSeedMessages()
