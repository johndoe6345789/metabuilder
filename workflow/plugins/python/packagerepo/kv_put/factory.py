"""Factory for KvPut plugin."""

from .kv_put import KvPut


def create():
    return KvPut()
