"""Factory for AuthVerifyJwt plugin."""

from .auth_verify_jwt import AuthVerifyJwt


def create():
    return AuthVerifyJwt()
