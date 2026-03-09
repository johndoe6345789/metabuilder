from ..Component import Component

PITCH = 2.0
ROW = 18.0


def apply(component: Component):
    for i in range(19):
        dy = (i - 9) * PITCH
        component.add_pin(f"P{i+1}", dx=-ROW/2, dy=dy)
        component.add_pad(f"P{i+1}", dx=-ROW/2, dy=dy, w=1.0, h=1.5)
        component.add_pin(f"P{i+20}", dx=ROW/2, dy=dy)
        component.add_pad(f"P{i+20}", dx=ROW/2, dy=dy, w=1.0, h=1.5)
