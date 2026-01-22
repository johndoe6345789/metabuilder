"""Workflow plugin: get recent logs."""

from pathlib import Path

from ...base import NodeExecutor


class WebGetRecentLogs(NodeExecutor):
    """Get recent log entries."""

    node_type = "web.get_recent_logs"
    category = "web"
    description = "Get recent log entries"

    def execute(self, inputs, runtime=None):
        """Get recent log entries."""
        lines = inputs.get("lines", 50)
        log_file = Path("metabuilder.log")

        if not log_file.exists():
            return {"result": ""}

        with log_file.open("r", encoding="utf-8") as handle:
            content = handle.readlines()

        return {"result": "".join(content[-lines:])}
