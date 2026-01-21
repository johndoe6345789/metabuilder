from ..Component import Component

PITCH = 2.54


def apply(component: Component):
    for i in range(5):
        dy = i * PITCH
        name = str(i + 1)
        component.add_pin(name, dx=0, dy=dy)
        component.add_pad(name, dx=0, dy=dy, w=1.0, h=1.5)
