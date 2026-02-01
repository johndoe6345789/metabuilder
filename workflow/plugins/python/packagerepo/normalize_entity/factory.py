"""Factory for NormalizeEntity plugin."""

from .normalize_entity import NormalizeEntity


def create():
    return NormalizeEntity()
