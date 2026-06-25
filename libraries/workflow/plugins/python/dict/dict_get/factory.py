"""Factory for DictGet plugin."""

from .dict_get import DictGet


def create():
    return DictGet()
