"""Factory for DictItems plugin."""

from .dict_items import DictItems


def create():
    return DictItems()
