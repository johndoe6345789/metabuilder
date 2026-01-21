import sys
from pathlib import Path
import zipfile
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import PCB, Layer


def test_outline_and_fill(tmp_path):
    board = PCB(width=5, height=5)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    board.outline([(0, 0), (5, 0), (5, 5), (0, 5)])
    board.fill([(1, 1), (4, 1), (4, 4), (1, 4)], layer=Layer.TOP_COPPER.value)

    zip_path = tmp_path / "out.zip"
    board.export_gerbers(zip_path)

    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        names = set(z.namelist())
        assert "GKO.gbr" in names
        outline_lines = z.read("GKO.gbr").decode().splitlines()
        assert outline_lines[0].startswith("G04 GKO")
        assert outline_lines[1] == "X0000000Y0000000D02*"
        assert outline_lines[-1] == "X0000000Y0000000D01*"

        gtl_lines = z.read("GTL.gbr").decode().splitlines()
        assert any(l.startswith("X0001000Y0001000D02*") for l in gtl_lines)
        assert gtl_lines[-1] == "X0001000Y0001000D01*"
        png = z.read("preview_top.png")

    if png:
        with Image.open(BytesIO(png)) as img:
            px = int(2 * 10)
            assert img.getpixel((px, px)) == (190, 130, 58, 255)

