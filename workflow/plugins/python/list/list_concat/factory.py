"""Factory for ListConcat plugin."""

from .list_concat import ListConcat


def create():
    return ListConcat()
