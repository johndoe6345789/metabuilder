#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import re
import sys


def parse_prisma_models(schema_path: pathlib.Path) -> list[str]:
    text = schema_path.read_text()
    return re.findall(r"^model\s+(\w+)\s+\{", text, re.M)


def parse_dbal_types(types_path: pathlib.Path) -> list[str]:
    text = types_path.read_text()
    match = re.search(r"export type \{([^}]+)\}", text)
    if not match:
        return []
    return [name.strip() for name in match.group(1).split(",") if name.strip()]


def main() -> int:
    root = pathlib.Path(__file__).resolve().parents[1]
    prisma_schema = root / "prisma" / "schema.prisma"
    dbal_types = root / "dbal" / "development" / "src" / "core" / "validation" / "entities" / "types.ts"

    if not prisma_schema.exists():
        print(f"Missing Prisma schema: {prisma_schema}", file=sys.stderr)
        return 2
    if not dbal_types.exists():
        print(f"Missing DBAL types: {dbal_types}", file=sys.stderr)
        return 2

    prisma_models = parse_prisma_models(prisma_schema)
    dbal_model_types = parse_dbal_types(dbal_types)

    missing = [model for model in prisma_models if model not in dbal_model_types]
    extra = [model for model in dbal_model_types if model not in prisma_models]

    if missing:
        print("Missing in DBAL:")
        for model in missing:
            print(f"- {model}")

    if extra:
        print("Extra in DBAL:")
        for model in extra:
            print(f"- {model}")

    if not missing and not extra:
        print("DBAL and Prisma models are in sync.")
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
