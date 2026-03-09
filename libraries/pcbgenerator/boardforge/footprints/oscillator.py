from ..Component import Component


def apply(component: Component):
    pads = [
        ("1", -1.0, 0.8),
        ("2", 1.0, 0.8),
        ("3", -1.0, -0.8),
        ("4", 1.0, -0.8),
    ]
    for name, dx, dy in pads:
        component.add_pin(name, dx=dx, dy=dy)
        component.add_pad(name, dx=dx, dy=dy, w=1.0, h=1.2)
