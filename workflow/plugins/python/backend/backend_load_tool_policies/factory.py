"""Factory for LoadToolPolicies plugin."""

from .backend_load_tool_policies import LoadToolPolicies


def create():
    return LoadToolPolicies()
