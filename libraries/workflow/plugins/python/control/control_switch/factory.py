"""Factory for ControlSwitch plugin."""

from .control_switch import ControlSwitch


def create():
    return ControlSwitch()
