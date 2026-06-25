"""Factory for WebRegisterRoute plugin."""

from .web_register_route import WebRegisterRoute


def create():
    return WebRegisterRoute()
