"""Workflow plugin: get current bot execution status."""

from ...base import NodeExecutor

# Global state for bot process
_bot_process = None
_mock_running = False
_current_run_config = {}


def get_bot_state():
    """Get the current bot state (public interface).

    Returns:
        dict: Bot state with keys: is_running, config, process
    """
    return {
        "is_running": _bot_process is not None or _mock_running,
        "config": _current_run_config,
        "process": _bot_process,
    }


def reset_bot_state():
    """Reset the bot state (public interface)."""
    global _bot_process, _current_run_config, _mock_running
    _bot_process = None
    _current_run_config = {}
    _mock_running = False


class ControlGetBotStatus(NodeExecutor):
    """Get current bot execution status."""

    node_type = "control.get_bot_status"
    category = "control"
    description = "Get current bot execution status"

    def execute(self, inputs, runtime=None):
        """Get current bot execution status.

        Returns:
            Dictionary with:
                - is_running: bool - Whether the bot is currently running
                - config: dict - Current run configuration (empty if not running)
                - process: object - Bot process object (or None if not running)
        """
        return get_bot_state()
