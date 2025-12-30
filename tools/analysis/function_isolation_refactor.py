#!/usr/bin/env python3
"""Function isolation refactor helper.

This script scans TypeScript and C++ sources to build a plan for splitting
files into one-function-per-file layouts. It can also generate intentionally
broken stubs with TODO markers so refactors remain gated on manual review.
"""
from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import List, Sequence

IGNORED_DIRS = {".git", "node_modules", "dist", "build", "out", "coverage", "vendor", "venv"}
TS_EXTENSIONS = {".ts", ".tsx"}
CPP_EXTENSIONS = {".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx", ".h", ".c"}


def _matches_language(path: Path, languages: Sequence[str]) -> bool:
    suffix = path.suffix.lower()
    if "typescript" in languages and suffix in TS_EXTENSIONS:
        return True
    if "cpp" in languages and suffix in CPP_EXTENSIONS:
        return True
    return False


@dataclass
class FunctionCandidate:
    name: str
    source_kind: str
    parent: str | None
    recommended_filename: str
    notes: List[str] = field(default_factory=list)


@dataclass
class FilePlan:
    path: str
    language: str
    functions: List[FunctionCandidate]
    classes: List[str]
    raw_function_hits: int


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def _detect_classes(content: str) -> list[str]:
    class_pattern = re.compile(r"\bclass\s+([A-Za-z_][A-Za-z0-9_]*)")
    return list({match.group(1) for match in class_pattern.finditer(content)})


def _detect_ts_functions(content: str) -> list[str]:
    names: list[str] = []
    function_patterns = [
        re.compile(r"\bfunction\s+([A-Za-z_][A-Za-z0-9_]*)\s*\("),
        re.compile(r"\bconst\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>"),
        re.compile(r"\bexport\s+default\s+function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\("),
    ]
    for pattern in function_patterns:
        names.extend(match.group(1) for match in pattern.finditer(content))
    return list(dict.fromkeys(names))


def _detect_cpp_functions(content: str) -> list[str]:
    cpp_pattern = re.compile(
        r"^[\w:<>&\*\s]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{]*\)\s*(?:const)?\s*\{",
        re.MULTILINE,
    )
    return list(dict.fromkeys(match.group(1) for match in cpp_pattern.finditer(content)))


def _recommended_filename(name: str, existing: set[str], extension: str) -> str:
    candidate = f"{name}{extension}"
    counter = 1
    while candidate in existing:
        candidate = f"{name}_{counter}{extension}"
        counter += 1
    existing.add(candidate)
    return candidate


def _build_plan_for_file(path: Path, root: Path) -> FilePlan:
    content = _read_text(path)
    language = "typescript" if path.suffix.lower() in TS_EXTENSIONS else "cpp"
    classes = _detect_classes(content)
    if language == "typescript":
        function_names = _detect_ts_functions(content)
        extension = path.suffix if path.suffix.lower() in TS_EXTENSIONS else ".ts"
    else:
        function_names = _detect_cpp_functions(content)
        extension = ".cpp" if path.suffix.lower() in {".cpp", ".cc", ".cxx"} else path.suffix

    seen = set[str]()
    candidates = []
    for name in function_names:
        notes = []
        if classes:
            notes.append("Function is in a file with class definitions; confirm container-only usage.")
        recommended = _recommended_filename(name, seen, extension)
        candidates.append(
            FunctionCandidate(
                name=name,
                source_kind="free_function",
                parent=None,
                recommended_filename=recommended,
                notes=notes,
            )
        )

    rel_path = str(path.relative_to(root))
    return FilePlan(
        path=rel_path,
        language=language,
        functions=candidates,
        classes=classes,
        raw_function_hits=len(function_names),
    )


def collect_plan(root: Path, languages: Sequence[str]) -> list[FilePlan]:
    plans: list[FilePlan] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in IGNORED_DIRS for part in path.parts):
            continue
        if not _matches_language(path, languages):
            continue
        plans.append(_build_plan_for_file(path, root))
    return plans


def _write_plan(plans: Sequence[FilePlan], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    data = [asdict(plan) for plan in plans]
    output.write_text(json.dumps(data, indent=2), encoding="utf-8")


def _build_stub_contents(language: str, function: FunctionCandidate, origin: str) -> str:
    todo_header = (
        f"// TODO: migrate `{function.name}` from {origin} into a dedicated module.\n"
        "// INTENTIONAL_ERROR: stub needs manual completion before it can compile.\n"
    )
    if language == "typescript":
        header = f"export function {function.name}() " + "{\n"
        body = (
            header
            + "  // TODO: port implementation details.\n"
            + "  const intentionallyBroken = ; // missing value on purpose.\n"
            + "  throw new Error('TODO implement function logic');\n"
            + "}\n"
        )
        return todo_header + body
    broken_signature = f"auto {function.name}() -> void " + "{\n"
    body = (
        broken_signature
        + "  // TODO: copy signature, includes, and behavior.\n"
        + "  int missingReturnValue; // INTENTIONAL_ERROR: unused/uninitialized.\n"
        + "}\n"
    )
    return todo_header + body


def _write_stub_file(base_dir: Path, origin: str, plan: FilePlan, function: FunctionCandidate, force: bool) -> None:
    destination = base_dir.joinpath(Path(origin).parent, function.recommended_filename)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and not force:
        return
    destination.write_text(_build_stub_contents(plan.language, function, origin), encoding="utf-8")


def generate_stubs(plans: Sequence[FilePlan], root: Path, force: bool) -> None:
    for plan in plans:
        for function in plan.functions:
            _write_stub_file(root, plan.path, plan, function, force)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare one-function-per-file refactor plans.")
    parser.add_argument("root", nargs="?", default=Path.cwd(), type=Path, help="Root directory to scan.")
    parser.add_argument(
        "--languages",
        nargs="+",
        default=["typescript", "cpp"],
        choices=["typescript", "cpp"],
        help="Languages to include in the scan.",
    )
    parser.add_argument(
        "--plan-output",
        default=Path("function_isolation_plan.json"),
        type=Path,
        help="Path to write the plan JSON report.",
    )
    parser.add_argument(
        "--generate-stubs",
        action="store_true",
        help="Create intentionally broken TODO stubs under the stub-root directory.",
    )
    parser.add_argument(
        "--stub-root",
        default=Path("refactor_stubs"),
        type=Path,
        help="Directory to write stub files when --generate-stubs is provided.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing stubs if present.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    plans = collect_plan(args.root.resolve(), args.languages)
    _write_plan(plans, args.plan_output)
    if args.generate_stubs:
        generate_stubs(plans, args.stub_root, args.force)
    print(f"Refactor plan wrote {len(plans)} file entries to {args.plan_output}")
    if args.generate_stubs:
        print(f"Stub files emitted to {args.stub_root} (force={args.force})")
    else:
        print("No stub files generated; rerun with --generate-stubs to create TODO placeholders.")


if __name__ == "__main__":
    main()
