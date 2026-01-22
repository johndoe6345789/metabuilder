"""Factory for CreateDiscord plugin."""

from .backend_create_discord import CreateDiscord


def create():
    return CreateDiscord()
