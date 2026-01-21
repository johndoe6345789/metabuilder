from __future__ import annotations

import keyword
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Set


@dataclass(frozen=True)
class CoverageBucket:
    name: str
    supported: Set[str]
    universe: Set[str]

    @property
    def missing(self) -> Set[str]:
        return self.universe - self.supported

    @property
    def percent(self) -> float:
        if not self.universe:
            return 100.0
        return (len(self.supported) / len(self.universe)) * 100.0

    def format_lines(self) -> list[str]:
        lines = [f"{self.name}: {len(self.supported)}/{len(self.universe)} ({self.percent:.1f}%)"]
        lines.append(f"  supported: {', '.join(sorted(self.supported)) or 'none'}")
        lines.append(f"  missing:   {', '.join(sorted(self.missing)) or 'none'}")
        return lines


def find_repo_root(start: Path) -> Path:
    for candidate in [start, *start.parents]:
        if (candidate / ".git").exists():
            return candidate
    return start


def read_file(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def gather_keyword_sets(source: str) -> tuple[Set[str], Set[str]]:
    block_match = re.search(r"Token Tokenizer::readIdentifier\(\).*?Token Tokenizer::readNumber", source, re.S)
    block = block_match.group(0) if block_match else source

    keywords: Set[str] = set(re.findall(r'"([A-Za-z_]+)"', block))
    operator_keywords: Set[str] = {kw for kw in keywords if kw in {"and", "or", "not", "in", "is"}}
    return keywords, operator_keywords


def gather_operator_tokens(source: str) -> Set[str]:
    tokens: Set[str] = set()
    tokens.update(re.findall(r"startsWith\\(\\\"([^\\\"]+)\\\"\\)", source))
    single_char_block = re.search(r"if \(c == .*?\) {", source, re.S)
    if single_char_block:
        tokens.update(re.findall(r"'([+\-*/<>=:\,\(\)\[\]\{\}\.])'", single_char_block.group(0)))
    tokens.update({"==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "//", "//=", "**", "**=", "%"})
    return tokens


def gather_builtins(source: str) -> Set[str]:
    return set(re.findall(r'addBuiltin\("([A-Za-z_][A-Za-z0-9_]*)"', source))


def gather_value_kinds(header: str) -> Set[str]:
    block_match = re.search(r"enum class ValueKind \{([^}]+)\};", header, re.S)
    if not block_match:
        return set()
    entries = re.findall(r"([A-Za-z_]+)\s*,?", block_match.group(1))
    return {entry.strip() for entry in entries if entry.strip()}


def build_bucket(name: str, supported: Iterable[str], universe: Iterable[str]) -> CoverageBucket:
    return CoverageBucket(name, set(supported), set(universe))


def main() -> None:
    script_path = Path(__file__).resolve()
    repo_root = find_repo_root(script_path)

    cpp_path = repo_root / "arduino/libraries/TypthonMini/src/TypthonMini.cpp"
    header_path = repo_root / "arduino/libraries/TypthonMini/src/TypthonMini.h"

    cpp_source = read_file(cpp_path)
    header_source = read_file(header_path)

    keyword_tokens, operator_keywords = gather_keyword_sets(cpp_source)
    supported_keywords = keyword_tokens | operator_keywords

    keyword_bucket = build_bucket("Keywords", supported_keywords, set(keyword.kwlist))

    operator_tokens = gather_operator_tokens(cpp_source)
    python_operator_universe = {
        "+",
        "-",
        "*",
        "/",
        "//",
        "%",
        "**",
        "=",
        "+=",
        "-=",
        "*=",
        "/=",
        "%=",
        "//=",
        "**=",
        "==",
        "!=",
        "<",
        ">",
        "<=",
        ">=",
        "and",
        "or",
        "not",
        "(",
        ")",
        "[",
        "]",
        "{",
        "}",
        ".",
        ":",
        ",",
    }
    supported_ops = (operator_tokens | operator_keywords) & python_operator_universe
    operator_bucket = build_bucket("Operators", supported_ops, python_operator_universe)

    statement_universe = {
        "if",
        "elif",
        "else",
        "while",
        "for",
        "try",
        "except",
        "finally",
        "with",
        "def",
        "class",
        "return",
        "break",
        "continue",
        "pass",
        "lambda",
        "import",
        "from",
        "raise",
        "global",
        "nonlocal",
        "yield",
        "await",
    }
    parser_supported = {
        "if",
        "elif",
        "else",
        "while",
        "for",
        "try",
        "except",
        "finally",
        "with",
        "def",
        "class",
        "return",
        "break",
        "continue",
        "pass",
        "lambda",
        "import",
        "from",
        "raise",
        "global",
        "nonlocal",
        "yield",
        "await",
    }
    statement_bucket = build_bucket("Statements", parser_supported, statement_universe)

    type_universe = {"None", "Number", "Boolean", "Text", "List", "Dict", "Function", "Class", "Instance", "Tuple", "Set"}
    type_bucket = build_bucket("Types", gather_value_kinds(header_source), type_universe)

    builtin_bucket = build_bucket("Built-ins", gather_builtins(cpp_source), {"print", "sleep"})

    buckets = [keyword_bucket, operator_bucket, statement_bucket, type_bucket, builtin_bucket]

    for bucket in buckets:
        for line in bucket.format_lines():
            print(line)
        print()


if __name__ == "__main__":
    main()
