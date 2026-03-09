"""Example boards packaged with BoardForge."""

from importlib import import_module

__all__ = [
    "arduino_like",
    "bent_trace",
    "buck_boost_converter",
    "cuflow_clockpwr",
    "cuflow_demo",
    "dazzler",
    "esp32_dev_board",
]

# Lazily import submodules when accessed

def __getattr__(name):
    if name in __all__:
        return import_module(f"{__name__}.{name}")
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
