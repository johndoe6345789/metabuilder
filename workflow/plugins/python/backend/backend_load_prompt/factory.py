"""Factory for LoadPrompt plugin."""

from .backend_load_prompt import LoadPrompt


def create():
    return LoadPrompt()
