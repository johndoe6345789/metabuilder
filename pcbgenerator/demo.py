from pathlib import Path
from boardforge import Board, TOP_SILK, BOTTOM_SILK
import os

BASE_DIR = Path(__file__).resolve().parent

board = Board(width=80, height=60)
board.set_layer_stack(["GTL", "GBL", TOP_SILK, BOTTOM_SILK])

# CR2032
bat = board.add_component("CR2032", ref="BT1", at=(40, 10))
bat.add_pin("VCC", dx=0, dy=0)
bat.add_pin("GND", dx=10, dy=0)
bat.add_pad("VCC", dx=0, dy=0, w=2, h=2)
bat.add_pad("GND", dx=10, dy=0, w=2, h=2)

# Switch
sw = board.add_component("SWITCH", ref="SW1", at=(40, 20))
sw.add_pin("A", dx=-2, dy=0)
sw.add_pin("B", dx=2, dy=0)
sw.add_pad("A", dx=-2, dy=0, w=1.8, h=1.8)
sw.add_pad("B", dx=2, dy=0, w=1.8, h=1.8)

# 3 resistors (R1, R2, R3)
resistor_positions = [(20, 35), (40, 35), (60, 35)]
resistors = []
for i, pos in enumerate(resistor_positions):
    r = board.add_component("RESISTOR", ref=f"R{i+1}", at=pos)
    r.add_pin("A", dx=-3, dy=0)
    r.add_pin("B", dx=3, dy=0)
    r.add_pad("A", dx=-3, dy=0, w=1.6, h=1.6)
    r.add_pad("B", dx=3, dy=0, w=1.6, h=1.6)
    resistors.append(r)

# 3 LEDs (centered, left 45°, right -45°)
led_positions = [
    (20, 50, 45),    # Left LED, angled +45°
    (40, 50, 0),     # Center LED, upright
    (60, 50, -45),   # Right LED, angled -45°
]
leds = []
for i, (x, y, ang) in enumerate(led_positions):
    d = board.add_component("LED", ref=f"D{i+1}", at=(x, y), rotation=ang)
    d.add_pin("A", dx=0, dy=-2)
    d.add_pin("K", dx=0, dy=2)
    d.add_pad("A", dx=0, dy=-2, w=1.6, h=1.6)
    d.add_pad("K", dx=0, dy=2, w=1.6, h=1.6)
    leds.append(d)

# Wire it up with traces
board.trace(bat.pin("VCC"), sw.pin("A"))
for r in resistors:
    board.trace(sw.pin("B"), r.pin("A"))
for r, d in zip(resistors, leds):
    board.trace(r.pin("B"), d.pin("A"))
for d in leds:
    board.trace(d.pin("K"), bat.pin("GND"))

# Silkscreen text labels
font_path = BASE_DIR / "fonts" / "RobotoMono.ttf"
for c in [bat, sw] + resistors + leds:
    board.add_text_ttf(c.ref, font_path=str(font_path), at=(c.at[0]-4, c.at[1]-5), size=1.2, layer=TOP_SILK)

svg_path = BASE_DIR / "graphics" / "torch.svg"
if svg_path.exists():
    board.add_svg_graphic(str(svg_path), layer=TOP_SILK, scale=1.2, at=(5, 5))

output_dir = BASE_DIR / "output"
board.save_svg_previews(str(output_dir))
board.export_gerbers(str(output_dir / "boardforge_output.zip"))
