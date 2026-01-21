import sys
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from examples import esp32_dev_board


def test_esp32_board_export(tmp_path):
    board = esp32_dev_board.build_board()
    zip_path = tmp_path / "esp32.zip"
    board.export_gerbers(zip_path)
    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        names = set(z.namelist())
        assert {"GTL.gbr", "GBL.gbr", "GTO.gbr", "GBO.gbr"}.issubset(names)

