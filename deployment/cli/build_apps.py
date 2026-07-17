"""Build application Docker images via docker compose."""

import argparse
import os
import time
from cli.helpers import (
    BASE_DIR, PROJECT_ROOT, GREEN, YELLOW, NC,
    docker_compose, docker_image_exists, get_buildable_services, log_err, log_info, log_ok, log_warn,
    pull_with_retry, resolve_services, run as run_proc,
)


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    if getattr(args, "list", False):
        for svc in get_buildable_services():
            print(f"  {svc}")
        return 0

    defs = config["definitions"]
    base_images = defs["base_images"]

    # Ensure base-node-deps exists
    node_tag = base_images["node-deps"]["tag"]
    if not docker_image_exists(node_tag):
        log_warn(f"Building {node_tag} (required by all Node.js frontends)...")
        result = run_proc([
            "docker", "build",
            "-f", str(BASE_DIR / base_images["node-deps"]["dockerfile"]),
            "-t", node_tag, str(PROJECT_ROOT),
        ])
        if result.returncode != 0:
            log_err("Failed to build base-node-deps — cannot proceed")
            return 1
    else:
        log_ok(f"Base image {node_tag} exists")

    # Warn about optional bases
    optional = ["apt", "conan-cli", "conan-media", "conan-dbal", "conan-qt6", "conan-gameengine", "pip-deps", "android-sdk"]
    missing = [base_images[k]["tag"] for k in optional if not docker_image_exists(base_images[k]["tag"])]
    if missing:
        log_warn("Optional base images not built (C++ daemons, dev container):")
        for img in missing:
            print(f"  - {img}")
        print(f"{YELLOW}Build with:{NC}  python3 deployment.py build base\n")

    buildable = get_buildable_services()
    targets = args.apps if args.apps else buildable
    services = resolve_services(targets, config)
    if services is None:
        return 1

    # Skip existing (unless --force)
    if not args.force:
        needs_build, needs_names = [], []
        for t, svc in zip(targets, services):
            img = f"metabuilder-deploy-{svc}"
            if docker_image_exists(img):
                log_ok(f"Skipping {t} — image {img} already exists (use --force to rebuild)")
            else:
                needs_names.append(t)
                needs_build.append(svc)
        if not needs_build:
            print(f"\n{GREEN}All app images already built! Use --force to rebuild.{NC}")
            return 0
        targets, services = needs_names, needs_build

    print(f"{YELLOW}Building: {' '.join(targets)}{NC}\n")

    # Pre-pull base images
    log_info("Pre-pulling base images for app builds...")
    for img in defs["external_images"]["build_bases"]:
        if not docker_image_exists(img):
            print(f"  Pulling {img}...")
            pull_with_retry(img)

    # Build with retry
    max_attempts = 5
    build_ok = False
    for attempt in range(1, max_attempts + 1):
        if attempt > 1:
            log_warn(f"Build attempt {attempt}/{max_attempts}...")

        # When BASE_REGISTRY is set (CI on a host whose Docker builders do not
        # use the local image store), pass it through so app Dockerfiles
        # resolve `FROM ${BASE_REGISTRY}/base-*:latest` from the registry
        # (Nexus). Unset -> Dockerfile ARG default ("metabuilder").
        br = os.environ.get("BASE_REGISTRY")
        br_args = ["--build-arg", f"BASE_REGISTRY={br}"] if br else []

        if args.sequential:
            all_ok = True
            for svc in services:
                log_info(f"Building {svc}...")
                result = run_proc(docker_compose("build", *br_args, svc))
                if result.returncode != 0:
                    log_err(f"Failed: {svc}")
                    all_ok = False
                    break
                log_ok(f"Done: {svc}")
            if all_ok:
                build_ok = True
                break
        else:
            log_info("Parallel build (uses more RAM)...")
            result = run_proc(docker_compose("build", "--parallel", *br_args, *services))
            if result.returncode == 0:
                build_ok = True
                break

        if attempt < max_attempts:
            wait = attempt * 10
            log_warn(f"Build failed (attempt {attempt}/{max_attempts}), retrying in {wait}s...")
            time.sleep(wait)

    if not build_ok:
        log_err(f"Build failed after {max_attempts} attempts")
        return 1

    print(f"\n{GREEN}Build complete!{NC}")
    print("Start with: python3 deployment.py stack up")
    return 0


# Module entry point — called by loader.dispatch()
# NOTE: must not shadow the imported `run` from cli.helpers
def run(args, config):
    return run_cmd(args, config)
