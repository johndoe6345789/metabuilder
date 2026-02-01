"""Factory for ListConcat plugin."""

from .list_concat import ListConcat


fn create() -> ListConcat:
    """Create a new ListConcat plugin instance.

    Returns:
        A new ListConcat plugin instance.
    """
    return ListConcat()
