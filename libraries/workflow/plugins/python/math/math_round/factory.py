"""Factory for MathRound plugin."""

from .math_round import MathRound


def create():
    return MathRound()
