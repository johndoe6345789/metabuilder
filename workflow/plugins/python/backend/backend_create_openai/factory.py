"""Factory for CreateOpenAI plugin."""

from .backend_create_openai import CreateOpenAI


def create():
    return CreateOpenAI()
