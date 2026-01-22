"""Factory for MathDivide plugin."""

from .math_divide import MathDivide


fn create() -> MathDivide:
    """Create a new MathDivide plugin instance.

    Returns:
        A new MathDivide plugin instance.
    """
    return MathDivide()
