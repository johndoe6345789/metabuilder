"""Workflow plugin: update roadmap file."""

import logging

from ...base import NodeExecutor

logger = logging.getLogger("metabuilder")


class UpdateRoadmap(NodeExecutor):
    """Update ROADMAP.md with new content."""

    node_type = "utils.update_roadmap"
    category = "utils"
    description = "Update ROADMAP.md with new content"

    def execute(self, inputs, runtime=None):
        """Update ROADMAP.md with new content."""
        content = inputs.get("content")
        if not content:
            return {"error": "Content is required"}

        self._update_roadmap(content)
        return {"result": "ROADMAP.md updated successfully"}

    def _update_roadmap(self, content: str):
        """Update ROADMAP.md with new content."""
        with open("ROADMAP.md", "w", encoding="utf-8") as f:
            f.write(content)
        logger.info("ROADMAP.md updated successfully.")
