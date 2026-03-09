import sys
from pathlib import Path
import zipfile
from io import BytesIO
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import PCB, Layer

def test_hole_export_and_preview(tmp_path):
    board = PCB(width=10, height=10)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    board.hole((5, 5), diameter=2.0, annulus=0.5)

    zip_path = tmp_path / "holes.zip"
    board.export_gerbers(zip_path)

    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        names = set(z.namelist())
        assert "holes.gbr" in names
        data = z.read("holes.gbr").decode()
        assert "holes" in data.splitlines()[0].lower()
        png = z.read("preview_top.png") if "preview_top.png" in names else b""

    if png:
        with Image.open(BytesIO(png)) as img:
            px = int(5 * 10)
            assert img.getpixel((px, px)) == (0, 0, 0, 255)
