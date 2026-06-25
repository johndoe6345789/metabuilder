"""Factory for WebStartServer plugin."""

from .web_start_server import WebStartServer


def create():
    return WebStartServer()
