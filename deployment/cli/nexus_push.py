"""Push locally-built images to local Nexus registry for act CI runner."""

import argparse
import pathlib
import re
import subprocess
import yaml

from cli.helpers import (
    PROJECT_ROOT, GREEN, YELLOW, RED, NC,
    docker_image_exists, log_info, run as run_proc,
)

COMPOSE_FILE = pathlib.Path(__file__).parent.parent / "metabuilder/compose.yml"
BASE_IMAGES_DIR = pathlib.Path(__file__).parent.parent / "base-images"

# Dockerfile.apt -> base-apt, Dockerfile.node-deps -> base-node-deps, etc.
_DOCKERFILE_RE = re.compile(r"^Dockerfile\.(.+)$")


def _load_image_names() -> list[str]:
    """Return all image short-names: base images from Dockerfiles + apps from compose."""
    names = []

    for df in sorted(BASE_IMAGES_DIR.glob("Dockerfile.*")):
        m = _DOCKERFILE_RE.match(df.name)
        if m:
            names.append(f"base-{m.group(1)}")

    with open(COMPOSE_FILE) as f:
        dc = yaml.safe_load(f)
    for svc_name, svc in dc.get("services", {}).items():
        if "build" not in svc:
            continue
        local = svc.get("image", f"metabuilder-deploy-{svc_name}:latest")
        name = local.split("/")[-1].split(":")[0].removeprefix("metabuilder-deploy-")
        names.append(name)

    return names


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

    images = _load_image_names()

    print(f"{YELLOW}Registry:{NC} {local_registry}")
    print(f"{YELLOW}Slug:{NC}     {slug}")
    print(f"{YELLOW}Tag:{NC}      {tag}")
    print(f"{YELLOW}Images:{NC}   {len(images)} (base-images/ + compose.yml)\n")

    log_info(f"Logging in to {local_registry}...")
    run_proc(["docker", "login", local_registry, "-u", nexus_user, "--password-stdin"],
             input=nexus_pass.encode())

    pushed = skipped = failed = 0
    for image in images:
        src = f"{source_registry}/{slug}/{image}:{tag}"
        dst = f"{local_registry}/{slug}/{image}:{tag}"

        if args.pull:
            print(f"  {YELLOW}pulling{NC} {src}...")
            if not docker_image_exists(src):
                result = run_proc(["docker", "pull", src])
                if result.returncode != 0:
                    print(f"  {YELLOW}skip{NC} {image} (not found in {source_registry})")
                    skipped += 1
                    continue

        if not docker_image_exists(src) and not docker_image_exists(dst):
            print(f"  {YELLOW}skip{NC} {image} (not found locally)")
            skipped += 1
            continue

        if docker_image_exists(src):
            run_proc(["docker", "tag", src, dst])

        print(f"  {GREEN}push{NC} {dst}")
        result = run_proc(["docker", "push", dst])
        if result.returncode == 0:
            pushed += 1
        else:
            print(f"  {RED}FAILED{NC} {image}")
            failed += 1

    print(f"\n{GREEN}Done.{NC} pushed={pushed}  skipped={skipped}  failed={failed}")
    return 1 if failed else 0


run = run_cmd
