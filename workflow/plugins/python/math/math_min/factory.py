"""Factory for MathMin plugin."""

from .math_min import MathMin


def create():
    return MathMin()
