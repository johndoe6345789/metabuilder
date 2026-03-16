"""Push locally-built images to local Nexus registry for act CI runner."""

import argparse
import re
import subprocess
from cli.helpers import (
    PROJECT_ROOT, GREEN, YELLOW, RED, NC,
    docker_image_exists, log_info, run,
)


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    local_registry = "localhost:5050"
    nexus_user, nexus_pass = "admin", "nexus"

    # Derive repo slug from git
    result = subprocess.run(
        ["git", "-C", str(PROJECT_ROOT), "remote", "get-url", "origin"],
        capture_output=True, text=True,
    )
    slug = "johndoe6345789/metabuilder-small"
    if result.returncode == 0:
        m = re.search(r"github\.com[:/]([^/]+/[^/.]+)", result.stdout.strip())
        if m:
            slug = m.group(1).lower()

    source_registry = args.src

    if args.tag:
        tag = args.tag
    else:
        result = subprocess.run(
            ["git", "-C", str(PROJECT_ROOT), "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True,
        )
        tag = result.stdout.strip() if result.returncode == 0 else "main"

    print(f"{YELLOW}Registry:{NC} {local_registry}")
    print(f"{YELLOW}Slug:{NC}     {slug}")
    print(f"{YELLOW}Tag:{NC}      {tag}\n")

    log_info(f"Logging in to {local_registry}...")
    run(["docker", "login", local_registry, "-u", nexus_user, "--password-stdin"],
        input=nexus_pass.encode())

    base_images = ["base-apt", "base-node-deps", "base-pip-deps", "base-conan-deps",
                    "base-android-sdk", "devcontainer"]
    app_images = ["pastebin", "workflowui", "codegen", "postgres-dashboard",
                   "emailclient", "exploded-diagrams", "storybook"]

    pushed = skipped = failed = 0
    for image in base_images + app_images:
        src = f"{source_registry}/{slug}/{image}:{tag}"
        dst = f"{local_registry}/{slug}/{image}:{tag}"

        if args.pull:
            print(f"  {YELLOW}pulling{NC} {src}...")
            if not docker_image_exists(src):
                result = run(["docker", "pull", src])
                if result.returncode != 0:
                    print(f"  {YELLOW}skip{NC} {image} (not found in {source_registry})")
                    skipped += 1
                    continue

        if not docker_image_exists(src) and not docker_image_exists(dst):
            print(f"  {YELLOW}skip{NC} {image} (not found locally)")
            skipped += 1
            continue

        if docker_image_exists(src):
            run(["docker", "tag", src, dst])

        print(f"  {GREEN}push{NC} {dst}")
        result = run(["docker", "push", dst])
        if result.returncode == 0:
            pushed += 1
        else:
            print(f"  {RED}FAILED{NC} {image}")
            failed += 1

    print(f"\n{GREEN}Done.{NC} pushed={pushed}  skipped={skipped}  failed={failed}")
    return 1 if failed else 0


run = run_cmd
