"""Factory for ParsePath plugin."""

from .parse_path import ParsePath


def create():
    return ParsePath()
