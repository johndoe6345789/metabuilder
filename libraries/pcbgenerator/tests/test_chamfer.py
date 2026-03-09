import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import PCB, Layer


def test_chamfer_outline(tmp_path):
    board = PCB(width=10, height=8)
    board.set_layer_stack([Layer.TOP_COPPER.value, Layer.BOTTOM_COPPER.value])
    board.chamfer_outline(10, 8, 2)

    zip_path = tmp_path / "out.zip"
    board.export_gerbers(zip_path)
    assert zip_path.exists()

    with zipfile.ZipFile(zip_path) as z:
        lines = z.read("GKO.gbr").decode().splitlines()

    coords = lines[1:]
    assert len(coords) == 9  # 8 vertices + closing point

    pts = []
    for l in coords[:-1]:
        m = re.match(r"X(\d+)Y(\d+)D0[12]\*", l)
        assert m
        pts.append((int(m.group(1)) / 1000, int(m.group(2)) / 1000))

    expected = [
        (2, 0), (8, 0), (10, 2),
        (10, 6), (8, 8), (2, 8),
        (0, 6), (0, 2),
    ]
    assert pts == expected
