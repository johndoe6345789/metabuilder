from pathlib import Path
from boardforge import PCB, Layer

BASE_DIR = Path(__file__).resolve().parent
FONT_PATH = BASE_DIR.parent / "fonts" / "RobotoMono.ttf"
OUTPUT_DIR = BASE_DIR.parent / "output"


def build_board():
    board = PCB(width=50, height=40)
    board.set_layer_stack([
        Layer.TOP_COPPER.value,
        Layer.BOTTOM_COPPER.value,
        Layer.TOP_SILK.value,
        Layer.BOTTOM_SILK.value,
    ])

    vin = board.add_component("VIN", ref="J1", at=(5, 20))
    vin.add_pin("VIN", dx=0, dy=0)
    vin.add_pin("GND", dx=0, dy=-2)
    vin.add_pad("VIN", dx=0, dy=0, w=1.2, h=1.2)
    vin.add_pad("GND", dx=0, dy=-2, w=1.2, h=1.2)

    reg = board.add_component("REG", ref="U1", at=(25, 20))
    reg.add_pin("VIN", dx=-2, dy=0)
    reg.add_pin("GND", dx=0, dy=-2)
    reg.add_pin("VOUT", dx=2, dy=0)
    reg.add_pad("VIN", dx=-2, dy=0, w=1, h=1)
    reg.add_pad("GND", dx=0, dy=-2, w=1, h=1)
    reg.add_pad("VOUT", dx=2, dy=0, w=1, h=1)

    vout = board.add_component("VOUT", ref="J2", at=(45, 20))
    vout.add_pin("VOUT", dx=0, dy=0)
    vout.add_pin("GND", dx=0, dy=-2)
    vout.add_pad("VOUT", dx=0, dy=0, w=1.2, h=1.2)
    vout.add_pad("GND", dx=0, dy=-2, w=1.2, h=1.2)

    btn1 = board.add_component("SW", ref="SW1", at=(15, 30))
    btn1.add_pin("1", dx=-0.5, dy=0)
    btn1.add_pin("2", dx=0.5, dy=0)
    btn1.add_pad("1", dx=-0.5, dy=0, w=1, h=1)
    btn1.add_pad("2", dx=0.5, dy=0, w=1, h=1)

    btn2 = board.add_component("SW", ref="SW2", at=(35, 30))
    btn2.add_pin("1", dx=-0.5, dy=0)
    btn2.add_pin("2", dx=0.5, dy=0)
    btn2.add_pad("1", dx=-0.5, dy=0, w=1, h=1)
    btn2.add_pad("2", dx=0.5, dy=0, w=1, h=1)

    display = board.add_component("OLED", ref="DS1", at=(25, 10))
    for name, dx in [("VCC", -3), ("GND", -1), ("SCL", 1), ("SDA", 3)]:
        display.add_pin(name, dx=dx, dy=0)
        display.add_pad(name, dx=dx, dy=0, w=1, h=1)

    board.route_trace("J1:VIN", "U1:VIN")
    board.route_trace("U1:VOUT", "J2:VOUT")
    board.route_trace("J1:GND", "U1:GND")
    board.route_trace("U1:GND", "J2:GND")
    board.route_trace("U1:VOUT", "SW1:1")
    board.route_trace("SW1:2", "U1:GND")
    board.route_trace("U1:VOUT", "SW2:1")
    board.route_trace("SW2:2", "U1:GND")
    board.route_trace("U1:VOUT", "DS1:VCC")
    board.route_trace("U1:GND", "DS1:GND")

    for comp in [vin, vout, reg, btn1, btn2, display]:
        board.add_text_ttf(
            comp.ref,
            font_path=str(FONT_PATH),
            at=(comp.at[0]-4, comp.at[1]-5),
            size=1.0,
            layer=Layer.TOP_SILK.value,
        )

    return board


def main():
    board = build_board()
    board.save_svg_previews(str(OUTPUT_DIR))
    board.export_gerbers(str(OUTPUT_DIR / "buck_boost_converter.zip"))


if __name__ == "__main__":
    main()
