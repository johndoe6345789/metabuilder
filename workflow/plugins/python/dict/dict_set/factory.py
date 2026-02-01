"""Factory for DictSet plugin."""

from .dict_set import DictSet


def create():
    return DictSet()
