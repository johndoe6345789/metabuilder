"""Factory for StringLength plugin."""

from .string_length import StringLength


fn create() -> StringLength:
    """Create a new StringLength plugin instance.

    Returns:
        A new StringLength plugin instance.
    """
    return StringLength()
