from .Board import Board, TOP_SILK, BOTTOM_SILK


def create_voltage_divider():
    """Return a board with a simple voltage divider (two resistors)."""
    board = Board(width=7, height=5)
    board.set_layer_stack(["GTL", "GBL", TOP_SILK, BOTTOM_SILK])

    vin = board.add_component("VIN", ref="J1", at=(0.5, 2.5))
    vin.add_pin("VCC", dx=0, dy=0)
    vin.add_pin("GND", dx=0, dy=-1)
    vin.add_pad("VCC", dx=0, dy=0, w=1, h=1)
    vin.add_pad("GND", dx=0, dy=-1, w=1, h=1)

    r1 = board.add_component("RES", ref="R1", at=(2.5, 2.5))
    r1.add_pin("A", dx=-0.5, dy=0)
    r1.add_pin("B", dx=0.5, dy=0)
    r1.add_pad("A", dx=-0.5, dy=0, w=1, h=1)
    r1.add_pad("B", dx=0.5, dy=0, w=1, h=1)

    r2 = board.add_component("RES", ref="R2", at=(4.7, 2.5))
    r2.add_pin("A", dx=-0.5, dy=0)
    r2.add_pin("B", dx=0.5, dy=0)
    r2.add_pad("A", dx=-0.5, dy=0, w=1, h=1)
    r2.add_pad("B", dx=0.5, dy=0, w=1, h=1)

    vout = board.add_component("VOUT", ref="J2", at=(6.4, 2.5))
    vout.add_pin("OUT", dx=0, dy=0)
    vout.add_pad("OUT", dx=0, dy=0, w=1, h=1)

    board.trace(vin.pin("VCC"), r1.pin("A"))
    board.trace(r1.pin("B"), r2.pin("A"))
    board.trace(r2.pin("B"), vout.pin("OUT"))
    board.trace(r2.pin("B"), vin.pin("GND"))

    return board


def create_led_indicator():
    """Return a board with a battery, resistor and LED."""
    board = Board(width=7, height=5)
    board.set_layer_stack(["GTL", "GBL", TOP_SILK, BOTTOM_SILK])

    bat = board.add_component("BAT", ref="BT1", at=(0.5, 2))
    bat.add_pin("VCC", dx=0, dy=0)
    bat.add_pin("GND", dx=0, dy=-1)
    bat.add_pad("VCC", dx=0, dy=0, w=1, h=1)
    bat.add_pad("GND", dx=0, dy=-1, w=1, h=1)

    r = board.add_component("RES", ref="R1", at=(2.5, 2))
    r.add_pin("A", dx=-0.5, dy=0)
    r.add_pin("B", dx=0.5, dy=0)
    r.add_pad("A", dx=-0.5, dy=0, w=1, h=1)
    r.add_pad("B", dx=0.5, dy=0, w=1, h=1)

    led = board.add_component("LED", ref="D1", at=(4.7, 2))
    led.add_pin("A", dx=-0.5, dy=0)
    led.add_pin("K", dx=0.5, dy=0)
    led.add_pad("A", dx=-0.5, dy=0, w=1, h=1)
    led.add_pad("K", dx=0.5, dy=0, w=1, h=1)

    board.trace(bat.pin("VCC"), r.pin("A"))
    board.trace(r.pin("B"), led.pin("A"))
    board.trace(led.pin("K"), bat.pin("GND"))

    return board


def create_rc_lowpass():
    """Return a board with a resistor and capacitor configured as a low-pass filter."""
    board = Board(width=7, height=5)
    board.set_layer_stack(["GTL", "GBL", TOP_SILK, BOTTOM_SILK])

    j1 = board.add_component("IN", ref="J1", at=(0.5, 2.5))
    j1.add_pin("VIN", dx=0, dy=0)
    j1.add_pin("GND", dx=0, dy=-1)
    j1.add_pad("VIN", dx=0, dy=0, w=1, h=1)
    j1.add_pad("GND", dx=0, dy=-1, w=1, h=1)

    r = board.add_component("RES", ref="R1", at=(2.5, 2.5))
    r.add_pin("A", dx=-0.5, dy=0)
    r.add_pin("B", dx=0.5, dy=0)
    r.add_pad("A", dx=-0.5, dy=0, w=1, h=1)
    r.add_pad("B", dx=0.5, dy=0, w=1, h=1)

    c = board.add_component("CAP", ref="C1", at=(4.8, 2.5))
    c.add_pin("A", dx=0, dy=0)
    c.add_pin("B", dx=0, dy=-1)
    c.add_pad("A", dx=0, dy=0, w=1, h=1)
    c.add_pad("B", dx=0, dy=-1, w=1, h=1)

    j2 = board.add_component("OUT", ref="J2", at=(6.3, 2.5))
    j2.add_pin("VOUT", dx=0, dy=0)
    j2.add_pad("VOUT", dx=0, dy=0, w=1, h=1)

    board.trace(j1.pin("VIN"), r.pin("A"))
    board.trace(r.pin("B"), j2.pin("VOUT"))
    board.trace(r.pin("B"), c.pin("A"))
    board.trace(c.pin("B"), j1.pin("GND"))

    return board


def create_bent_trace(path=None):
    """Return a board demonstrating a trace with a bend.

    Parameters
    ----------
    path : list, optional
        Sequence of coordinates or Pin objects representing the trace path.
        If omitted, a default 90-degree bend is used.
    """
    board = Board(width=5, height=5)
    board.set_layer_stack(["GTL", "GBL", TOP_SILK, BOTTOM_SILK])

    j1 = board.add_component("IN", ref="J1", at=(0.5, 2.5))
    j1.add_pin("SIG", dx=0, dy=0)
    j1.add_pad("SIG", dx=0, dy=0, w=1, h=1)

    j2 = board.add_component("OUT", ref="J2", at=(4.5, 2.5))
    j2.add_pin("SIG", dx=0, dy=0)
    j2.add_pad("SIG", dx=0, dy=0, w=1, h=1)

    if path is None:
        path = [j1.pin("SIG"), (2.5, 4.0), j2.pin("SIG")]
    board.trace_path(path)

    return board
