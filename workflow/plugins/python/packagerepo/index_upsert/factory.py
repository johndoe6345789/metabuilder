"""Factory for IndexUpsert plugin."""

from .index_upsert import IndexUpsert


def create():
    return IndexUpsert()
