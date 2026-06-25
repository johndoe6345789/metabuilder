"""Workflow plugin: send notification to all channels."""

import logging

from ...base import NodeExecutor

logger = logging.getLogger("metabuilder.notifications")


class NotificationsAll(NodeExecutor):
    """Send a notification to all configured channels (Slack and Discord)."""

    node_type = "notifications.all"
    category = "notifications"
    description = "Send a notification to all configured channels (Slack and Discord)"

    def execute(self, inputs, runtime=None):
        """Send a notification to all configured channels (Slack and Discord).

        Inputs:
            message: The message to send to all channels

        Returns:
            dict: Contains success status for all channels
        """
        message = inputs.get("message", "")

        # Import sibling plugins
        from ..notifications_slack.factory import create as create_slack
        from ..notifications_discord.factory import create as create_discord

        # Send to Slack
        slack_plugin = create_slack()
        slack_result = slack_plugin.execute({"message": message}, runtime)

        # Send to Discord
        discord_plugin = create_discord()
        discord_result = discord_plugin.execute({"message": message}, runtime)

        return {
            "success": True,
            "message": "Notifications sent to all channels",
            "slack": slack_result,
            "discord": discord_result
        }
