"""Factory for LoadMessages plugin."""

from .backend_load_messages import LoadMessages


def create():
    return LoadMessages()
