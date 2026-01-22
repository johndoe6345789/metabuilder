"""Factory for StringFormat plugin."""

from .string_format import StringFormat


def create():
    return StringFormat()
