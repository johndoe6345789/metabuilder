"""Factory for WebGetPromptContent plugin."""

from .web_get_prompt_content import WebGetPromptContent


def create():
    return WebGetPromptContent()
