"""Factory for BlobPut plugin."""

from .blob_put import BlobPut


def create():
    return BlobPut()
