"""Notification helpers for workflow plugins."""
import os
import logging
import asyncio

logger = logging.getLogger("autometabuilder.notifications")


def send_slack_notification(runtime, message: str):
    """Send a notification to Slack using client from runtime context."""
    client = runtime.context.get("slack_client") if runtime else None
    channel = os.environ.get("SLACK_CHANNEL")

    if not client:
        logger.warning("Slack notification skipped: Slack client not initialized.")
        return

    if not channel:
        logger.warning("Slack notification skipped: SLACK_CHANNEL missing.")
        return

    try:
        from slack_sdk.errors import SlackApiError
        client.chat_postMessage(channel=channel, text=message)
        logger.info("Slack notification sent successfully.")
    except SlackApiError as e:
        logger.error(f"Error sending Slack notification: {e}")


async def send_discord_notification_async(message: str, token: str, intents, channel_id: str):
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


def send_discord_notification(runtime, message: str):
    """Send a Discord notification using config from runtime context."""
    token = runtime.context.get("discord_token") if runtime else None
    intents = runtime.context.get("discord_intents") if runtime else None
    channel_id = os.environ.get("DISCORD_CHANNEL_ID")

    if not token:
        logger.warning("Discord notification skipped: Discord client not initialized.")
        return

    if not channel_id:
        logger.warning("Discord notification skipped: DISCORD_CHANNEL_ID missing.")
        return

    try:
        asyncio.run(send_discord_notification_async(message, token, intents, channel_id))
    except Exception as e:
        logger.error(f"Error running Discord notification: {e}")


def notify_all(runtime, message: str):
    """Send notification to all configured channels."""
    send_slack_notification(runtime, message)
    send_discord_notification(runtime, message)
