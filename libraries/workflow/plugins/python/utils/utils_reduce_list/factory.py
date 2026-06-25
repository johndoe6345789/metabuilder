"""Factory for ReduceList plugin."""

from .utils_reduce_list import ReduceList


def create():
    return ReduceList()
