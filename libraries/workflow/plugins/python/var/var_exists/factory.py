"""Factory for VarExists plugin."""

from .var_exists import VarExists


def create():
    return VarExists()
