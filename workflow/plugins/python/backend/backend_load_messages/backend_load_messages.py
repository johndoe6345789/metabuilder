"""Workflow plugin: load UI/CLI messages."""

import os
import json

from ...base import NodeExecutor


class LoadMessages(NodeExecutor):
    """Load UI/CLI messages for localization."""

    node_type = "backend.load_messages"
    category = "backend"
    description = "Load UI/CLI messages for localization"

    def execute(self, inputs, runtime=None):
        """Load UI/CLI messages for localization.

        Inputs:
            path: Path to messages file
            locale: Locale code (default: en)
        """
        path = inputs.get("path", "config/messages")
        locale = inputs.get("locale", "en")

        messages_file = os.path.join(path, f"{locale}.json")

        if not os.path.exists(messages_file):
            messages_file = os.path.join(path, "en.json")  # Fallback

        if not os.path.exists(messages_file):
            return {"success": False, "error": "No messages file found"}

        with open(messages_file) as f:
            messages = json.load(f)

        runtime.context["msgs"] = messages

        return {"success": True, "locale": locale, "message_count": len(messages)}
