from pathlib import Path
from boardforge import PCB, Layer

BASE_DIR = Path(__file__).resolve().parent
FONT_PATH = BASE_DIR.parent / "fonts" / "RobotoMono.ttf"
OUTPUT_DIR = BASE_DIR.parent / "output"


def build_board():
    board = PCB(width=60, height=35)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    # Mounting holes
    holes = [(3, 3), (57, 3), (3, 32), (57, 32)]
    for i, (x, y) in enumerate(holes):
        h = board.add_component("MTG", ref=f"H{i+1}", at=(x, y))
        h.add_pin("P", dx=0, dy=0)
        h.add_pad("P", dx=0, dy=0, w=1.5, h=1.5)

    # ESP32 module
    esp32 = board.add_component("ESP32", ref="U1", at=(20, 10))
    for name, dx, dy in [
        ("3V3", -2, 2),
        ("GND", -2, -2),
        ("EN", 0, 2),
        ("IO0", 0, -2),
        ("TX", 2, 2),
        ("RX", 2, -2),
    ]:
        esp32.add_pin(name, dx=dx, dy=dy)
        esp32.add_pad(name, dx=dx, dy=dy, w=1, h=1)

    # CH340C USB-UART bridge
    ch340 = board.add_component("CH340C", ref="U2", at=(42, 10))
    for name, dx, dy in [
        ("TXD", -2, 1),
        ("RXD", -2, -1),
        ("GND", 2, -1),
        ("VCC", 2, 1),
    ]:
        ch340.add_pin(name, dx=dx, dy=dy)
        ch340.add_pad(name, dx=dx, dy=dy, w=1, h=1)

    # Voltage regulator
    ldo = board.add_component("AMS1117", ref="U3", at=(30, 25))
    for name, dx, dy in [
        ("VIN", -2, 0),
        ("VOUT", 2, 0),
        ("GND", 0, 2),
    ]:
        ldo.add_pin(name, dx=dx, dy=dy)
        ldo.add_pad(name, dx=dx, dy=dy, w=1, h=1)

    # USB-C connector
    usb = board.add_component("USB-C", ref="J1", at=(30, 0))
    for name, dx, dy in [
        ("VBUS", 0, 0),
        ("GND", 5, 0),
        ("D+", 2, 1),
        ("D-", 2, -1),
    ]:
        usb.add_pin(name, dx=dx, dy=dy)
        usb.add_pad(name, dx=dx, dy=dy, w=1, h=1)

    # Decoupling capacitors
    for i, x in enumerate([25, 28, 31]):
        c = board.add_component("CAP", ref=f"C{i+1}", at=(x, 15))
        c.add_pin("1", dx=-0.5, dy=0)
        c.add_pin("2", dx=0.5, dy=0)
        c.add_pad("1", dx=-0.5, dy=0, w=0.8, h=0.8)
        c.add_pad("2", dx=0.5, dy=0, w=0.8, h=0.8)

    # Boot and reset buttons
    boot = board.add_component("SW", ref="SW_BOOT", at=(10, 20))
    boot.add_pin("1", dx=-0.5, dy=0)
    boot.add_pin("2", dx=0.5, dy=0)
    boot.add_pad("1", dx=-0.5, dy=0, w=1, h=1)
    boot.add_pad("2", dx=0.5, dy=0, w=1, h=1)

    reset = board.add_component("SW", ref="SW_RESET", at=(10, 25))
    reset.add_pin("1", dx=-0.5, dy=0)
    reset.add_pin("2", dx=0.5, dy=0)
    reset.add_pad("1", dx=-0.5, dy=0, w=1, h=1)
    reset.add_pad("2", dx=0.5, dy=0, w=1, h=1)

    # Left GPIO header
    header_left = board.add_component("HDR", ref="J2", at=(5, 5))
    for i, name in enumerate(["IO0", "IO1", "IO2", "IO3", "GND"]):
        dy = -4 + i * 2
        header_left.add_pin(name, dx=0, dy=dy)
        header_left.add_pad(name, dx=0, dy=dy, w=1, h=1)

    # Right GPIO header
    header_right = board.add_component("HDR", ref="J3", at=(55, 5))
    for i, name in enumerate(["3V3", "GND", "TX", "RX", "IO4"]):
        dy = -4 + i * 2
        header_right.add_pin(name, dx=0, dy=dy)
        header_right.add_pad(name, dx=0, dy=dy, w=1, h=1)

    # Manual traces with bends
    board.trace_path([
        usb.pin("VBUS"),
        (30, 5),
        (30, 20),
        ldo.pin("VIN"),
    ])
    board.trace_path([
        ldo.pin("VOUT"),
        (28, 25),
        (20, 15),
        esp32.pin("3V3"),
    ])
    board.trace_path([
        ch340.pin("TXD"),
        (40, 12),
        (28, 12),
        esp32.pin("RX"),
    ])
    board.trace_path([
        ch340.pin("RXD"),
        (40, 14),
        (28, 14),
        esp32.pin("TX"),
    ])
    board.trace_path([
        boot.pin("1"),
        (12, 20),
        (18, 12),
        esp32.pin("IO0"),
    ])
    board.trace_path([
        reset.pin("1"),
        (12, 25),
        (18, 13),
        esp32.pin("EN"),
    ])

    # GND traces
    board.route_trace("SW_BOOT:2", "U1:GND")
    board.route_trace("SW_RESET:2", "U1:GND")
    board.route_trace("U3:GND", "U1:GND")
    board.route_trace("U2:GND", "U1:GND")

    board.add_text_ttf("ESP32 Dev Board", font_path=str(FONT_PATH), at=(5, 32), size=1.2, layer=Layer.TOP_SILK.value)
    board.add_text_ttf("USB-C", font_path=str(FONT_PATH), at=(28, 2), size=1.0, layer=Layer.TOP_SILK.value)

    return board


def main():
    board = build_board()
    board.save_svg_previews(str(OUTPUT_DIR))
    board.export_gerbers(OUTPUT_DIR / "esp32_dev_board.zip")


if __name__ == "__main__":
    main()
