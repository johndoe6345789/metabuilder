"""Factory for MathSubtract plugin."""

from .math_subtract import MathSubtract


fn create() -> MathSubtract:
    """Create a new MathSubtract plugin instance.

    Returns:
        A new MathSubtract plugin instance.
    """
    return MathSubtract()
