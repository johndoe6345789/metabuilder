"""Factory for DictValues plugin."""

from .dict_values import DictValues


def create():
    return DictValues()
