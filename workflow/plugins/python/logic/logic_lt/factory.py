"""Factory for LogicLt plugin."""

from .logic_lt import LogicLt


def create():
    return LogicLt()
