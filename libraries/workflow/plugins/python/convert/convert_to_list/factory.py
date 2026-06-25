"""Factory for ConvertToList plugin."""

from .convert_to_list import ConvertToList


def create():
    return ConvertToList()
