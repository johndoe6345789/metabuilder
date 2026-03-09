import math
from .Pin import Pin

class Pad:
    def __init__(self, name, comp, dx, dy, w, h, rotation=0):
        r = math.radians(rotation)
        self.name = name
        self.x = comp.at[0] + (dx * math.cos(r) - dy * math.sin(r))
        self.y = comp.at[1] + (dx * math.sin(r) + dy * math.cos(r))
        self.w = w
        self.h = h
        self.component = comp
        # Attributes for more advanced pad types
        self.castellated = False
        self.plated = True
        self.edge = None

class Component:
    def __init__(self, ref, type, at, rotation=0):
        self.ref = ref
        self.type = type
        self.at = at
        self.rotation = rotation
        self.pads = []
        self.pins = {}

    def add_pad(self, name, dx, dy, w, h, castellated=False, plated=True, edge=None):
        pad = Pad(name, self, dx, dy, w, h, self.rotation)
        pad.castellated = castellated
        pad.plated = plated
        pad.edge = edge
        self.pads.append(pad)
        return pad

    def add_castellated_pad(self, name, board, edge, offset, diameter=1.0, plated=True):
        """Place a pad centred on the given board edge."""
        if edge not in {"top", "bottom", "left", "right"}:
            raise ValueError("edge must be one of 'top', 'bottom', 'left', 'right'")

        if edge in {"top", "bottom"}:
            x = offset
            y = board.height if edge == "top" else 0
        else:
            x = board.width if edge == "right" else 0
            y = offset

        r = math.radians(self.rotation)
        dx = (x - self.at[0]) * math.cos(r) + (y - self.at[1]) * math.sin(r)
        dy = -(x - self.at[0]) * math.sin(r) + (y - self.at[1]) * math.cos(r)

        return self.add_pad(name, dx, dy, diameter, diameter, castellated=True, plated=plated, edge=edge)

    def add_pin(self, name, dx, dy):
        pin = Pin(name, self.at, dx, dy, self.rotation)
        self.pins[name] = pin
        return pin

    def pin(self, name):
        return self.pins.get(name)

    def load_footprint(self, name):
        """Populate this component using a named footprint."""
        from .footprints import get_footprint
        loader = get_footprint(name)
        loader(self)
        return self
