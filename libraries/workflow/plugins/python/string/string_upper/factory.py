"""Factory for StringUpper plugin."""

from .string_upper import StringUpper


def create():
    return StringUpper()
