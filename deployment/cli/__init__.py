"""MetaBuilder Deployment CLI — modular command system powered by JSON config."""

from cli.loader import build_parser, dispatch

__all__ = ["build_parser", "dispatch"]
