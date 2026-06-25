"""Build testcontainers Conan packages (C shared library + Go sidecar) and upload to Nexus."""

import argparse
import os
import shutil
from cli.helpers import PROJECT_ROOT, log_err, log_info, log_ok, run as run_proc, run_check


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    nexus_url = os.environ.get("NEXUS_URL", "http://localhost:8091/repository/conan-hosted/")
    nexus_user = os.environ.get("NEXUS_USER", "admin")
    nexus_pass = os.environ.get("NEXUS_PASS", "nexus")
    recipes_dir = PROJECT_ROOT / "libraries" / "dbal" / "production" / "build-config" / "conan-recipes"

    log_info("Checking prerequisites...")
    for tool, install_msg in [("go", "https://go.dev/dl/"), ("conan", "pip install conan")]:
        if not shutil.which(tool):
            log_err(f"{tool} not found. Install: {install_msg}")
            return 1
        run_proc([tool, "version" if tool == "go" else "--version"])

    log_info("Configuring Nexus Conan remote...")
    run_proc(["conan", "remote", "add", "nexus", nexus_url, "--force"])
    run_check(["conan", "remote", "login", "nexus", nexus_user, "--password", nexus_pass])
    run_proc(["conan", "remote", "disable", "conancenter"])
    run_proc(["conan", "remote", "enable", "conancenter"])
    run_proc(["conan", "remote", "update", "nexus", "--index", "0"])

    if not args.skip_native:
        log_info("Building testcontainers-native/0.1.0 (C shared library)...")
        run_check(["conan", "create", str(recipes_dir / "testcontainers-native"),
                    "-s", "build_type=Release", "-s", "compiler.cppstd=20", "--build=missing"])
        log_info("Uploading testcontainers-native to Nexus...")
        run_check(["conan", "upload", "testcontainers-native/0.1.0", "--remote", "nexus", "--confirm"])
        log_ok("testcontainers-native uploaded")
    else:
        log_info("Skipping testcontainers-native (--skip-native)")

    if not args.skip_sidecar:
        sidecar_src = PROJECT_ROOT / "libraries" / "dbal" / "testcontainers-sidecar"
        log_info("Building testcontainers-sidecar/0.1.0 (Go binary)...")
        env = os.environ.copy()
        env["TESTCONTAINERS_SIDECAR_SRC"] = str(sidecar_src)
        run_check(["conan", "create", str(recipes_dir / "testcontainers-sidecar"),
                    "-s", "build_type=Release", "-s", "compiler.cppstd=20", "--build=missing"], env=env)
        log_info("Uploading testcontainers-sidecar to Nexus...")
        run_check(["conan", "upload", "testcontainers-sidecar/0.1.0", "--remote", "nexus", "--confirm"])
        log_ok("testcontainers-sidecar uploaded")
    else:
        log_info("Skipping testcontainers-sidecar (--skip-sidecar)")

    log_ok("Testcontainers build complete")
    return 0


def run(args, config):
    return run_cmd(args, config)
