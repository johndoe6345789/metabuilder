from ..Component import Component

PITCH = 0.5
WIDTH = 9.0


def apply(component: Component):
    # Signal pins
    for i in range(19):
        x = -4.5 + i * PITCH
        component.add_pin(f"P{i+1}", dx=x, dy=0)
        component.add_pad(f"P{i+1}", dx=x, dy=0, w=0.3, h=2.6)
    # Mechanical pads
    mech = [(-WIDTH/2, -2.4), (WIDTH/2, -2.4), (-WIDTH/2, 2.4), (WIDTH/2, 2.4)]
    for j, (dx, dy) in enumerate(mech, start=1):
        name = f"M{j}"
        component.add_pin(name, dx=dx, dy=dy)
        component.add_pad(name, dx=dx, dy=dy, w=1.5, h=1.5)
