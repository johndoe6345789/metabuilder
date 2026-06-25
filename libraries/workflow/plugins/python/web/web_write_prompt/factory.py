"""Factory for WebWritePrompt plugin."""

from .web_write_prompt import WebWritePrompt


def create():
    return WebWritePrompt()
