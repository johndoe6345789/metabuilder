import sys
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import Component
from boardforge.footprints import get_footprint
from boardforge.__init__ import Footprint


@pytest.mark.parametrize("name,expected", [
    (Footprint.C0603.value, (2, [(-0.5, 0), (0.5, 0)])),
    (Footprint.TACTILE_SWITCH.value, (2, [(-1.5, 0), (1.5, 0)])),
    (Footprint.HEADER_1x5.value, (5, [(0, 0), (0, 10.16)])),
    (Footprint.SOP16.value, (16, [(-2.0, -4.445), (2.0, -4.445)])),
    (Footprint.SOT223.value, (4, [(-2.3, -2), (0, 2)])),
    (Footprint.USB_C_CUTOUT.value, (4, [(-3.5, 0), (3.5, 0)])),
    (Footprint.ESP32_WROOM.value, (38, [(-9.0, -18.0), (9.0, 18.0)])),
    ("HDMI", (23, [(-4.5, 0), (4.5, 2.4)])),
    (Footprint.BT815.value, (48, [(-3.5, -2.75), (-2.75, -3.5)])),
    (Footprint.W25Q64J.value, (8, [(-2.7, -1.905), (2.7, -1.905)])),
    (Footprint.OSCILLATOR.value, (4, [(-1.0, 0.8), (1.0, -0.8)])),
    (Footprint.SOT23_5.value, (5, [(-0.95, -0.8), (0.475, 0.8)])),
])
def test_footprint_pads(name, expected):
    count, locs = expected
    comp = Component("U1", "TEST", at=(0, 0))
    loader = get_footprint(name)
    loader(comp)
    assert len(comp.pads) == count
    # check first and last pad locations
    assert pytest.approx(comp.pads[0].x, rel=1e-6) == locs[0][0]
    assert pytest.approx(comp.pads[0].y, rel=1e-6) == locs[0][1]
    assert pytest.approx(comp.pads[-1].x, rel=1e-6) == locs[1][0]
    assert pytest.approx(comp.pads[-1].y, rel=1e-6) == locs[1][1]
