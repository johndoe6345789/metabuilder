from ..Component import Component

PITCH = 1.27
ROW = 5.4


def apply(component: Component):
    for i in range(4):
        dy = (i - 1.5) * PITCH
        component.add_pin(str(i + 1), dx=-ROW/2, dy=dy)
        component.add_pad(str(i + 1), dx=-ROW/2, dy=dy, w=0.6, h=1.6)
        component.add_pin(str(i + 5), dx=ROW/2, dy=-dy)
        component.add_pad(str(i + 5), dx=ROW/2, dy=-dy, w=0.6, h=1.6)
