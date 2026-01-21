"""Workflow plugin: reset bot execution state."""
from .control_get_bot_status import reset_bot_state


def run(_runtime, _inputs):
    """Reset bot execution state.

    Returns:
        Dictionary with:
            - reset: bool - Always True to indicate state was reset
    """
    reset_bot_state()
    return {"reset": True}
