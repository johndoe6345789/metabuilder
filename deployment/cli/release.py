"""Bump version, commit, push, and deploy an app."""

import argparse
import json
import os
import re
from cli.helpers import (
    PROJECT_ROOT, CYAN, GREEN, YELLOW, NC,
    docker_compose, log_err, log_ok, run_check,
)


def run(args: argparse.Namespace, config: dict) -> int:
    app = args.app
    bump = args.bump

    # Find package.json
    pkg_path = None
    for candidate in [
        PROJECT_ROOT / "frontends" / app / "package.json",
        PROJECT_ROOT / app / "package.json",
    ]:
        if candidate.exists():
            pkg_path = candidate
            break

    if not pkg_path:
        log_err(f"Cannot find package.json for '{app}'")
        return 1

    with open(pkg_path) as f:
        pkg = json.load(f)
    current = pkg["version"]

    # Compute next version
    if re.match(r"^\d+\.\d+\.\d+$", bump):
        next_ver = bump
    else:
        major, minor, patch = (int(x) for x in current.split("."))
        if bump == "major":
            next_ver = f"{major + 1}.0.0"
        elif bump == "minor":
            next_ver = f"{major}.{minor + 1}.0"
        elif bump == "patch":
            next_ver = f"{major}.{minor}.{patch + 1}"
        else:
            log_err(f"Unknown bump type '{bump}'. Use patch, minor, major, or x.y.z")
            return 1

    print(f"{CYAN}Releasing {app}: {YELLOW}{current}{CYAN} -> {GREEN}{next_ver}{NC}")

    # Update package.json
    pkg["version"] = next_ver
    with open(pkg_path, "w") as f:
        json.dump(pkg, f, indent=2)
        f.write("\n")

    # Commit and push
    os.chdir(PROJECT_ROOT)
    run_check(["git", "add", str(pkg_path)])
    run_check(["git", "commit", "-m",
               f"chore: bump {app} to v{next_ver}\n\n"
               f"Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"])
    run_check(["git", "push", "origin", "main"])

    print(f"{CYAN}Building and deploying {app}...{NC}")
    run_check(docker_compose("up", "-d", "--build", app))

    log_ok(f"{app} v{next_ver} deployed")
    return 0
