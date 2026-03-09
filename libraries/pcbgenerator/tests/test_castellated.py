import sys
from pathlib import Path
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import PCB, Layer


def test_castellated_pad_preview(tmp_path):
    board = PCB(width=6, height=4)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])
    comp = board.add_component("EDGE", ref="J1", at=(0, 0))
    for i in range(3):
        comp.add_castellated_pad(f"P{i}", board, edge="bottom", offset=1 + 2 * i, diameter=1.0)

    board.save_svg_previews(tmp_path)
    svg_path = tmp_path / "preview_top.svg"
    png_path = tmp_path / "preview_top.png"

    svg_data = svg_path.read_text()
    assert svg_data.count("fill=\"#ffc100\"") >= 3

    import re
    m = re.search(r'<polygon points="([^"]+)" fill="\#5d2292"', svg_data)
    assert m
    pts = m.group(1).split()
    assert len(pts) > 20

    with Image.open(png_path) as img:
        px = int(1 * 10)
        assert img.getpixel((px, 0))[:3] == (51, 51, 51)
        assert img.getpixel((px, 1)) == (255, 193, 0, 255)
