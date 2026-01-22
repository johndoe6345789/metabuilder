"""Factory for StringReplace plugin."""

from .string_replace import StringReplace


def create():
    return StringReplace()
