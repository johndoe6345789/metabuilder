"""Factory for WebCreateFlaskApp plugin."""

from .web_create_flask_app import WebCreateFlaskApp


def create():
    return WebCreateFlaskApp()
