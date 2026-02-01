"""Factory for RespondJson plugin."""

from .respond_json import RespondJson


def create():
    return RespondJson()
