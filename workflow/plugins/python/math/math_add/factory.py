"""Factory for MathAdd plugin."""

from .math_add import MathAdd


def create():
    return MathAdd()
