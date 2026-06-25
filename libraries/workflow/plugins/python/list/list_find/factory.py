"""Factory for ListFind plugin."""

from .list_find import ListFind


def create():
    return ListFind()
