"""Factory for BuildToolMap plugin."""

from .backend_build_tool_map import BuildToolMap


def create():
    return BuildToolMap()
