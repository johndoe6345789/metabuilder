"""Factory for UpdateRoadmap plugin."""

from .utils_update_roadmap import UpdateRoadmap


def create():
    return UpdateRoadmap()
