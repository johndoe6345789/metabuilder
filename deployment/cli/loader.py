"""Load CLI structure from commands.json and dispatch to handler modules."""

import argparse
import importlib
import json
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / "commands.json"


def _load_config() -> dict:
    with open(CONFIG_PATH) as f:
        return json.load(f)


def _add_arguments(parser: argparse.ArgumentParser, arguments: list[dict]) -> None:
    """Add arguments from JSON definitions to an argparse parser."""
    for arg_def in arguments:
        name = arg_def["name"]
        kwargs = {k: v for k, v in arg_def.items() if k != "name"}
        if name.startswith("-"):
            parser.add_argument(name, **kwargs)
        else:
            parser.add_argument(name, **kwargs)


def _build_subcommands(
    parent_sub: argparse._SubParsersAction,
    commands: dict,
) -> None:
    """Recursively build subcommand parsers from JSON config."""
    for cmd_name, cmd_def in commands.items():
        parser = parent_sub.add_parser(cmd_name, help=cmd_def.get("help", ""))

        if "module" in cmd_def:
            parser.set_defaults(_module=cmd_def["module"])

        if "arguments" in cmd_def:
            _add_arguments(parser, cmd_def["arguments"])

        if "subcommands" in cmd_def:
            sub = parser.add_subparsers(dest=f"{cmd_name}_cmd")
            _build_subcommands(sub, cmd_def["subcommands"])


def build_parser() -> tuple[argparse.ArgumentParser, dict]:
    """Build the full argparse parser from commands.json. Returns (parser, config)."""
    config = _load_config()
    prog_def = config["program"]

    parser = argparse.ArgumentParser(
        prog=prog_def["prog"],
        description=prog_def["description"],
    )
    sub = parser.add_subparsers(dest="command", help="Command group")
    _build_subcommands(sub, config["commands"])

    return parser, config


def dispatch(args: argparse.Namespace, config: dict) -> int:
    """Dispatch parsed args to the appropriate handler module."""
    module_path = getattr(args, "_module", None)
    if not module_path:
        return 0

    module = importlib.import_module(module_path)
    return module.run(args, config)
