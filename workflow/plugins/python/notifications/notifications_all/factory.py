"""Factory for NotificationsAll plugin."""

from .notifications_all import NotificationsAll


def create():
    return NotificationsAll()
