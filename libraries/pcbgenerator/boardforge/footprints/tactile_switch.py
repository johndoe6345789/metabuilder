from ..Component import Component


def apply(component: Component):
    offsets = [(-1.5, 0), (1.5, 0)]
    for i, (dx, dy) in enumerate(offsets, start=1):
        component.add_pin(str(i), dx=dx, dy=dy)
        component.add_pad(str(i), dx=dx, dy=dy, w=1.2, h=1.2)
