"""Push all locally-built images to Nexus with :main + :latest tags."""

import argparse
from cli.helpers import (
    BLUE, GREEN, NC,
    docker_image_exists, log_err, log_info, log_ok, log_warn, run as run_proc,
)


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    nexus = "localhost:5050"
    slug = "johndoe6345789/metabuilder-small"
    nexus_user, nexus_pass = "admin", "nexus"

    log_info(f"Logging in to {nexus}...")
    run_proc(["docker", "login", nexus, "-u", nexus_user, "--password-stdin"],
             input=nexus_pass.encode())

    images_def = config["definitions"]["nexus_images"]

    pushed = skipped = failed = 0

    def push_image(src: str, name: str, size: str) -> None:
        nonlocal pushed, skipped, failed
        if not docker_image_exists(src):
            log_warn(f"SKIP {name} — {src} not found locally")
            skipped += 1
            return

        dst_main = f"{nexus}/{slug}/{name}:main"
        dst_latest = f"{nexus}/{slug}/{name}:latest"

        log_info(f"Pushing {name} ({size})...")
        run_proc(["docker", "tag", src, dst_main])
        run_proc(["docker", "tag", src, dst_latest])

        r1 = run_proc(["docker", "push", dst_main])
        r2 = run_proc(["docker", "push", dst_latest])
        if r1.returncode == 0 and r2.returncode == 0:
            log_ok(f"  {name} -> :main + :latest")
            pushed += 1
        else:
            log_err(f"  {name} FAILED")
            failed += 1

    print(f"\n{BLUE}Registry  : {nexus}{NC}")
    print(f"{BLUE}Slug      : {slug}{NC}")
    print(f"{BLUE}Skip heavy: {args.skip_heavy}{NC}\n")

    for entry in images_def["base"] + images_def["apps"]:
        push_image(entry["local"], entry["name"], entry["size"])

    if args.skip_heavy:
        log_warn("Skipping heavy images (--skip-heavy set):")
        for entry in images_def["heavy"] + images_def["heavy_apps"]:
            log_warn(f"  {entry['name']} ({entry['size']})")
    else:
        log_info("--- Heavy images (this will take a while) ---")
        for entry in images_def["heavy_apps"] + images_def["heavy"]:
            push_image(entry["local"], entry["name"], entry["size"])

    print(f"\n{GREEN}{'=' * 46}{NC}")
    print(f"{GREEN}  Done.  pushed={pushed}  skipped={skipped}  failed={failed}{NC}")
    print(f"{GREEN}{'=' * 46}{NC}")
    return 1 if failed else 0


run = run_cmd
