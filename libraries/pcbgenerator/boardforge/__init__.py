from .Pin import Pin
from .Pad import Pad
from .Component import Component
from .Via import Via
from .Graphic import Graphic
from .Board import Board

# Expose useful Board helper methods at module level
chamfer_outline = Board.chamfer_outline
from .Zone import Zone
from .drc import check_board, DRCError
from .rules import LAYER_SERVICE_RULES
from .circuits import (
    create_voltage_divider,
    create_led_indicator,
    create_rc_lowpass,
    create_bent_trace,
)

# Default symbolic layer names
TOP_SILK = "GTO"
BOTTOM_SILK = "GBO"

PCB = Board

from enum import Enum


class Layer(str, Enum):
    TOP_COPPER = "GTL"
    BOTTOM_COPPER = "GBL"
    TOP_SILK = TOP_SILK
    BOTTOM_SILK = BOTTOM_SILK


class Footprint(Enum):
    ESP32_WROOM = "ESP32_WROOM"
    SOP16 = "SOP16"
    SOT223 = "SOT223"
    USB_C_CUTOUT = "USB_C_CUTOUT"
    C0603 = "C0603"
    TACTILE_SWITCH = "TACTILE_SWITCH"
    HEADER_1x5 = "HEADER_1x5"
    HDMI = "HDMI"
    BT815 = "BT815"
    W25Q64J = "W25Q64J"
    OSCILLATOR = "OSCILLATOR"
    SOT23_5 = "SOT23_5"


__all__ = [
    "Board",
    "PCB",
    "Component",
    "Pin",
    "Pad",
    "Via",
    "Zone",
    "Graphic",
    "Layer",
    "Footprint",
    "create_voltage_divider",
    "create_led_indicator",
    "create_rc_lowpass",
    "create_bent_trace",
    "chamfer_outline",
    "TOP_SILK",
    "BOTTOM_SILK",
    "check_board",
    "DRCError",
    "LAYER_SERVICE_RULES",
]
