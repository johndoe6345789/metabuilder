"""Factory for ListSort plugin."""

from .list_sort import ListSort


def create():
    return ListSort()
