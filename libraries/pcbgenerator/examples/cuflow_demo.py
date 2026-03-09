from pathlib import Path
from math import sqrt
from boardforge import PCB, Layer

# Adapted from jamesbowman's CuFlow demo.py
# Original source: https://github.com/jamesbowman/cuflow
# This version targets the BoardForge API.

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR.parent / "output"


def build_board():
    board = PCB(width=10, height=10)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    pitch = 0.8
    connectors = []
    for i in range(8):
        x = 3.6 + i * pitch
        c = board.add_component("TP", ref=f"P{i+1}", at=(x, 1))
        c.add_pin("SIG", dx=0, dy=0)
        c.add_pad("SIG", dx=0, dy=0, w=0.8, h=0.8)
        connectors.append(c)

    for idx, c in enumerate(connectors):
        p0 = c.pin("SIG")
        path = [
            p0,
            (p0.x, p0.y + 3),  # forward 3mm
            (
                p0.x - 3 / sqrt(2),
                p0.y + 3 + 3 / sqrt(2),
            ),  # left 45 deg, 3mm
            (
                p0.x - 3 / sqrt(2),
                p0.y + 3 + 3 / sqrt(2) + 1,
            ),  # forward 1mm
        ]
        layer = Layer.BOTTOM_COPPER.value if idx == len(connectors) - 1 else Layer.TOP_COPPER.value
        board.trace_path(path, layer=layer)

    return board


def main():
    board = build_board()
    board.save_svg_previews(str(OUTPUT_DIR))
    board.export_gerbers(OUTPUT_DIR / "cuflow_demo.zip")


if __name__ == "__main__":
    main()
