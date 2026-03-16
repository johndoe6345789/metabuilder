"""Initialize Artifactory CE Conan2 local + remote + virtual repositories."""

import argparse
import os
import subprocess
import time
from cli.helpers import curl_status, run as run_proc


REPO_CONFIGS = [
    ("conan-local", """localRepositories:
  conan-local:
    key: conan-local
    type: conan
    packageType: conan
    description: "Local Conan2 repository for private packages"
    repoLayoutRef: conan-default
    handleReleases: true
    handleSnapshots: false"""),

    ("conan-remote", """remoteRepositories:
  conan-remote:
    key: conan-remote
    type: conan
    packageType: conan
    url: "https://center2.conan.io"
    description: "Proxy cache for Conan Center"
    repoLayoutRef: conan-default
    handleReleases: true
    handleSnapshots: false"""),

    ("generic-local", """localRepositories:
  generic-local:
    key: generic-local
    type: generic
    packageType: generic
    description: "Generic artifact storage"
    repoLayoutRef: simple-default
    handleReleases: true
    handleSnapshots: false"""),

    ("conan-virtual", """virtualRepositories:
  conan-virtual:
    key: conan-virtual
    type: conan
    packageType: conan
    description: "Virtual Conan2 repo — local packages + ConanCenter cache"
    repositories:
      - conan-local
      - conan-remote
    defaultDeploymentRepo: conan-local"""),
]


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    art_url = os.environ.get("ARTIFACTORY_URL", "http://artifactory:8081")
    admin_pass = os.environ.get("ARTIFACTORY_ADMIN_PASS", "password")
    auth = f"admin:{admin_pass}"
    api = f"{art_url}/artifactory/api"

    def alog(msg: str) -> None:
        print(f"[artifactory-init] {msg}")

    alog("Waiting for Artifactory API...")
    ready = False
    for _ in range(30):
        if curl_status(f"{api}/system/ping", auth) == 200:
            ready = True
            break
        time.sleep(2)
    if not ready:
        alog("ERROR: Artifactory API not ready after 60s")
        return 1
    alog("Artifactory API is ready")

    # Check existing repos
    result = subprocess.run(
        ["curl", "-sf", "-u", auth, f"{api}/repositories"],
        capture_output=True, text=True,
    )
    existing = result.stdout if result.returncode == 0 else "[]"

    for repo_name, yaml_body in REPO_CONFIGS:
        if f'"{repo_name}"' in existing:
            alog(f"{repo_name} already exists, skipping")
            continue
        result = subprocess.run([
            "curl", "-s", "-w", "\n%{http_code}", "-X", "PATCH",
            f"{api}/system/configuration",
            "-u", auth, "-H", "Content-Type: application/yaml", "-d", yaml_body,
        ], capture_output=True, text=True)
        lines = result.stdout.strip().split("\n")
        code = lines[-1] if lines else "0"
        body = "\n".join(lines[:-1])
        if code == "200":
            alog(f"Created {repo_name} — {body}")
        else:
            alog(f"ERROR: {repo_name} returned HTTP {code}: {body}")
            return 1

    # Verify
    alog("Verifying repositories...")
    for repo_name in ["conan-local", "conan-remote", "conan-virtual", "generic-local"]:
        status = curl_status(f"{art_url}/artifactory/{repo_name}/", auth)
        alog(f"  {'ok' if status == 200 else f'WARN (HTTP {status})'} {repo_name}")

    alog("")
    alog("=" * 38)
    alog("  Artifactory CE ready!")
    alog(f"  Web UI     : http://localhost:8092")
    alog(f"  Login      : admin / {admin_pass}")
    alog(f"  Conan virtual : {art_url}/artifactory/api/conan/conan-virtual")
    alog("=" * 38)
    return 0


def run(args, config):
    return run_cmd(args, config)
