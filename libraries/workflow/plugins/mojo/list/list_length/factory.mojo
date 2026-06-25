"""Factory for ListLength plugin."""

from .list_length import ListLength


fn create() -> ListLength:
    """Create a new ListLength plugin instance.

    Returns:
        A new ListLength plugin instance.
    """
    return ListLength()
