"""Factory for VarGet plugin."""

from .var_get import VarGet


def create():
    return VarGet()
