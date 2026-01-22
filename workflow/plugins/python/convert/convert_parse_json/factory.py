"""Factory for ConvertParseJson plugin."""

from .convert_parse_json import ConvertParseJson


def create():
    return ConvertParseJson()
