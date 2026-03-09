from ..Component import Component

PITCH = 0.5
ROW = 7.0


def apply(component: Component):
    count = 12
    offset = (count - 1) * PITCH / 2
    for i in range(count):
        dy = -offset + i * PITCH
        component.add_pin(str(i + 1), dx=-ROW/2, dy=dy)
        component.add_pad(str(i + 1), dx=-ROW/2, dy=dy, w=0.3, h=0.6)
        component.add_pin(str(i + count + 1), dx=ROW/2, dy=-dy)
        component.add_pad(str(i + count + 1), dx=ROW/2, dy=-dy, w=0.3, h=0.6)
    for i in range(count):
        dx = -offset + i * PITCH
        component.add_pin(str(i + 2*count + 1), dx=dx, dy=ROW/2)
        component.add_pad(str(i + 2*count + 1), dx=dx, dy=ROW/2, w=0.3, h=0.6)
        component.add_pin(str(i + 3*count + 1), dx=-dx, dy=-ROW/2)
        component.add_pad(str(i + 3*count + 1), dx=-dx, dy=-ROW/2, w=0.3, h=0.6)
