"""Factory for StringUpper plugin."""

from .string_upper import StringUpper


fn create() -> StringUpper:
    """Create a new StringUpper plugin instance.

    Returns:
        A new StringUpper plugin instance.
    """
    return StringUpper()
