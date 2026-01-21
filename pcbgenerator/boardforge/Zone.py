from shapely.geometry import Polygon


class Zone:
    """Represents a filled copper area on a given layer."""

    def __init__(self, net=None, layer="GBL", geometry=None):
        self.net = net
        self.layer = layer
        self.geometry = Polygon(geometry) if geometry is not None else None
