"""Factory for ListSlice plugin."""

from .list_slice import ListSlice


def create():
    return ListSlice()
