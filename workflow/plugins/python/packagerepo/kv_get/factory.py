"""Factory for KvGet plugin."""

from .kv_get import KvGet


def create():
    return KvGet()
