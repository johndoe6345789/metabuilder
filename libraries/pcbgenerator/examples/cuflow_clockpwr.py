from pathlib import Path
from boardforge import PCB, Layer

# Adapted from jamesbowman's CuFlow clockpwr.py
# Original source: https://github.com/jamesbowman/cuflow
# Demonstrates simple header connections and screw terminals using the BoardForge API.

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR.parent / "output"


def build_board():
    board = PCB(width=80, height=24)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    # Two 6-pin headers
    j1 = board.add_component("HDR6", ref="J1", at=(10, 12))
    j2 = board.add_component("HDR6", ref="J2", at=(70, 12))
    for i in range(6):
        dy = -5 + i * 2
        for j in (j1, j2):
            j.add_pin(str(i + 1), dx=0, dy=dy)
            j.add_pad(str(i + 1), dx=0, dy=dy, w=1.2, h=1.2)

    # Three screw terminals top and bottom
    screws_top = []
    for dx in (-5, 0, 5):
        sc = board.add_component("SCREW", ref=f"J3_{dx}", at=(40 + dx, 20))
        sc.add_pin("P", dx=0, dy=0)
        sc.add_pad("P", dx=0, dy=0, w=2, h=2)
        screws_top.append(sc)
    screws_bot = []
    for dx in (-5, 0, 5):
        sc = board.add_component("SCREW", ref=f"J4_{dx}", at=(40 + dx, 4))
        sc.add_pin("P", dx=0, dy=0)
        sc.add_pad("P", dx=0, dy=0, w=2, h=2)
        screws_bot.append(sc)

    # Route header pins 2-5 directly across
    for i in range(1, 5):
        board.route_trace(f"J1:{i+1}", f"J2:{i+1}")

    # Connect VCC and GND to screw terminals
    for screw in screws_top:
        board.route_trace("J1:1", f"{screw.ref}:P")
        board.route_trace("J2:1", f"{screw.ref}:P")
    for screw in screws_bot:
        board.route_trace("J1:6", f"{screw.ref}:P")
        board.route_trace("J2:6", f"{screw.ref}:P")

    return board


def main():
    board = build_board()
    board.save_svg_previews(str(OUTPUT_DIR))
    board.export_gerbers(OUTPUT_DIR / "cuflow_clockpwr.zip")


if __name__ == "__main__":
    main()
