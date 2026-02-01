"""Factory for AuthCheckScopes plugin."""

from .auth_check_scopes import AuthCheckScopes


def create():
    return AuthCheckScopes()
