"""Manage the full MetaBuilder stack (up, down, build, restart, logs, ps, clean)."""

import argparse
import subprocess
import sys
import time
from cli.helpers import (
    GREEN, YELLOW, BLUE, RED, NC,
    BASE_DIR, PROJECT_ROOT,
    docker_compose, docker_image_exists, log_info, log_ok, log_warn, log_err, pull_with_retry,
    run as run_shell,
)


def _pull_external_images(profiles: list[str], config: dict) -> None:
    """Pre-pull external images so compose up doesn't block."""
    ext = config["definitions"]["external_images"]
    images = list(ext["core"])

    if "--profile" in profiles:
        prof_names = [profiles[i + 1] for i in range(len(profiles)) if profiles[i] == "--profile"]
        if "monitoring" in prof_names:
            images += ext["monitoring"]
        if "media" in prof_names:
            images += ext["media"]

    log_info(f"Pre-pulling {len(images)} external images...")
    failed = 0
    for i, img in enumerate(images, 1):
        print(f"  [{i}/{len(images)}] {img}")
        if not pull_with_retry(img):
            failed += 1

    if failed:
        log_warn(f"{failed} image(s) failed to pull. Stack may be incomplete.")
    else:
        log_ok("All images ready.")


def _ensure_core_base_images(config: dict) -> bool:
    """Build every local base image referenced by the core Compose stack."""
    base_images = config["definitions"]["base_images"]
    required = ("apt", "conan-cli", "node-deps", "postgres-deps")

    for name in required:
        image = base_images[name]
        tag = image["tag"]
        if docker_image_exists(tag):
            log_ok(f"Base image {tag} exists")
            continue

        log_warn(f"{tag} not found — building it first...")
        result = run_shell([
            "docker", "build", "--network=host",
            "-f", str(BASE_DIR / image["dockerfile"]),
            "-t", tag, str(PROJECT_ROOT),
        ])
        if result.returncode != 0:
            log_err(f"Failed to build {tag} — cannot proceed")
            return False
        log_ok(f"{tag} ready")

    return True


def _wait_for_healthy(profiles: list[str], args: argparse.Namespace) -> None:
    core_count = 23
    profile_info = "core"
    if args.monitoring or args.all_profiles:
        core_count += 9
        profile_info += " + monitoring"
    if args.media or args.all_profiles:
        core_count += 3
        profile_info += " + media"

    print(f"{YELLOW}Waiting for services ({profile_info})...{NC}")
    max_wait = 120
    for elapsed in range(0, max_wait, 2):
        result = subprocess.run(
            docker_compose(*profiles, "ps", "--format", "json"),
            capture_output=True, text=True,
        )
        healthy = result.stdout.count('"healthy"')
        if healthy >= core_count:
            print(f"\n{GREEN}All {core_count} services healthy!{NC}")
            print(f"\nPortal: {BLUE}http://localhost:8900{NC}\n")
            print("Quick commands:")
            print("  python3 deployment.py stack logs")
            print("  python3 deployment.py stack down")
            return
        sys.stdout.write(f"\r  Services healthy: {healthy}/{core_count} ({elapsed}s)")
        sys.stdout.flush()
        time.sleep(2)

    print(f"\n{YELLOW}Timeout waiting for all services.{NC}")
    print("  python3 deployment.py stack ps")


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    profiles: list[str] = []
    if args.monitoring or args.all_profiles:
        profiles += ["--profile", "monitoring"]
    if args.media or args.all_profiles:
        profiles += ["--profile", "media"]

    dev: bool = getattr(args, "dev", False)
    command = args.command or "up"

    mode_label = "dev" if dev else "prod"

    # Check docker compose
    if subprocess.run(["docker", "compose", "version"], capture_output=True).returncode != 0:
        log_err("docker compose not found")
        return 1

    if command in ("down", "stop"):
        log_info(f"Stopping MetaBuilder stack ({mode_label})...")
        result = run_shell(docker_compose(*profiles, "down", dev=dev))
        if result.returncode != 0:
            log_err("docker compose down failed")
            return result.returncode
        log_ok("Stack stopped")
        return 0

    if command == "restart":
        targets = getattr(args, "services", []) or []
        result = run_shell(docker_compose(*profiles, "restart", *targets, dev=dev))
        if result.returncode != 0:
            log_err("docker compose restart failed")
            return result.returncode
        log_ok("Stack restarted")
        return 0

    if command == "logs":
        run_shell(docker_compose(*profiles, "logs", "-f", dev=dev))
        return 0

    if command in ("ps", "status"):
        run_shell(docker_compose(*profiles, "ps", dev=dev))
        return 0

    if command == "clean":
        answer = input(f"{RED}This will remove all containers and volumes! Are you sure? (yes/no): {NC}")
        if answer.strip() == "yes":
            run_shell(docker_compose(*profiles, "down", "-v", dev=dev))
            log_ok("Stack cleaned")
        return 0

    if command == "build":
        log_info(f"Building MetaBuilder stack ({mode_label})...")

        if not _ensure_core_base_images(config):
            return 1

        _pull_external_images(profiles, config)
        result = run_shell(docker_compose(*profiles, "up", "-d", "--build", dev=dev))
        if result.returncode != 0:
            log_err("docker compose build/up failed — stack may be partially deployed")
            return result.returncode
        log_ok("Stack built and started")
        return 0

    if command in ("up", "start"):
        targets = getattr(args, "services", []) or []
        if targets:
            # Targeted redeploy — skip pre-pull, just bring up named services
            log_info(f"Redeploying: {' '.join(targets)}")
            result = run_shell(docker_compose(*profiles, "up", "-d", *targets, dev=dev))
            if result.returncode != 0:
                log_err("docker compose up failed")
                return result.returncode
            log_ok(f"Done: {' '.join(targets)}")
            return 0

        log_info(f"Starting MetaBuilder stack ({mode_label})...")
        _pull_external_images(profiles, config)
        result = run_shell(docker_compose(*profiles, "up", "-d", dev=dev))
        if result.returncode != 0:
            # A non-zero exit means at least one service failed to (re)create —
            # e.g. an image pull error or a container-name conflict. Fail loudly
            # so the deploy job goes red instead of leaving stale containers
            # running behind a green build.
            log_err("docker compose up failed — stack may be partially deployed")
            return result.returncode
        print(f"\n{GREEN}Stack started!{NC}\n")
        _wait_for_healthy(profiles, args)
        return 0

    log_err(f"Unknown command: {command}")
    return 1


run = run_cmd
