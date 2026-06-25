"""Factory for LoadTools plugin."""

from .backend_load_tools import LoadTools


def create():
    return LoadTools()
