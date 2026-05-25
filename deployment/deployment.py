#!/usr/bin/env python3
"""MetaBuilder Deployment CLI — JSON-powered, modular command system.

All command definitions live in cli/commands.json.
Each command dispatches to a Python module in cli/*.py.

Usage:
    python3 deployment.py --help
    python3 deployment.py build base [--force] [apt] [node-deps] ...
    python3 deployment.py build apps [--force] [--sequential] [codegen] ...
    python3 deployment.py build testcontainers [--skip-native] [--skip-sidecar]
    python3 deployment.py deploy <app> [--all] [--no-cache]
    python3 deployment.py stack up|down|build|logs|ps|clean [--monitoring] [--media] [--dev]
    python3 deployment.py release <app> [patch|minor|major|x.y.z]
    python3 deployment.py nexus init|push|populate
    python3 deployment.py npm publish-patches [--nexus] [--verdaccio]
    python3 deployment.py artifactory init
"""

import sys
from cli.loader import build_parser, dispatch


def main() -> int:
    parser, config = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    # Handle --list for build base
    if args.command == "build" and getattr(args, "build_type", None) == "base" and getattr(args, "list", False):
        for name, img in config["definitions"]["base_images"].items():
            print(f"  {name}  ->  {img['tag']}")
        return 0

    module_path = getattr(args, "_module", None)
    if not module_path:
        # No module set — print help for the subcommand group
        parser.parse_args([args.command, "--help"])
        return 0

    return dispatch(args, config)


if __name__ == "__main__":
    sys.exit(main())
