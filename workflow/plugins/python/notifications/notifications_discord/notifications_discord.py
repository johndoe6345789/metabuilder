"""Workflow plugin: send Discord notification."""

import os
import logging
import asyncio

from ...base import NodeExecutor

logger = logging.getLogger("metabuilder.notifications")


async def _send_discord_notification_async(message: str, token: str, intents, channel_id: str):
    """Send Discord notification asynchronously."""
    import discord

    client = discord.Client(intents=intents)

    @client.event
    async def on_ready():
        channel = client.get_channel(int(channel_id))
        if channel:
            await channel.send(message)
            logger.info("Discord notification sent successfully.")
        await client.close()

    try:
        await client.start(token)
    except Exception as e:
        logger.error(f"Error sending Discord notification: {e}")
        raise


class NotificationsDiscord(NodeExecutor):
    """Send a notification to Discord."""

    node_type = "notifications.discord"
    category = "notifications"
    description = "Send a notification to Discord"

    def execute(self, inputs, runtime=None):
        """Send a notification to Discord.

        Inputs:
            message: The message to send
            channel_id: Optional channel ID (defaults to DISCORD_CHANNEL_ID env var)

        Returns:
            dict: Contains success status and any error message
        """
        message = inputs.get("message", "")
        channel_id = inputs.get("channel_id") or os.environ.get("DISCORD_CHANNEL_ID")

        token = runtime.context.get("discord_token") if runtime else None
        intents = runtime.context.get("discord_intents") if runtime else None

        if not token:
            logger.warning("Discord notification skipped: Discord client not initialized.")
            return {
                "success": False,
                "skipped": True,
                "error": "Discord client not initialized"
            }

        if not channel_id:
            logger.warning("Discord notification skipped: DISCORD_CHANNEL_ID missing.")
            return {
                "success": False,
                "skipped": True,
                "error": "DISCORD_CHANNEL_ID missing"
            }

        try:
            asyncio.run(_send_discord_notification_async(message, token, intents, channel_id))
            return {"success": True, "message": "Discord notification sent"}
        except Exception as e:
            logger.error(f"Error running Discord notification: {e}")
            return {"success": False, "error": str(e)}
