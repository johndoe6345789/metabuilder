"""Workflow plugin: start bot execution in background thread."""

import os
import subprocess
import sys
import threading
import time

from ...base import NodeExecutor
from ..control_get_bot_status.control_get_bot_status import (
    get_bot_state,
    reset_bot_state,
)

# Import global state
import workflow.plugins.python.control.control_get_bot_status.control_get_bot_status as bot_status


def _run_bot_task(mode: str, iterations: int, yolo: bool, stop_at_mvp: bool) -> None:
    """Execute bot task in background thread."""
    bot_status._current_run_config = {
        "mode": mode,
        "iterations": iterations,
        "yolo": yolo,
        "stop_at_mvp": stop_at_mvp,
    }

    if os.environ.get("MOCK_WEB_UI") == "true":
        bot_status._mock_running = True
        time.sleep(5)
        bot_status._mock_running = False
        reset_bot_state()
        return

    try:
        cmd = [sys.executable, "-m", "autometabuilder.main"]
        if yolo:
            cmd.append("--yolo")
        if mode == "once":
            cmd.append("--once")
        if mode == "iterations" and iterations > 1:
            for _ in range(iterations):
                if stop_at_mvp:
                    # Check MVP status
                    pass
                bot_status._bot_process = subprocess.Popen(
                    cmd + ["--once"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT
                )
                bot_status._bot_process.wait()
        else:
            bot_status._bot_process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT
            )
            bot_status._bot_process.wait()
    finally:
        reset_bot_state()


class ControlStartBot(NodeExecutor):
    """Start bot execution in background thread."""

    node_type = "control.start_bot"
    category = "control"
    description = "Start bot execution in background thread"

    def execute(self, inputs, runtime=None):
        """Start bot execution in background thread.

        Args:
            inputs: Dictionary with keys:
                - mode: str (default: "once") - Execution mode ("once", "iterations", etc.)
                - iterations: int (default: 1) - Number of iterations for "iterations" mode
                - yolo: bool (default: True) - Run in YOLO mode
                - stop_at_mvp: bool (default: False) - Stop when MVP is reached

        Returns:
            Dictionary with:
                - started: bool - Whether the bot was started successfully
                - error: str (optional) - Error message if bot is already running
        """
        mode = inputs.get("mode", "once")
        iterations = inputs.get("iterations", 1)
        yolo = inputs.get("yolo", True)
        stop_at_mvp = inputs.get("stop_at_mvp", False)

        # Check if bot is already running
        state = get_bot_state()
        if state["is_running"]:
            return {"started": False, "error": "Bot already running"}

        # Start bot in background thread
        thread = threading.Thread(
            target=_run_bot_task,
            args=(mode, iterations, yolo, stop_at_mvp),
            daemon=True
        )
        thread.start()

        return {"started": True}
