import sys
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from examples import dazzler


def test_dazzler_board(tmp_path):
    board = dazzler.build_board()
    board.save_svg_previews(tmp_path)
    zip_path = tmp_path / "dazzler.zip"
    board.export_gerbers(zip_path)
    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        names = set(z.namelist())
        assert {
            "GTL.gbr",
            "GBL.gbr",
            "GTO.gbr",
            "GBO.gbr",
            "preview_top.svg",
            "preview_bottom.svg",
            "preview_top.png",
            "preview_bottom.png",
        }.issubset(names)

    with open(tmp_path / "preview_top.svg", "r", encoding="utf-8") as f:
        data = f.read()
        assert "GD3X" in data
        assert "polygon" in data and "fill=\"white\"" in data
