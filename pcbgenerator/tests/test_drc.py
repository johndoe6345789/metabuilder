import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import pytest
from boardforge import Board, DRCError


def test_drc_pad_clearance_warning():
    board = Board(width=5, height=5)
    board.set_layer_stack(["GTL", "GBL"])
    c1 = board.add_component("A", ref="U1", at=(0, 0))
    c1.add_pin("P", dx=0, dy=0)
    c1.add_pad("P", dx=0, dy=0, w=1, h=1)

    c2 = board.add_component("B", ref="U2", at=(0.6, 0))
    c2.add_pin("P", dx=0, dy=0)
    c2.add_pad("P", dx=0, dy=0, w=1, h=1)

    with pytest.raises(DRCError) as excinfo:
        board.design_rule_check(min_clearance=0.7)
    assert any("Pad clearance" in w for w in excinfo.value.warnings)


def test_drc_trace_width_warning():
    board = Board(width=5, height=5)
    board.set_layer_stack(["GTL", "GBL"])
    c1 = board.add_component("A", ref="U1", at=(0, 0))
    c1.add_pin("P", dx=0, dy=0)
    c1.add_pad("P", dx=0, dy=0, w=1, h=1)

    c2 = board.add_component("B", ref="U2", at=(4, 0))
    c2.add_pin("P", dx=0, dy=0)
    c2.add_pad("P", dx=0, dy=0, w=1, h=1)

    board.trace(c1.pin("P"), c2.pin("P"), width=0.1)
    with pytest.raises(DRCError) as excinfo:
        board.design_rule_check(min_trace_width=0.15)
    assert any("width" in w for w in excinfo.value.warnings)


def test_export_raises_on_drc_failure(tmp_path):
    board = Board(width=5, height=5)
    board.set_layer_stack(["GTL", "GBL"])
    c1 = board.add_component("A", ref="U1", at=(0, 0))
    c1.add_pin("P", dx=0, dy=0)
    c1.add_pad("P", dx=0, dy=0, w=1, h=1)

    c2 = board.add_component("B", ref="U2", at=(0.6, 0))
    c2.add_pin("P", dx=0, dy=0)
    c2.add_pad("P", dx=0, dy=0, w=1, h=1)

    zip_path = tmp_path / "out.zip"
    with pytest.raises(DRCError):
        board.export_gerbers(zip_path)


def test_drc_uses_layer_service_defaults():
    board = Board(width=5, height=5)
    board.set_layer_stack(["GTL", "GBL"])
    c1 = board.add_component("A", ref="U1", at=(0, 0))
    c1.add_pin("P", dx=0, dy=0)
    c1.add_pad("P", dx=0, dy=0, w=1, h=1)

    c2 = board.add_component("B", ref="U2", at=(4, 0))
    c2.add_pin("P", dx=0, dy=0)
    c2.add_pad("P", dx=0, dy=0, w=1, h=1)

    board.trace(c1.pin("P"), c2.pin("P"), width=0.1)
    with pytest.raises(DRCError) as excinfo:
        board.design_rule_check()
    assert any("width" in w for w in excinfo.value.warnings)


def test_via_rules_enforced():
    board = Board(width=5, height=5)
    board.set_layer_stack(["GTL", "GBL"])
    board.add_via(1, 1, diameter=0.3, hole=0.2)
    board.add_via(1.2, 1, diameter=0.3, hole=0.2)
    with pytest.raises(DRCError) as excinfo:
        board.design_rule_check()
    assert any("Via" in w for w in excinfo.value.warnings)

