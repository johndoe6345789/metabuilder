"""Workflow plugin: send notification to all channels."""
import os
import logging

logger = logging.getLogger("metabuilder.notifications")


def run(runtime, inputs):
    """Send a notification to all configured channels (Slack and Discord).

    Inputs:
        message: The message to send to all channels

    Returns:
        dict: Contains success status for all channels
    """
    message = inputs.get("message", "")

    # Import sibling plugins
    from . import notifications_slack, notifications_discord

    # Send to Slack
    slack_result = notifications_slack.run(runtime, {"message": message})

    # Send to Discord
    discord_result = notifications_discord.run(runtime, {"message": message})

    return {
        "success": True,
        "message": "Notifications sent to all channels",
        "slack": slack_result,
        "discord": discord_result
    }
