"""Factory for WebReadJson plugin."""

from .web_read_json import WebReadJson


def create():
    return WebReadJson()
