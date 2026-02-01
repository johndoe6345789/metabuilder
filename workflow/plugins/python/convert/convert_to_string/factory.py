"""Factory for ConvertToString plugin."""

from .convert_to_string import ConvertToString


def create():
    return ConvertToString()
