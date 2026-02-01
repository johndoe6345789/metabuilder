"""Factory for LoadMetadata plugin."""

from .backend_load_metadata import LoadMetadata


def create():
    return LoadMetadata()
