from ..Component import Component


def apply(component: Component):
    pads = [
        ("A1", -3.5, 0),
        ("A2", -1.2, 0),
        ("A3", 1.2, 0),
        ("A4", 3.5, 0),
    ]
    for name, dx, dy in pads:
        component.add_pin(name, dx=dx, dy=dy)
        component.add_pad(name, dx=dx, dy=dy, w=0.9, h=1.2)
