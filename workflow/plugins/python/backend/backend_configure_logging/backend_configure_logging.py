"""Workflow plugin: configure logging."""

import logging
import sys

from ...base import NodeExecutor


class ConfigureLogging(NodeExecutor):
    """Configure logging for the workflow runtime."""

    node_type = "backend.configure_logging"
    category = "backend"
    description = "Configure logging for workflow runtime"

    def execute(self, inputs, runtime=None):
        """Configure logging for the workflow runtime.

        Inputs:
            level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            format: Log format string
            file: Optional file path for log output
        """
        level_str = inputs.get("level", "INFO").upper()
        log_format = inputs.get("format", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        log_file = inputs.get("file")

        level = getattr(logging, level_str, logging.INFO)

        handlers = [logging.StreamHandler(sys.stdout)]
        if log_file:
            handlers.append(logging.FileHandler(log_file))

        logging.basicConfig(
            level=level,
            format=log_format,
            handlers=handlers
        )

        logger = logging.getLogger("metabuilder")
        logger.setLevel(level)

        runtime.context["logger"] = logger

        return {"success": True, "level": level_str}
