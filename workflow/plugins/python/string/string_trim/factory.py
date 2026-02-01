"""Factory for StringTrim plugin."""

from .string_trim import StringTrim


def create():
    return StringTrim()
