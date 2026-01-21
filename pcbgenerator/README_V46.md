# BoardForge v46

BoardForge is a code-first PCB generator and Gerber exporter. You can script your entire PCB layout in Python, including components, traces, pads, and even silkscreen artwork via SVG or TTF text.

## 🧠 Description
This is a modular, programmable system for generating PCB layouts using Python, with full support for:
- Layer stack setup
- Pads, traces, and components
- Custom SVG artwork (paths, lines, ellipses, rectangles, text)
- TrueType Font (TTF) silkscreen text rendering using FreeType
- Gerber export for OSH Park or any PCB fab
- Clean object-oriented file structure (Java-style: one class per file)

## ✅ Features
- `Board`: main container object
- `Component`: represents footprints with pads and pins
- `trace()`: define routed traces between pins
- `add_svg_graphic()`: load SVG shapes into silkscreen
- `add_text_ttf()`: render text onto PCB using a .ttf font
- Exports layered Gerber files into a ZIP bundle

## 🔧 Setup

Install the required libraries using the provided `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### Testing

The tests are executed with `pytest`. Be sure to install the dependencies first
using `pip install -r requirements.txt`. The `pytest-timeout` plugin is enabled
so each test is limited to five seconds.

```bash
pytest
```
An optional `requirements-dev.txt` pins the package versions used in CI.

## 📁 Folder Structure
```
./
├── boardforge/
│   ├── Board.py
│   ├── Component.py
│   ├── Pin.py
│   ├── svgtools.py
│   ├── GerberExporter.py
│   ├── __init__.py
│
├── fonts/
│   └── RobotoMono.ttf
├── graphics/
│   └── torch.svg
├── demo.py
├── README.md
```

## 🧪 Example Usage

```python
from boardforge import Board, TOP_SILK, BOTTOM_SILK
import os

board = Board(width=60, height=50)
board.set_layer_stack([TOP_SILK, BOTTOM_SILK])

bt = board.add_component("CR2032", ref="BT1", at=(30, 5))
bt.add_pin("VCC", dx=0, dy=0)
bt.add_pin("GND", dx=10, dy=0)
bt.add_pad("VCC", dx=0, dy=0, w=1.2, h=1.2)
bt.add_pad("GND", dx=10, dy=0, w=1.2, h=1.2)

led = board.add_component("LED", ref="D1", at=(30, 40))
led.add_pin("A", dx=0, dy=0)
led.add_pin("K", dx=2, dy=0)
led.add_pad("A", dx=0, dy=0, w=1.2, h=1.2)
led.add_pad("K", dx=2, dy=0, w=1.2, h=1.2)

board.trace(bt.pin("VCC"), led.pin("A"))
board.trace(led.pin("K"), bt.pin("GND"), layer=BOTTOM_SILK)

svg_path = os.path.join("graphics", "torch.svg")
board.add_svg_graphic(svg_path, layer=BOTTOM_SILK, scale=1.0, at=(10, 10))

board.add_text_ttf("Torch-O-Matic 3000", font_path="fonts/RobotoMono.ttf", at=(5, 50), size=1.5, layer=TOP_SILK)

board.export_gerbers("output/boardforge_output.zip")
# Creates 'boardforge_output.zip' and an exploded
# folder 'boardforge_output' with the same files
```

## 🪫 Common Circuits

The package also provides helpers to create a few everyday circuits:

```python
from boardforge import (
    create_voltage_divider,
    create_led_indicator,
    create_rc_lowpass,
)

divider = create_voltage_divider()
indicator = create_led_indicator()

lowpass = create_rc_lowpass()
```

## 📚 Additional Example

An Arduino-like microcontroller board is provided under `examples/arduino_like.py`.
Run the script to generate `output/arduino_like.zip` and preview images. See
`examples/README.md` for the pinout and component overview.

## 🧰 API Reference

### `Board`
- `Board(name="Board", width=100, height=80)`
- `add_component(type, ref, at, rotation=0)`
- `trace(pin1, pin2, layer="GTL")`
- `set_layer_stack(["GTL", "GBL", "GTO", "GBO"])`
- `add_svg_graphic(svg_path, layer, scale=1.0, at=(0,0))`
- `add_text_ttf(text, font_path, at=(x, y), size=1.0, layer="GTO")`
- `export_gerbers("output/zipfile.zip")`
- `save_png_previews(outdir=".", scale=10)`

### `Component`
- `add_pin(name, dx, dy)`
- `add_pad(name, dx, dy, w, h)`
- `pin(name)` → returns `Pin` object

---

## 🏁 Start creating PCBs in Python today!
