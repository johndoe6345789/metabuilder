"""Factory for ControlGetBotStatus plugin."""

from .control_get_bot_status import ControlGetBotStatus


def create():
    return ControlGetBotStatus()
