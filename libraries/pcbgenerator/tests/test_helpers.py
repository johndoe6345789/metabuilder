import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import Board, Layer


def test_annotate_adds_commands():
    b = Board(width=5, height=5)
    b.set_layer_stack([Layer.TOP_SILK.value])
    b.annotate(1, 1, "A", size=1.0, layer=Layer.TOP_SILK)
    assert len(b.layers[Layer.TOP_SILK.value]) > 0


def test_logo_adds_commands():
    b = Board(width=5, height=5)
    b.set_layer_stack([Layer.TOP_SILK.value])
    img = Image.new("RGB", (2, 2), "white")
    img.putpixel((0, 0), (0, 0, 0))
    b.logo(0, 0, img, scale=0.5, layer=Layer.TOP_SILK)
    assert len(b.layers[Layer.TOP_SILK.value]) > 0
