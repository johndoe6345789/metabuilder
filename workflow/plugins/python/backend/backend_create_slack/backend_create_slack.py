"""Workflow plugin: create Slack client."""
import os


def run(runtime, inputs):
    """Create a Slack client and store in runtime context.

    Inputs:
        token: Slack bot token (defaults to SLACK_BOT_TOKEN env var)
    """
    try:
        from slack_sdk import WebClient
    except ImportError:
        return {"success": False, "error": "slack_sdk package not installed"}

    token = inputs.get("token") or os.getenv("SLACK_BOT_TOKEN")

    if not token:
        return {"success": False, "error": "No token provided"}

    client = WebClient(token=token)

    runtime.context["slack"] = client

    return {"success": True}
