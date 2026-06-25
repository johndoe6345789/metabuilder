"""Workflow plugin: send Slack notification."""

import os
import logging

from ...base import NodeExecutor

logger = logging.getLogger("metabuilder.notifications")


class NotificationsSlack(NodeExecutor):
    """Send a notification to Slack."""

    node_type = "notifications.slack"
    category = "notifications"
    description = "Send a notification to Slack"

    def execute(self, inputs, runtime=None):
        """Send a notification to Slack.

        Inputs:
            message: The message to send
            channel: Optional channel (defaults to SLACK_CHANNEL env var)

        Returns:
            dict: Contains success status and any error message
        """
        message = inputs.get("message", "")
        channel = inputs.get("channel") or os.environ.get("SLACK_CHANNEL")

        client = runtime.context.get("slack_client") if runtime else None

        if not client:
            logger.warning("Slack notification skipped: Slack client not initialized.")
            return {
                "success": False,
                "skipped": True,
                "error": "Slack client not initialized"
            }

        if not channel:
            logger.warning("Slack notification skipped: SLACK_CHANNEL missing.")
            return {
                "success": False,
                "skipped": True,
                "error": "SLACK_CHANNEL missing"
            }

        try:
            from slack_sdk.errors import SlackApiError
            client.chat_postMessage(channel=channel, text=message)
            logger.info("Slack notification sent successfully.")
            return {"success": True, "message": "Slack notification sent"}
        except SlackApiError as e:
            logger.error(f"Error sending Slack notification: {e}")
            return {"success": False, "error": str(e)}
