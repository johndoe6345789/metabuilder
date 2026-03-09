import sys
from pathlib import Path
import zipfile
import pytest

EXPECTED_DIR = Path(__file__).resolve().parent / "expected"

# Add the repository root to sys.path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import Pin, Component, PCB, Layer


def test_pin_rotation():
    pin = Pin("A", (10, 20), 1, 0, rotation=90)
    assert pytest.approx(pin.x, rel=1e-6) == 10
    assert pytest.approx(pin.y, rel=1e-6) == 21


def test_pad_rotation():
    comp = Component("R1", "RES", at=(0, 0), rotation=90)
    pad = comp.add_pad("P1", 1, 0, w=1, h=1)
    assert pytest.approx(pad.x, rel=1e-6) == 0
    assert pytest.approx(pad.y, rel=1e-6) == 1


def test_export_creates_zip_and_files(tmp_path):
    board = PCB(width=10, height=10)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])
    comp = board.add_component("TEST", ref="C1", at=(2, 2))
    comp.add_pin("A", dx=0, dy=0)
    comp.add_pin("B", dx=1, dy=0)
    board.route_trace("C1:A", "C1:B", layer=Layer.TOP_COPPER.value)
    via = board.add_via(5, 5, from_layer=Layer.TOP_COPPER.value, to_layer=Layer.BOTTOM_COPPER.value)
    zone = board.add_filled_zone(net="GND", layer=Layer.BOTTOM_COPPER.value)
    assert via in board.vias
    assert zone in board.zones

    zip_path = tmp_path / "out.zip"
    board.export_gerbers(zip_path)

    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        names = set(z.namelist())
        gtl_data = z.read("GTL.gbr").decode()
        gbl_data = z.read("GBL.gbr").decode()
        gto_data = z.read("GTO.gbr").decode()
        gbo_data = z.read("GBO.gbr").decode()
        top_png = z.read("preview_top.png") if "preview_top.png" in names else b""

    expected_gtl = (EXPECTED_DIR / "simple1_GTL.gbr").read_text()
    expected_gbl = (EXPECTED_DIR / "simple1_GBL.gbr").read_text()
    expected_gto = (EXPECTED_DIR / "simple1_GTO.gbr").read_text()
    expected_gbo = (EXPECTED_DIR / "simple1_GBO.gbr").read_text()

    # Validate that the PNG preview is a valid image with expected dimensions
    from io import BytesIO
    from PIL import Image
    if top_png:
        with Image.open(BytesIO(top_png)) as img:
            assert img.size == (board.width * 10, board.height * 10)
            # Verify board colour and trace colour at known points
            assert img.getpixel((30, 30)) == (93, 34, 146, 255)
            assert img.getpixel((25, 20)) == (255, 193, 0, 255)

    assert "GTL.gbr" in names
    assert "GTO.gbr" in names
    assert "preview_top.svg" in names
    assert "preview_top.png" in names
    assert len(top_png) > 0

    assert gtl_data == expected_gtl
    assert gbl_data == expected_gbl
    assert gto_data == expected_gto
    assert gbo_data == expected_gbo

    exploded_dir = tmp_path / "out"
    assert exploded_dir.exists()
    assert (exploded_dir / "GTL.gbr").read_text() == expected_gtl
    assert (exploded_dir / "preview_top.svg").exists()


def test_sample_circuit_gerber_contains_trace(tmp_path):
    board = PCB(width=5, height=5)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    r1 = board.add_component("RES", ref="R1", at=(1, 1))
    r1.add_pin("A", dx=-0.5, dy=0)
    r1.add_pin("B", dx=0.5, dy=0)
    r1.add_pad("A", dx=-0.5, dy=0, w=1, h=1)
    r1.add_pad("B", dx=0.5, dy=0, w=1, h=1)

    r2 = board.add_component("RES", ref="R2", at=(3.3, 1))
    r2.add_pin("A", dx=-0.5, dy=0)
    r2.add_pin("B", dx=0.5, dy=0)
    r2.add_pad("A", dx=-0.5, dy=0, w=1, h=1)
    r2.add_pad("B", dx=0.5, dy=0, w=1, h=1)

    board.route_trace("R1:B", "R2:A")

    zip_path = tmp_path / "circuit.zip"
    board.export_gerbers(zip_path)

    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        gtl_data = z.read("GTL.gbr").decode()
        gbl_data = z.read("GBL.gbr").decode()
        gto_data = z.read("GTO.gbr").decode()
        gbo_data = z.read("GBO.gbr").decode()

    expected_gtl = (EXPECTED_DIR / "simple2_GTL.gbr").read_text()
    expected_gbl = (EXPECTED_DIR / "simple2_GBL.gbr").read_text()
    expected_gto = (EXPECTED_DIR / "simple2_GTO.gbr").read_text()
    expected_gbo = (EXPECTED_DIR / "simple2_GBO.gbr").read_text()
    assert gtl_data == expected_gtl
    assert gbl_data == expected_gbl
    assert gto_data == expected_gto
    assert gbo_data == expected_gbo
