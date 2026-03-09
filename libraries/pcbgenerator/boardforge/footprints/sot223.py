from ..Component import Component


def apply(component: Component):
    pads = [
        ("1", -2.3, -2),
        ("2", 0.0, -2),
        ("3", 2.3, -2),
        ("TAB", 0.0, 2.0),
    ]
    for name, dx, dy in pads:
        component.add_pin(name, dx=dx, dy=dy)
        if name == "TAB":
            component.add_pad(name, dx=dx, dy=dy, w=6.0, h=3.0)
        else:
            component.add_pad(name, dx=dx, dy=dy, w=1.5, h=1.5)
