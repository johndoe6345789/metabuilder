"""Factory for ConvertToDict plugin."""

from .convert_to_dict import ConvertToDict


def create():
    return ConvertToDict()
