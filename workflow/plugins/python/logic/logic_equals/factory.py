"""Factory for LogicEquals plugin."""

from .logic_equals import LogicEquals


def create():
    return LogicEquals()
