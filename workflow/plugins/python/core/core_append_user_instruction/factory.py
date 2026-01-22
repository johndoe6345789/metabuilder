"""Factory for CoreAppendUserInstruction plugin."""

from .core_append_user_instruction import CoreAppendUserInstruction


def create():
    """Create a new CoreAppendUserInstruction instance."""
    return CoreAppendUserInstruction()
