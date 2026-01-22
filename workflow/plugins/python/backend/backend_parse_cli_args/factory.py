"""Factory for ParseCliArgs plugin."""

from .backend_parse_cli_args import ParseCliArgs


def create():
    return ParseCliArgs()
