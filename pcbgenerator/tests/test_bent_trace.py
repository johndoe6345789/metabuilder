import sys
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import create_bent_trace

EXPECTED_DIR = Path(__file__).resolve().parent / "expected"


def test_bent_trace_export(tmp_path):
    board = create_bent_trace()
    zip_path = tmp_path / "bent.zip"
    board.export_gerbers(zip_path)
    assert zip_path.exists()
    with zipfile.ZipFile(zip_path) as z:
        names = set(z.namelist())
        assert {"GTL.gbr", "GBL.gbr", "GTO.gbr", "GBO.gbr"}.issubset(names)
        gtl_data = z.read("GTL.gbr").decode()
        gbl_data = z.read("GBL.gbr").decode()
        gto_data = z.read("GTO.gbr").decode()
        gbo_data = z.read("GBO.gbr").decode()

    expected_gtl = (EXPECTED_DIR / "bent_trace_GTL.gbr").read_text()
    expected_gbl = (EXPECTED_DIR / "bent_trace_GBL.gbr").read_text()
    expected_gto = (EXPECTED_DIR / "bent_trace_GTO.gbr").read_text()
    expected_gbo = (EXPECTED_DIR / "bent_trace_GBO.gbr").read_text()

    assert gtl_data == expected_gtl
    assert gbl_data == expected_gbl
    assert gto_data == expected_gto
    assert gbo_data == expected_gbo
