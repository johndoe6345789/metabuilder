"""Factory for LogicLte plugin."""

from .logic_lte import LogicLte


def create():
    return LogicLte()
