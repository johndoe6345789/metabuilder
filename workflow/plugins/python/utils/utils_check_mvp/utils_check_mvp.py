"""Workflow plugin: check if MVP is reached."""
import os
import re


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


def run(_runtime, _inputs):
    """Check if the MVP section in ROADMAP.md is completed."""
    mvp_reached = _is_mvp_reached()
    return {"mvp_reached": mvp_reached}
