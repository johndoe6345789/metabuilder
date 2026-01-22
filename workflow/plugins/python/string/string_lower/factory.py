"""Factory for StringLower plugin."""

from .string_lower import StringLower


def create():
    return StringLower()
