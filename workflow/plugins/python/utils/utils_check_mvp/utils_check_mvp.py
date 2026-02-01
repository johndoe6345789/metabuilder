"""Workflow plugin: check if MVP is reached."""

import os
import re

from ...base import NodeExecutor


class CheckMvp(NodeExecutor):
    """Check if the MVP section in ROADMAP.md is completed."""

    node_type = "utils.check_mvp"
    category = "utils"
    description = "Check if the MVP section in ROADMAP.md is completed"

    def execute(self, inputs, runtime=None):
        """Check if the MVP section in ROADMAP.md is completed."""
        mvp_reached = self._is_mvp_reached()
        return {"mvp_reached": mvp_reached}

    def _is_mvp_reached(self) -> bool:
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
