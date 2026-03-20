#!/usr/bin/env python3
"""One-shot Artifactory CE initialisation — runs inside the artifactory-init container.

Creates Conan2 local + remote + virtual repositories via YAML config API.

NOTE: The JSON REST repository API (PUT /api/repositories/) requires Pro license.
Artifactory CE supports YAML config patching instead:
  PATCH /api/system/configuration  (Content-Type: application/yaml)
"""

import os
import sys
import time

import requests

ARTIFACTORY_URL = os.environ.get("ARTIFACTORY_URL", "http://artifactory:8081")
ADMIN_PASS = os.environ.get("ARTIFACTORY_ADMIN_PASS", "password")
API = f"{ARTIFACTORY_URL}/artifactory/api"

REPO_CONFIGS = [
    ("conan-local", """\
localRepositories:
  conan-local:
    key: conan-local
    type: conan
    packageType: conan
    description: "Local Conan2 repository for private packages"
    repoLayoutRef: conan-default
    handleReleases: true
    handleSnapshots: false"""),

    ("conan-remote", """\
remoteRepositories:
  conan-remote:
    key: conan-remote
    type: conan
    packageType: conan
    url: "https://center2.conan.io"
    description: "Proxy cache for Conan Center"
    repoLayoutRef: conan-default
    handleReleases: true
    handleSnapshots: false"""),

    ("generic-local", """\
localRepositories:
  generic-local:
    key: generic-local
    type: generic
    packageType: generic
    description: "Generic artifact storage"
    repoLayoutRef: simple-default
    handleReleases: true
    handleSnapshots: false"""),

    ("conan-virtual", """\
virtualRepositories:
  conan-virtual:
    key: conan-virtual
    type: conan
    packageType: conan
    description: "Virtual Conan2 repo - local packages + ConanCenter cache"
    repositories:
      - conan-local
      - conan-remote
    defaultDeploymentRepo: conan-local"""),
]


def log(msg: str) -> None:
    print(f"[artifactory-init] {msg}", flush=True)


def main() -> int:
    auth = ("admin", ADMIN_PASS)

    # Wait for Artifactory API to be ready
    log("Waiting for Artifactory API...")
    ready = False
    for _ in range(30):
        try:
            r = requests.get(f"{API}/system/ping", auth=auth, timeout=5)
            if r.status_code == 200:
                ready = True
                break
        except requests.ConnectionError:
            pass
        time.sleep(2)
    if not ready:
        log("ERROR: Artifactory API not ready after 60s")
        return 1
    log("Artifactory API is ready")

    # Check existing repos
    try:
        existing = requests.get(f"{API}/repositories", auth=auth, timeout=10).text
    except requests.RequestException:
        existing = "[]"

    for repo_name, yaml_body in REPO_CONFIGS:
        if f'"{repo_name}"' in existing:
            log(f"{repo_name} already exists, skipping")
            continue
        r = requests.patch(f"{API}/system/configuration", auth=auth,
                           headers={"Content-Type": "application/yaml"},
                           data=yaml_body, timeout=30)
        if r.status_code == 200:
            log(f"Create {repo_name} — {r.text.strip()}")
        else:
            log(f"ERROR: {repo_name} returned HTTP {r.status_code}: {r.text.strip()}")
            return 1

    # Verify repos are accessible
    log("Verifying repositories...")
    for repo_name in ["conan-local", "conan-remote", "conan-virtual", "generic-local"]:
        try:
            r = requests.get(f"{ARTIFACTORY_URL}/artifactory/{repo_name}/",
                             auth=auth, timeout=5)
            indicator = "ok" if r.status_code == 200 else f"WARN (HTTP {r.status_code})"
        except requests.RequestException:
            indicator = "WARN (unreachable)"
        log(f"  {indicator} {repo_name}")

    log("")
    log("=" * 38)
    log("  Artifactory CE ready!")
    log(f"  Web UI     : http://localhost:8092")
    log(f"  Login      : admin / {ADMIN_PASS}")
    log("")
    log("  Conan2 repos:")
    log(f"    Local   : {ARTIFACTORY_URL}/artifactory/api/conan/conan-local")
    log(f"    Remote  : {ARTIFACTORY_URL}/artifactory/api/conan/conan-remote")
    log(f"    Virtual : {ARTIFACTORY_URL}/artifactory/api/conan/conan-virtual")
    log("")
    log("  Conan client setup:")
    log("    conan remote add artifactory http://localhost:8092/artifactory/api/conan/conan-virtual")
    log(f"    conan remote login artifactory admin -p {ADMIN_PASS}")
    log("=" * 38)
    return 0


if __name__ == "__main__":
    sys.exit(main())
