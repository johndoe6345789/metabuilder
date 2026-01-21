"""Workflow plugin: create Discord client."""
import os


def run(runtime, inputs):
    """Create a Discord webhook client and store in runtime context.

    Inputs:
        webhook_url: Discord webhook URL (defaults to DISCORD_WEBHOOK_URL env var)
    """
    webhook_url = inputs.get("webhook_url") or os.getenv("DISCORD_WEBHOOK_URL")

    if not webhook_url:
        return {"success": False, "error": "No webhook URL provided"}

    runtime.context["discord_webhook"] = webhook_url

    return {"success": True}
