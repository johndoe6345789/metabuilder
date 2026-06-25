"""Factory for StringLower plugin."""

from .string_lower import StringLower


fn create() -> StringLower:
    """Create a new StringLower plugin instance.

    Returns:
        A new StringLower plugin instance.
    """
    return StringLower()
