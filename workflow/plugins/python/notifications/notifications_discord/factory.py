"""Factory for NotificationsDiscord plugin."""

from .notifications_discord import NotificationsDiscord


def create():
    return NotificationsDiscord()
