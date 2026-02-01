"""Workflow plugin: append tool results."""

import os
import re

from ...base import NodeExecutor


def _is_mvp_reached() -> bool:
    """Check if the MVP section in ROADMAP.md is completed."""
    if not os.path.exists("ROADMAP.md"):
        return False

    with open("ROADMAP.md", "r", encoding="utf-8") as f:
        content = f.read()

    # Find the header line containing (MVP)
    header_match = re.search(r"^## .*?\(MVP\).*?$", content, re.MULTILINE | re.IGNORECASE)
    if not header_match:
        return False

    start_pos = header_match.end()
    next_header_match = re.search(r"^## ", content[start_pos:], re.MULTILINE)
    if next_header_match:
        mvp_section = content[start_pos : start_pos + next_header_match.start()]
    else:
        mvp_section = content[start_pos:]

    if "[ ]" in mvp_section:
        return False
    if "[x]" in mvp_section:
        return True

    return False


class CoreAppendToolResults(NodeExecutor):
    """Append tool results to the message list."""

    node_type = "core.append_tool_results"
    category = "core"
    description = "Append tool execution results to the message list"

    def execute(self, inputs, runtime=None):
        """Append tool results to the message list."""
        messages = list(inputs.get("messages") or [])
        tool_results = inputs.get("tool_results") or []
        if tool_results:
            messages.extend(tool_results)

        if runtime.context.get("args", {}).get("yolo") and _is_mvp_reached():
            runtime.logger.info("MVP reached. Stopping YOLO loop.")

        return {"messages": messages}
