"""Factory for DictMerge plugin."""

from .dict_merge import DictMerge


def create():
    return DictMerge()
