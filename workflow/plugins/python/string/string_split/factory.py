"""Factory for StringSplit plugin."""

from .string_split import StringSplit


def create():
    return StringSplit()
