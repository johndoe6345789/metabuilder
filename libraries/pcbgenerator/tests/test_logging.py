import os
from pathlib import Path
import sys
import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from boardforge import PCB


def test_add_component_logging(tmp_path):
    # run in isolated directory so log file doesn't interfere
    cwd = os.getcwd()
    os.chdir(tmp_path)
    try:
        board = PCB(width=5, height=5)
        board.add_component("RES", ref="R1", at=(0, 0))
        log_path = tmp_path / "boardforge.log"
        assert log_path.exists(), "boardforge.log should be created"
        log_contents = log_path.read_text()
        assert "ENTER add_component" in log_contents
        assert "EXIT add_component" in log_contents
    finally:
        os.chdir(cwd)
