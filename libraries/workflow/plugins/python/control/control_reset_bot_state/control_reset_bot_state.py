"""Workflow plugin: reset bot execution state."""

from ...base import NodeExecutor
from ..control_get_bot_status.control_get_bot_status import reset_bot_state


class ControlResetBotState(NodeExecutor):
    """Reset bot execution state."""

    node_type = "control.reset_bot_state"
    category = "control"
    description = "Reset bot execution state"

    def execute(self, inputs, runtime=None):
        """Reset bot execution state.

        Returns:
            Dictionary with:
                - reset: bool - Always True to indicate state was reset
        """
        reset_bot_state()
        return {"reset": True}
