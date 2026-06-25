"""Factory for CreateSlack plugin."""

from .backend_create_slack import CreateSlack


def create():
    return CreateSlack()
