"""Factory for RespondError plugin."""

from .respond_error import RespondError


def create():
    return RespondError()
