"""Factory for LogicIn plugin."""

from .logic_in import LogicIn


def create():
    return LogicIn()
