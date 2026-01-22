"""Factory for MathMultiply plugin."""

from .math_multiply import MathMultiply


fn create() -> MathMultiply:
    """Create a new MathMultiply plugin instance.

    Returns:
        A new MathMultiply plugin instance.
    """
    return MathMultiply()
