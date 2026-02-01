"""Factory for VarDelete plugin."""

from .var_delete import VarDelete


def create():
    return VarDelete()
