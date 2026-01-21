import xml.etree.ElementTree as ET
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import Graphic, Pad
from boardforge import svgtools


def test_graphic_render_returns_commands():
    g = Graphic(layer="GTO", commands=["CMD1", "CMD2"])
    assert g.layer == "GTO"
    assert g.render() == ["CMD1", "CMD2"]


def test_pad_initialization_defaults():
    p = Pad("P1", 1, 2, 3, 4)
    assert p.name == "P1"
    assert p.x == 1
    assert p.y == 2
    assert p.w == 3
    assert p.h == 4
    assert p.layer == "GTL"


def test_pad_custom_layer():
    p = Pad("P2", 0, 0, 1, 1, layer="GBL")
    assert p.layer == "GBL"


def element(tag, **attrs):
    return ET.Element(tag, {k: str(v) for k, v in attrs.items()})


def test_svgtools_basic_renderers():
    rect = element("rect", x=1, y=2, width=3, height=4)
    circle = element("circle", r=1, cx=0, cy=0)
    polyline = element("polyline", points="0,0 1,0 1,1")
    polygon = element("polygon", points="0,0 1,0 1,1")
    line = element("line", x1=0, y1=0, x2=1, y2=1)

    rect_cmds = svgtools.render_rect(rect, 1, 0, 0)
    circle_cmds = svgtools.render_circle(circle, 1, 0, 0)
    poly_cmds = svgtools.render_polyline(polyline, 1, 0, 0)
    poly_closed = svgtools.render_polygon(polygon, 1, 0, 0)
    line_cmds = svgtools.render_line(line, 1, 0, 0)

    assert rect_cmds[0].endswith("D02*")
    assert rect_cmds[-1].endswith("D01*")
    assert len(circle_cmds) == 13
    assert poly_cmds[0].endswith("D02*") and poly_cmds[-1].endswith("D01*")
    assert poly_closed[-1] == poly_closed[0].replace("D02*", "D01*")
    assert line_cmds == [
        "X0000000Y0000000D02*",
        "X0001000Y0001000D01*",
    ]


def test_render_svg_element_dispatch():
    rect = element("rect", x=0, y=0, width=1, height=1)
    cmds = svgtools.render_svg_element(rect, 1, 0, 0)
    assert cmds == svgtools.render_rect(rect, 1, 0, 0)

    # Unknown tag should return empty list
    unknown = element("unknown")
    assert svgtools.render_svg_element(unknown, 1, 0, 0) == []


def test_render_text_ttf_handles_missing_font(tmp_path):
    font_path = tmp_path / "missing.ttf"
    cmds = svgtools.render_text_ttf("A", str(font_path))
    assert cmds == []
