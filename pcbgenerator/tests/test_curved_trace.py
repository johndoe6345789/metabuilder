import sys
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import PCB, Layer


def test_arc_trace_preview(tmp_path):
    board = PCB(width=5, height=5)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    j1 = board.add_component("IN", ref="J1", at=(0.5, 2.5))
    j1.add_pin("SIG", dx=0, dy=0)
    j1.add_pad("SIG", dx=0, dy=0, w=1, h=1)

    j2 = board.add_component("OUT", ref="J2", at=(4.5, 2.5))
    j2.add_pin("SIG", dx=0, dy=0)
    j2.add_pad("SIG", dx=0, dy=0, w=1, h=1)

    board.trace_path([j1.pin("SIG"), {"arc": (2.0, 180)}, j2.pin("SIG")])

    board.save_svg_previews(tmp_path)
    svg_path = tmp_path / "preview_top.svg"
    assert svg_path.exists()
    svg_data = svg_path.read_text()
    assert "A20,20" in svg_data

    zip_path = tmp_path / "curved.zip"
    board.export_gerbers(zip_path)
    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        assert "preview_top.svg" in z.namelist()
