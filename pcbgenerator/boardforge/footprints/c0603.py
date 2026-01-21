from ..Component import Component

PITCH = 1.0


def apply(component: Component):
    component.add_pin("1", dx=-PITCH/2, dy=0)
    component.add_pin("2", dx=PITCH/2, dy=0)
    component.add_pad("1", dx=-PITCH/2, dy=0, w=0.8, h=0.9)
    component.add_pad("2", dx=PITCH/2, dy=0, w=0.8, h=0.9)
