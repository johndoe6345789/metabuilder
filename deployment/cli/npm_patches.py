"""Publish patched npm packages to a local registry (Nexus or Verdaccio)."""

import argparse
import base64
import os
import subprocess
import tempfile
from pathlib import Path
from cli.helpers import (
    SCRIPT_DIR, GREEN, NC,
    curl_status, log_err, log_info, log_ok, log_warn, run,
)


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    nexus_url = os.environ.get("NEXUS_URL", "http://localhost:8091")
    nexus_user = os.environ.get("NEXUS_USER", "admin")
    nexus_pass = os.environ.get("NEXUS_PASS", "nexus")
    verdaccio_url = os.environ.get("VERDACCIO_URL", "http://localhost:4873")

    use_nexus = args.nexus
    use_verdaccio = args.verdaccio

    # Auto-detect
    if not use_nexus and not use_verdaccio:
        if curl_status(f"{nexus_url}/service/rest/v1/status", f"{nexus_user}:{nexus_pass}") == 200:
            use_nexus = True
        else:
            use_verdaccio = True

    patches_def = config["definitions"]["npm_patches"]
    patches_dir = SCRIPT_DIR / "npm-patches"

    with tempfile.TemporaryDirectory() as work_dir:
        npmrc_path = Path(work_dir) / ".npmrc"

        if use_nexus:
            npm_hosted = f"{nexus_url}/repository/npm-hosted/"
            log_info(f"Using Nexus at {nexus_url}...")
            http = curl_status(f"{nexus_url}/service/rest/v1/status", f"{nexus_user}:{nexus_pass}")
            if http != 200:
                log_err(f"Cannot reach Nexus (HTTP {http}). Is it running?")
                return 1
            nexus_auth = base64.b64encode(f"{nexus_user}:{nexus_pass}".encode()).decode()
            host_part = npm_hosted.split("://", 1)[1]
            npmrc_path.write_text(f"//{host_part}:_auth={nexus_auth}\n")
            publish_args = ["--userconfig", str(npmrc_path)]
        else:
            log_info(f"Using Verdaccio at {verdaccio_url}...")
            http = curl_status(f"{verdaccio_url}/-/ping")
            if http != 200:
                log_err(f"Cannot reach Verdaccio (HTTP {http}). Start with: npx verdaccio --config deployment/verdaccio.yaml")
                return 1
            host_part = verdaccio_url.split("://", 1)[1]
            npmrc_path.write_text(f"registry={verdaccio_url}/\n//{host_part}/:_authToken=\n")
            publish_args = ["--registry", verdaccio_url, "--userconfig", str(npmrc_path)]

        published = skipped = 0

        # Local patches
        for patch in patches_def["local"]:
            pkg_name = patch["name"]
            pkg_version = patch["version"]
            tarball_name = patch["tarball"]
            log_info(f"Processing local patch {pkg_name}@{pkg_version}...")
            tarball = patches_dir / tarball_name
            if not tarball.exists():
                log_err(f"Patched tarball not found: {tarball}")
                return 1
            result = run(["npm", "publish", str(tarball), *publish_args, "--tag", "patched"])
            if result.returncode == 0:
                log_ok(f"Published {pkg_name}@{pkg_version}")
                published += 1
            else:
                log_warn(f"{pkg_name}@{pkg_version} already exists or publish failed, skipping")
                skipped += 1

        # Registry patches
        for pkg_spec in patches_def["registry"]:
            pkg_name, pkg_version = pkg_spec.rsplit("@", 1)
            log_info(f"Processing {pkg_name}@{pkg_version}...")

            result = subprocess.run(
                ["npm", "pack", pkg_spec],
                capture_output=True, text=True, cwd=work_dir,
            )
            if result.returncode != 0:
                log_err(f"Failed to download {pkg_spec}")
                return 1
            tarball = result.stdout.strip().split("\n")[-1]
            tarball_path = Path(work_dir) / tarball

            result = run(["npm", "publish", str(tarball_path), *publish_args, "--tag", "patched"])
            if result.returncode == 0:
                log_ok(f"Published {pkg_name}@{pkg_version}")
                published += 1
            else:
                log_warn(f"{pkg_name}@{pkg_version} already exists or publish failed, skipping")
                skipped += 1

            tarball_path.unlink(missing_ok=True)

    print(f"\n{GREEN}Done. published={published}  skipped={skipped}{NC}")
    if use_nexus:
        print(f"Nexus npm-group: {nexus_url}/repository/npm-group/")
    else:
        print(f"Verdaccio registry: {verdaccio_url}")
    return 0


run = run_cmd
