"""Factory for ControlStartBot plugin."""

from .control_start_bot import ControlStartBot


def create():
    return ControlStartBot()
