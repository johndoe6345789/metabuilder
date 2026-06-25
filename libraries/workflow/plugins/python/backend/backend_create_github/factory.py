"""Factory for CreateGitHub plugin."""

from .backend_create_github import CreateGitHub


def create():
    return CreateGitHub()
