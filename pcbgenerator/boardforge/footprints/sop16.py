from ..Component import Component

PITCH = 1.27
ROW = 4.0


def apply(component: Component):
    for i in range(8):
        y = (i - 3.5) * PITCH
        component.add_pin(str(i + 1), dx=-ROW/2, dy=y)
        component.add_pad(str(i + 1), dx=-ROW/2, dy=y, w=0.6, h=1.5)
        component.add_pin(str(i + 9), dx=ROW/2, dy=-y)
        component.add_pad(str(i + 9), dx=ROW/2, dy=-y, w=0.6, h=1.5)
