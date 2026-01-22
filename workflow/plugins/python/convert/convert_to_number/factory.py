"""Factory for ConvertToNumber plugin."""

from .convert_to_number import ConvertToNumber


def create():
    return ConvertToNumber()
