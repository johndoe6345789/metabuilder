"""Shared helpers for all CLI command modules."""

from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent.parent  # deployment/
PROJECT_ROOT = SCRIPT_DIR.parent
BASE_DIR = SCRIPT_DIR / "base-images"
COMPOSE_FILE = SCRIPT_DIR / "metabuilder/compose.yml"
COMPOSE_FILE_DEV = SCRIPT_DIR / "metabuilder/compose.dev.yml"

# ── Colors ───────────────────────────────────────────────────────────────────

RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
CYAN = "\033[0;36m"
NC = "\033[0m"


def log_info(msg: str) -> None:
    print(f"{BLUE}[deploy]{NC} {msg}")


def log_ok(msg: str) -> None:
    print(f"{GREEN}[deploy]{NC} {msg}")


def log_warn(msg: str) -> None:
    print(f"{YELLOW}[deploy]{NC} {msg}")


def log_err(msg: str) -> None:
    print(f"{RED}[deploy]{NC} {msg}")


# ── Command runners ─────────────────────────────────────────────────────────


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    """Run a command, printing it and streaming output."""
    print(f"  $ {' '.join(cmd)}", flush=True)
    return subprocess.run(cmd, **kwargs)


def run_check(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    """Run a command and raise on failure."""
    return run(cmd, check=True, **kwargs)


# ── Docker helpers ──────────────────────────────────────────────────────────


def docker_image_exists(tag: str) -> bool:
    return subprocess.run(
        ["docker", "image", "inspect", tag], capture_output=True,
    ).returncode == 0


def docker_compose(*args: str, dev: bool = False) -> list[str]:
    files = ["-f", str(COMPOSE_FILE)]
    if dev:
        files += ["-f", str(COMPOSE_FILE_DEV)]
    return ["docker", "compose", *files, *args]


def curl_status(url: str, auth: str | None = None, timeout: int = 5) -> int:
    """Return HTTP status code for a URL, or 0 on connection error."""
    cmd = ["curl", "-s", "-o", os.devnull, "-w", "%{http_code}",
           "--connect-timeout", str(timeout)]
    if auth:
        cmd += ["-u", auth]
    cmd.append(url)
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return int(result.stdout.strip())
    except (ValueError, AttributeError):
        return 0


def pull_with_retry(image: str, max_attempts: int = 5) -> bool:
    delay = 5
    for attempt in range(1, max_attempts + 1):
        result = run(["docker", "pull", image])
        if result.returncode == 0:
            return True
        if attempt < max_attempts:
            log_warn(f"Pull failed (attempt {attempt}/{max_attempts}), retrying in {delay}s...")
            time.sleep(delay)
            delay *= 2
    log_err(f"Failed to pull {image} after {max_attempts} attempts")
    return False


def build_with_retry(tag: str, dockerfile: str, context: str, max_attempts: int = 5) -> bool:
    """Build a Docker image with retry on failure."""
    from datetime import datetime
    date_tag = f"{tag.rsplit(':', 1)[0]}:{datetime.now().strftime('%Y%m%d')}"

    # When BASE_REGISTRY is set (CI on a host whose Docker builders do not
    # consult the local image store), pass it through so a Dockerfile's
    # `FROM ${BASE_REGISTRY}/<parent>:latest` resolves from the registry
    # (Nexus) instead of an unresolvable local-only tag. Unset -> Dockerfile
    # ARG default ("metabuilder"), preserving local/dev behaviour.
    extra_args: list[str] = []
    base_registry = os.environ.get("BASE_REGISTRY")
    if base_registry:
        extra_args = ["--build-arg", f"BASE_REGISTRY={base_registry}"]

    log_info(f"Building {tag} ...")
    for attempt in range(1, max_attempts + 1):
        result = run([
            "docker", "build", "--network=host",
            "--file", dockerfile,
            *extra_args,
            "--tag", tag, "--tag", date_tag,
            context,
        ])
        if result.returncode == 0:
            log_ok(f"{tag} built successfully")
            return True
        if attempt < max_attempts:
            wait = attempt * 15
            log_warn(f"Build failed (attempt {attempt}/{max_attempts}), retrying in {wait}s ...")
            time.sleep(wait)

    log_err(f"Failed to build {tag} after {max_attempts} attempts")
    return False


def get_buildable_services() -> list[str]:
    """Return all service names that have a build: section in the compose file."""
    import yaml
    with open(COMPOSE_FILE) as f:
        compose = yaml.safe_load(f)
    return [
        name for name, svc in compose.get("services", {}).items()
        if isinstance(svc, dict) and "build" in svc
    ]


def resolve_services(targets: list[str], config: dict) -> list[str] | None:
    """Validate compose service names against the compose file. Returns None on error."""
    buildable = get_buildable_services()
    services = []
    for t in targets:
        if t not in buildable:
            log_err(f"Unknown or non-buildable service: {t}")
            print(f"Available: {', '.join(buildable)}")
            return None
        services.append(t)
    return services


def docker_image_size(tag: str) -> str:
    """Return human-readable size of a Docker image."""
    result = subprocess.run(
        ["docker", "image", "inspect", tag, "--format", "{{.Size}}"],
        capture_output=True, text=True,
    )
    try:
        return f"{int(result.stdout.strip()) / 1073741824:.1f} GB"
    except ValueError:
        return "?"
