"""Workflow plugin: update roadmap file."""
import logging

logger = logging.getLogger("metabuilder")


def _update_roadmap(content: str):
    """Update ROADMAP.md with new content."""
    with open("ROADMAP.md", "w", encoding="utf-8") as f:
        f.write(content)
    logger.info("ROADMAP.md updated successfully.")


def run(_runtime, inputs):
    """Update ROADMAP.md with new content."""
    content = inputs.get("content")
    if not content:
        return {"error": "Content is required"}

    _update_roadmap(content)
    return {"result": "ROADMAP.md updated successfully"}
