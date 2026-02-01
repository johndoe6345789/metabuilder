"""Factory for LoadEnv plugin."""

from .backend_load_env import LoadEnv


def create():
    return LoadEnv()
