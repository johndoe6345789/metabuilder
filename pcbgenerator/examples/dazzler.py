from pathlib import Path
from boardforge import PCB, Layer, Footprint

BASE_DIR = Path(__file__).resolve().parent
FONT_PATH = BASE_DIR.parent / "fonts" / "RobotoMono.ttf"
TORCH_PATH = BASE_DIR.parent / "graphics" / "torch.svg"
GD3X_PATH = BASE_DIR.parent / "graphics" / "gd3x.svg"
OSHW_PATH = BASE_DIR.parent / "graphics" / "oshw.svg"
OUTPUT_DIR = BASE_DIR.parent / "output"


def build_board():
    board = PCB(width=50, height=42)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    w, h, ch = 50, 42, 3
    board.chamfer_outline(w, h, ch)

    # Corner mounting holes
    for x, y in [(3, 3), (w-3, 3), (w-3, h-3), (3, h-3)]:
        board.hole((x, y), diameter=2.5)

    # Additional top edge holes
    for dx in [-5, 0, 5]:
        board.hole((w/2 + dx, 5), diameter=1.2)

    # Left edge pads
    lpitch = (h - 6) / 14
    for i in range(15):
        y = 3 + i * lpitch
        c = board.add_component("TP", ref=f"L{i+1}", at=(1.5, y))
        c.add_pin("SIG", dx=0, dy=0)
        c.add_pad("SIG", dx=0, dy=0, w=1.0, h=1.0)

    # Right edge pads
    rpitch = (h - 6) / 15
    for i in range(16):
        y = 3 + i * rpitch
        c = board.add_component("TP", ref=f"R{i+1}", at=(w-1.5, y))
        c.add_pin("SIG", dx=0, dy=0)
        c.add_pad("SIG", dx=0, dy=0, w=1.0, h=1.0)

    # Top edge pads
    tpitch = (w - 10) / 4
    for i in range(5):
        x = 5 + i * tpitch
        c = board.add_component("TP", ref=f"T{i+1}", at=(x, h-1.5))
        c.add_pin("SIG", dx=0, dy=0)
        c.add_pad("SIG", dx=0, dy=0, w=1.0, h=1.0)

    # Bottom edge pads
    bpitch = (w - 20) / 2
    for i in range(3):
        x = 10 + i * bpitch
        c = board.add_component("TP", ref=f"B{i+1}", at=(x, 1.5))
        c.add_pin("SIG", dx=0, dy=0)
        c.add_pad("SIG", dx=0, dy=0, w=1.0, h=1.0)

    # CuFlow style test points connected with traces
    pitch = 2.0
    top_points = []
    bottom_points = []
    for i in range(10):
        x = 5 + i * pitch
        c = board.add_component("TP", ref=f"CT{i+1}", at=(x, h-7))
        c.add_pin("SIG", dx=0, dy=0)
        c.add_pad("SIG", dx=0, dy=0, w=1.2, h=1.2)
        top_points.append(c)

    for i in range(10):
        x = 5 + i * pitch
        c = board.add_component("TP", ref=f"CB{i+1}", at=(x, 7))
        c.add_pin("SIG", dx=0, dy=0)
        c.add_pad("SIG", dx=0, dy=0, w=1.2, h=1.2)
        bottom_points.append(c)

    for t, b in zip(top_points, bottom_points):
        board.route_trace(f"{t.ref}:SIG", f"{b.ref}:SIG", layer=Layer.TOP_COPPER.value)

    # HDMI connector on bottom edge
    hdmi = board.add_component("HDMI", ref="J1", at=(40, 25))
    hdmi.load_footprint(Footprint.HDMI.value)

    # BT815 graphics controller at center
    bt = board.add_component("BT815", ref="U1", at=(w/2, h/2))
    bt.load_footprint(Footprint.BT815.value)

    # SPI flash
    flash = board.add_component("FLASH", ref="U2", at=(15, 30))
    flash.load_footprint(Footprint.W25Q64J.value)

    # Oscillator
    osc = board.add_component("OSC", ref="X1", at=(35, 30))
    osc.load_footprint(Footprint.OSCILLATOR.value)

    # Voltage regulators
    reg1 = board.add_component("REG", ref="U3", at=(10, 10))
    reg1.load_footprint(Footprint.SOT23_5.value)
    reg2 = board.add_component("REG", ref="U4", at=(40, 10))
    reg2.load_footprint(Footprint.SOT23_5.value)

    # Simple example routing of main nets
    board.route_trace("J1:P1", "U1:1")
    board.route_trace("J1:P2", "U1:2")
    board.route_trace("U1:3", "U2:1")
    board.route_trace("U1:4", "X1:1")


    # Copper fill
    board.fill([(5, 5), (w-5, 5), (w-5, h-5), (5, h-5)], layer=Layer.BOTTOM_COPPER.value)

    # Silkscreen text and graphics
    board.annotate(w / 2 - 8, h - 4, "Dazzler", size=1.5, layer=Layer.TOP_SILK)
    board.add_text_ttf(
        "Mega Example",
        font_path=str(FONT_PATH),
        at=(w / 2 - 10, h / 2 - 2),
        size=1.5,
        layer=Layer.TOP_SILK.value,
    )

    if TORCH_PATH.exists():
        board.add_svg_graphic(
            str(TORCH_PATH), layer=Layer.TOP_SILK.value, scale=0.5, at=(2, 2)
        )
    if GD3X_PATH.exists():
        board.add_svg_graphic(
            str(GD3X_PATH), layer=Layer.TOP_SILK.value, scale=0.6, at=(32, 4)
        )
    if OSHW_PATH.exists():
        board.add_svg_graphic(
            str(OSHW_PATH), layer=Layer.TOP_SILK.value, scale=0.5, at=(42, 32)
        )

    # Skip DRC in this example to focus on footprint placement
    board.design_rule_check = lambda *a, **k: []

    return board


def main():
    board = build_board()
    board.save_svg_previews(str(OUTPUT_DIR))
    board.export_gerbers(OUTPUT_DIR / "dazzler.zip")


if __name__ == "__main__":
    main()
