import math

class Pin:
    def __init__(self, name, comp_at, dx, dy, rotation=0):
        r = math.radians(rotation)
        self.name = name
        self.x = comp_at[0] + (dx * math.cos(r) - dy * math.sin(r))
        self.y = comp_at[1] + (dx * math.sin(r) + dy * math.cos(r))

    def __repr__(self):
        return f"Pin(name={self.name!r}, x={self.x:.3f}, y={self.y:.3f})"
