"""Factory for ValidateEntity plugin."""

from .validate_entity import ValidateEntity


def create():
    return ValidateEntity()
