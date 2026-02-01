"""Factory for MathAdd plugin."""

from .math_add import MathAdd


fn create() -> MathAdd:
    """Create a new MathAdd plugin instance.

    Returns:
        A new MathAdd plugin instance.
    """
    return MathAdd()
