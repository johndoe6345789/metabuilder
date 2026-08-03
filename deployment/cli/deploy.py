"""Build + deploy one or more apps with health check polling."""

import argparse
import sys
import time
from cli.helpers import (
    COMPOSE_FILE, GREEN, RED, YELLOW, BLUE, NC,
    container_health, docker_compose, get_buildable_services, log_err,
    log_warn, resolve_services, run as run_proc,
)


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    buildable = get_buildable_services()
    targets = buildable if args.all else args.apps
    if not targets:
        log_err("Specify app(s) to deploy, or use --all")
        print(f"Available: {', '.join(buildable)}")
        return 1

    services = resolve_services(targets, config)
    if services is None:
        return 1

    print(f"\n{BLUE}{'=' * 43}{NC}")
    print(f"{BLUE}  Deploy: {' '.join(targets)}{NC}")
    print(f"{BLUE}{'=' * 43}{NC}\n")

    # Step 1: Build
    print(f"{YELLOW}[1/3] Building...{NC}")
    build_args = ["--no-cache"] if args.no_cache else []
    result = run_proc(docker_compose("build", *build_args, *services))
    if result.returncode != 0:
        log_err("Build failed")
        return 1

    # Step 2: Deploy
    print(f"\n{YELLOW}[2/3] Deploying...{NC}")
    result = run_proc(docker_compose("up", "-d", "--force-recreate", *services))
    if result.returncode != 0:
        log_err("Deploy failed")
        return 1

    # Step 3: Health check
    print(f"\n{YELLOW}[3/3] Waiting for health checks...{NC}")
    all_healthy = True
    for svc in services:
        container = f"metabuilder-{svc}"
        sys.stdout.write(f"  {svc}: ")
        sys.stdout.flush()

        status = "unknown"
        for _ in range(30):
            status = container_health(container)
            if status in ("healthy", "unhealthy"):
                break
            time.sleep(2)

        if status == "healthy":
            print(f"{GREEN}healthy{NC}")
        elif status == "unhealthy":
            print(f"{RED}unhealthy{NC}")
            all_healthy = False
        else:
            print(f"{YELLOW}timeout (status: {status}){NC}")
            all_healthy = False

    print()
    if all_healthy:
        print(f"{GREEN}All services deployed and healthy{NC}")
    else:
        log_warn(f"Some services not healthy — check: docker compose -f {COMPOSE_FILE} ps")
    return 0 if all_healthy else 1


run = run_cmd
