import sys
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import (
    create_voltage_divider,
    create_led_indicator,
    create_rc_lowpass,
    Layer,
)


def check_zip_created(board, tmp_path):
    zip_path = tmp_path / "out.zip"
    board.export_gerbers(zip_path)
    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        assert {"GTL.gbr", "GBL.gbr", "GTO.gbr", "GBO.gbr"}.issubset(set(z.namelist()))


def test_voltage_divider(tmp_path):
    board = create_voltage_divider()
    assert len(board.components) == 4
    assert len(board.layers[Layer.TOP_COPPER.value]) == 4
    check_zip_created(board, tmp_path)


def test_led_indicator(tmp_path):
    board = create_led_indicator()
    assert len(board.components) == 3
    assert len(board.layers[Layer.TOP_COPPER.value]) == 3
    check_zip_created(board, tmp_path)


def test_rc_lowpass(tmp_path):
    board = create_rc_lowpass()
    assert len(board.components) == 4
    assert len(board.layers[Layer.TOP_COPPER.value]) == 4
    check_zip_created(board, tmp_path)


