"""Factory for StringConcat plugin."""

from .string_concat import StringConcat


def create():
    return StringConcat()
