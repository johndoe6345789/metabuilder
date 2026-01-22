"""Factory for FilterList plugin."""

from .utils_filter_list import FilterList


def create():
    return FilterList()
