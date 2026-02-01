"""Factory for StringConcat plugin."""

from .string_concat import StringConcat


fn create() -> StringConcat:
    """Create a new StringConcat plugin instance.

    Returns:
        A new StringConcat plugin instance.
    """
    return StringConcat()
