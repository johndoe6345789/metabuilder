"""Factory for WebBuildPromptYaml plugin."""

from .web_build_prompt_yaml import WebBuildPromptYaml


def create():
    return WebBuildPromptYaml()
