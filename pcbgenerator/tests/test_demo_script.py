import sys
from pathlib import Path
import zipfile
import pytest

EXPECTED_DIR = Path(__file__).resolve().parent / "expected"

# Add repository root to path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import PCB, Layer


def test_demo_script_equivalent(tmp_path):
    base = ROOT
    font_path = base / "fonts" / "RobotoMono.ttf"
    svg_path = base / "graphics" / "torch.svg"

    board = PCB(width=80, height=60)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    bat = board.add_component("CR2032", ref="BT1", at=(40, 10))
    bat.add_pin("VCC", dx=0, dy=0)
    bat.add_pin("GND", dx=10, dy=0)
    bat.add_pad("VCC", dx=0, dy=0, w=2, h=2)
    bat.add_pad("GND", dx=10, dy=0, w=2, h=2)

    sw = board.add_component("SWITCH", ref="SW1", at=(40, 20))
    sw.add_pin("A", dx=-2, dy=0)
    sw.add_pin("B", dx=2, dy=0)
    sw.add_pad("A", dx=-2, dy=0, w=1.8, h=1.8)
    sw.add_pad("B", dx=2, dy=0, w=1.8, h=1.8)

    resistor_positions = [(20, 35), (40, 35), (60, 35)]
    resistors = []
    for i, pos in enumerate(resistor_positions):
        r = board.add_component("RESISTOR", ref=f"R{i+1}", at=pos)
        r.add_pin("A", dx=-3, dy=0)
        r.add_pin("B", dx=3, dy=0)
        r.add_pad("A", dx=-3, dy=0, w=1.6, h=1.6)
        r.add_pad("B", dx=3, dy=0, w=1.6, h=1.6)
        resistors.append(r)

    led_positions = [
        (20, 50, 45),
        (40, 50, 0),
        (60, 50, -45),
    ]
    leds = []
    for i, (x, y, ang) in enumerate(led_positions):
        d = board.add_component("LED", ref=f"D{i+1}", at=(x, y), rotation=ang)
        d.add_pin("A", dx=0, dy=-2)
        d.add_pin("K", dx=0, dy=2)
        d.add_pad("A", dx=0, dy=-2, w=1.6, h=1.6)
        d.add_pad("K", dx=0, dy=2, w=1.6, h=1.6)
        leds.append(d)

    board.route_trace("BT1:VCC", "SW1:A")
    for r in resistors:
        board.route_trace("SW1:B", f"{r.ref}:A")
    for r, d in zip(resistors, leds):
        board.route_trace(f"{r.ref}:B", f"{d.ref}:A")
    for d in leds:
        board.route_trace(f"{d.ref}:K", "BT1:GND")

    for c in [bat, sw] + resistors + leds:
        board.add_text_ttf(
            c.ref,
            font_path=str(font_path),
            at=(c.at[0]-4, c.at[1]-5),
            size=1.2,
            layer=Layer.TOP_SILK.value,
        )

    if svg_path.exists():
        board.add_svg_graphic(str(svg_path), layer=Layer.TOP_SILK.value, scale=1.2, at=(5, 5))

    board.save_svg_previews(tmp_path)
    zip_path = tmp_path / "demo_output.zip"
    board.export_gerbers(zip_path)

    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        names = set(z.namelist())
        assert {"GTL.gbr", "GBL.gbr", "GTO.gbr", "GBO.gbr"}.issubset(names)
        assert {"preview_top.svg", "preview_bottom.svg", "preview_top.png", "preview_bottom.png"}.issubset(names)
        gtl_data = z.read("GTL.gbr").decode()
        gbl_data = z.read("GBL.gbr").decode()
        gto_data = z.read("GTO.gbr").decode()
        gbo_data = z.read("GBO.gbr").decode()
        top_png = z.read("preview_top.png") if "preview_top.png" in names else b""

    expected_gtl = (EXPECTED_DIR / "demo_GTL.gbr").read_text()
    expected_gbl = (EXPECTED_DIR / "demo_GBL.gbr").read_text()
    expected_gto = (EXPECTED_DIR / "demo_GTO.gbr").read_text()
    expected_gbo = (EXPECTED_DIR / "demo_GBO.gbr").read_text()

    if top_png:
        from io import BytesIO
        from PIL import Image
        with Image.open(BytesIO(top_png)) as img:
            assert img.size == (board.width * 10, board.height * 10)
            assert img.getpixel((30, 30)) == (93, 34, 146, 255)

            # verify pad colours and rings
            for comp in [bat, sw] + resistors + leds:
                for pad in comp.pads:
                    px = int(pad.x * 10)
                    py = int(pad.y * 10)
                    assert img.getpixel((px, py)) == (255, 193, 0, 255)

                    if abs(pad.w - pad.h) <= 0.1:
                        ring_r = int((int(pad.w * 10) + 6) // 2)
                        ring_px = px + ring_r - 2
                        if ring_px < img.width:
                            assert img.getpixel((ring_px, py)) == (255, 236, 128, 255)

            # verify silkscreen text renders in white
            for comp in [bat, sw] + resistors + leds:
                tx = int((comp.at[0] - 4) * 10)
                ty = int((comp.at[1] - 5) * 10)
                found_white = False
                for dx in range(-10, 11):
                    for dy in range(-10, 11):
                        x = tx + dx
                        y = ty + dy
                        if 0 <= x < img.width and 0 <= y < img.height:
                            if img.getpixel((x, y)) == (255, 255, 255, 255):
                                found_white = True
                                break
                    if found_white:
                        break
                assert found_white

    assert gtl_data == expected_gtl
    assert gbl_data == expected_gbl
    assert gto_data == expected_gto
    assert gbo_data == expected_gbo
