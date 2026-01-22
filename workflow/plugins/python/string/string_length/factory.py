"""Factory for StringLength plugin."""

from .string_length import StringLength


def create():
    return StringLength()
