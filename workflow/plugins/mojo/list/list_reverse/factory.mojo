"""Factory for ListReverse plugin."""

from .list_reverse import ListReverse


fn create() -> ListReverse:
    """Create a new ListReverse plugin instance.

    Returns:
        A new ListReverse plugin instance.
    """
    return ListReverse()
