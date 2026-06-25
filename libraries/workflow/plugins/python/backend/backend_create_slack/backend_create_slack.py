"""Workflow plugin: create Slack client."""

import os

from ...base import NodeExecutor


class CreateSlack(NodeExecutor):
    """Create a Slack client and store in runtime context."""

    node_type = "backend.create_slack"
    category = "backend"
    description = "Create Slack client for messaging"

    def execute(self, inputs, runtime=None):
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
