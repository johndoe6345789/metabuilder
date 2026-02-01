"""Factory for MathMax plugin."""

from .math_max import MathMax


def create():
    return MathMax()
