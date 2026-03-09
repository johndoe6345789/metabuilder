from ..Component import Component

PITCH = 0.95
ROW = 1.6


def apply(component: Component):
    # bottom row pins 1-3
    for i in range(3):
        x = (i - 1) * PITCH
        component.add_pin(str(i + 1), dx=x, dy=-ROW/2)
        component.add_pad(str(i + 1), dx=x, dy=-ROW/2, w=0.6, h=1.1)
    # top row pins 4-5
    for i in range(2):
        x = (i * PITCH) - PITCH/2
        component.add_pin(str(i + 4), dx=x, dy=ROW/2)
        component.add_pad(str(i + 4), dx=x, dy=ROW/2, w=0.6, h=1.1)
