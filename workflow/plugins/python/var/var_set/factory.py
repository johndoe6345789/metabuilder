"""Factory for VarSet plugin."""

from .var_set import VarSet


def create():
    return VarSet()
