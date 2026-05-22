"""Push all locally-built images to Nexus with :main + :latest tags."""

import argparse
import pathlib
import yaml

from cli.helpers import (
    BLUE, GREEN, NC,
    docker_image_exists, log_err, log_info, log_ok, log_warn, run as run_proc,
)

COMPOSE_FILE = pathlib.Path(__file__).parent.parent / "metabuilder/compose.yml"


def _load_built_images() -> list[dict]:
    """Return [{local, name}] for every service with a build: directive."""
    with open(COMPOSE_FILE) as f:
        dc = yaml.safe_load(f)
    images = []
    for svc_name, svc in dc.get("services", {}).items():
        if "build" not in svc:
            continue
        local = svc.get("image", f"metabuilder-deploy-{svc_name}:latest")
        # derive a short push name from the image tag (strip prefix/tag)
        name = local.split("/")[-1].split(":")[0].removeprefix("metabuilder-deploy-")
        images.append({"local": local, "name": name})
    return images


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    nexus = "localhost:5050"
    slug = "johndoe6345789/metabuilder-small"
    nexus_user, nexus_pass = "admin", "nexus"

    log_info(f"Logging in to {nexus}...")
    run_proc(["docker", "login", nexus, "-u", nexus_user, "--password-stdin"],
             input=nexus_pass.encode())

    images = _load_built_images()

    pushed = skipped = failed = 0

    def push_image(local: str, name: str) -> None:
        nonlocal pushed, skipped, failed
        if not docker_image_exists(local):
            log_warn(f"SKIP {name} — {local} not found locally")
            skipped += 1
            return

        dst_main = f"{nexus}/{slug}/{name}:main"
        dst_latest = f"{nexus}/{slug}/{name}:latest"

        log_info(f"Pushing {name}...")
        run_proc(["docker", "tag", local, dst_main])
        run_proc(["docker", "tag", local, dst_latest])

        r1 = run_proc(["docker", "push", dst_main])
        r2 = run_proc(["docker", "push", dst_latest])
        if r1.returncode == 0 and r2.returncode == 0:
            log_ok(f"  {name} -> :main + :latest")
            pushed += 1
        else:
            log_err(f"  {name} FAILED")
            failed += 1

    print(f"\n{BLUE}Registry : {nexus}{NC}")
    print(f"{BLUE}Slug     : {slug}{NC}")
    print(f"{BLUE}Images   : {len(images)} (parsed from compose.yml){NC}\n")

    for entry in images:
        push_image(entry["local"], entry["name"])

    print(f"\n{GREEN}{'=' * 46}{NC}")
    print(f"{GREEN}  Done.  pushed={pushed}  skipped={skipped}  failed={failed}{NC}")
    print(f"{GREEN}{'=' * 46}{NC}")
    return 1 if failed else 0


run = run_cmd
