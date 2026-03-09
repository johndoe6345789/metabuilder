from __future__ import annotations

import sys

from .app import run
from .config import RelayConfig


def main(argv: list[str] | None = None) -> int:
    _ = argv or sys.argv[1:]
    try:
        cfg = RelayConfig.from_env()
    except ValueError as exc:
        print(f"Config error: {exc}", file=sys.stderr)
        return 2
    run(cfg)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
