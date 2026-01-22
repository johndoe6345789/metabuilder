"""Factory for NotificationsSlack plugin."""

from .notifications_slack import NotificationsSlack


def create():
    return NotificationsSlack()
