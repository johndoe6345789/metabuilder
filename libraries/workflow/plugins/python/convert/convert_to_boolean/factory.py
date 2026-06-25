"""Factory for ConvertToBoolean plugin."""

from .convert_to_boolean import ConvertToBoolean


def create():
    return ConvertToBoolean()
