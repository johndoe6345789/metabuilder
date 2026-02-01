"""Factory for StringSha256 plugin."""

from .string_sha256 import StringSha256


def create():
    return StringSha256()
