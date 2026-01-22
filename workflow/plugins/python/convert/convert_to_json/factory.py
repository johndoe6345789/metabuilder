"""Factory for ConvertToJson plugin."""

from .convert_to_json import ConvertToJson


def create():
    return ConvertToJson()
