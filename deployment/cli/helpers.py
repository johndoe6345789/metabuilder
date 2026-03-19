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
COMPOSE_FILE = SCRIPT_DIR / "docker-compose.stack.yml"

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


def docker_compose(*args: str) -> list[str]:
    return ["docker", "compose", "-f", str(COMPOSE_FILE), *args]


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

    log_info(f"Building {tag} ...")
    for attempt in range(1, max_attempts + 1):
        result = run([
            "docker", "build", "--network=host",
            "--file", dockerfile,
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


def resolve_services(targets: list[str], config: dict) -> list[str] | None:
    """Map friendly app names to compose service names. Returns None on error."""
    svc_map = config["definitions"]["service_map"]
    services = []
    for t in targets:
        svc = svc_map.get(t)
        if not svc:
            log_err(f"Unknown app: {t}")
            print(f"Available: {', '.join(config['definitions']['all_apps'])}")
            return None
        services.append(svc)
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
