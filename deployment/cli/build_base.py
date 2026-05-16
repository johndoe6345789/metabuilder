"""Build base Docker images (apt, node-deps, pip-deps, conan-{cli,media,dbal,qt6,gameengine}, android-sdk, devcontainer)."""

import argparse
from cli.helpers import (
    BASE_DIR, PROJECT_ROOT, GREEN, NC,
    build_with_retry, docker_image_exists, docker_image_size,
    log_ok, log_warn, log_err,
)


def run(args: argparse.Namespace, config: dict) -> int:
    defs = config["definitions"]
    build_order = defs["base_build_order"]
    base_images = defs["base_images"]
    targets = args.images if args.images else list(build_order)

    for t in targets:
        if t not in base_images:
            log_err(f"Unknown base image: {t}")
            print(f"Available: {', '.join(build_order)}")
            return 1

    print(f"\nMetaBuilder Base Image Builder")
    print(f"Building: {' '.join(targets)}\n")

    failed = []
    for name in build_order:
        if name not in targets:
            continue

        img = base_images[name]
        tag = img["tag"]

        if not args.force and docker_image_exists(tag):
            log_ok(f"Skipping {name} — {tag} already exists (use --force to rebuild)")
            continue

        context = str(BASE_DIR) if img.get("context") == "base-images" else str(PROJECT_ROOT)
        dockerfile = str(BASE_DIR / img["dockerfile"])

        if not build_with_retry(tag, dockerfile, context):
            failed.append(name)
            log_warn("Continuing with remaining images...")

    print()
    if not failed:
        print(f"{GREEN}All base images built successfully!{NC}\n")
        for name in targets:
            tag = base_images[name]["tag"]
            if docker_image_exists(tag):
                print(f"  {GREEN}✓{NC}  {tag}  ({docker_image_size(tag)})")
        print(f"\nNow run:  python3 deployment.py build apps")
        return 0

    log_err(f"Some images failed: {' '.join(failed)}")
    print(f"Re-run: python3 deployment.py build base {' '.join(failed)}")
    return 1
