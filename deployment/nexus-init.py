#!/usr/bin/env python3
"""One-shot Nexus initialisation — runs inside the nexus-init container.

Creates Docker + npm repositories. Conan2 is handled by Artifactory CE.
"""

import os
import sys

import requests

NEXUS_URL = os.environ.get("NEXUS_URL", "http://nexus:8081")
NEW_PASS = os.environ.get("NEXUS_ADMIN_NEW_PASS", "nexus")
DOCKER_PORT = int(os.environ.get("DOCKER_REPO_PORT", "5000"))
PASS_FILE = "/nexus-data/admin.password"
API = f"{NEXUS_URL}/service/rest/v1"


def log(msg: str) -> None:
    print(f"[nexus-init] {msg}", flush=True)


def create_repo(repo_type: str, label: str, body: dict, auth: tuple) -> bool:
    r = requests.post(f"{API}/repositories/{repo_type}", json=body, auth=auth)
    if r.status_code == 201:
        log(f"{label} repo created")
        return True
    if r.status_code == 400:
        log(f"{label} repo already exists, skipping")
        return True
    log(f"ERROR: {label} repo creation returned HTTP {r.status_code}")
    return False


def main() -> int:
    auth = ("admin", NEW_PASS)

    # Resolve admin password (idempotent across multiple runs)
    r = requests.get(f"{API}/status", auth=auth)
    if r.status_code == 200:
        log(f"Already initialised with password '{NEW_PASS}'")
    elif os.path.exists(PASS_FILE):
        with open(PASS_FILE) as f:
            init_pass = f.read().strip()
        log("First run: changing admin password...")
        r = requests.put(f"{API}/security/users/admin/change-password",
                         auth=("admin", init_pass),
                         headers={"Content-Type": "text/plain"}, data=NEW_PASS)
        if r.status_code == 204:
            log(f"Admin password set to '{NEW_PASS}'")
        else:
            log(f"ERROR: password change returned HTTP {r.status_code}")
            return 1
    else:
        log("ERROR: cannot authenticate — is NEXUS_ADMIN_NEW_PASS correct?")
        return 1

    # Enable anonymous pull access
    requests.put(f"{API}/security/anonymous", json={
        "enabled": True, "userId": "anonymous", "realmName": "NexusAuthorizingRealm",
    }, auth=auth)
    log("Anonymous access enabled")

    # Enable Docker + npm Bearer Token realms
    requests.put(f"{API}/security/realms/active", auth=auth,
                 json=["NexusAuthenticatingRealm", "DockerToken", "NpmToken"])
    log("Docker + npm Bearer Token realms enabled")

    # Docker hosted repository
    if not create_repo("docker/hosted", "Docker 'local'", {
        "name": "local", "online": True,
        "storage": {"blobStoreName": "default", "strictContentTypeValidation": True,
                    "writePolicy": "allow"},
        "docker": {"v1Enabled": False, "forceBasicAuth": False, "httpPort": DOCKER_PORT},
    }, auth):
        return 1

    # npm hosted
    if not create_repo("npm/hosted", "npm-hosted", {
        "name": "npm-hosted", "online": True,
        "storage": {"blobStoreName": "default", "strictContentTypeValidation": True,
                    "writePolicy": "allow_once"},
    }, auth):
        return 1

    # npm proxy (caches npmjs.org)
    if not create_repo("npm/proxy", "npm-proxy", {
        "name": "npm-proxy", "online": True,
        "storage": {"blobStoreName": "default", "strictContentTypeValidation": True},
        "proxy": {"remoteUrl": "https://registry.npmjs.org",
                  "contentMaxAge": 1440, "metadataMaxAge": 1440},
        "httpClient": {"blocked": False, "autoBlock": True},
        "negativeCache": {"enabled": True, "timeToLive": 1440},
    }, auth):
        return 1

    # npm group (hosted wins, proxy fallback)
    if not create_repo("npm/group", "npm-group", {
        "name": "npm-group", "online": True,
        "storage": {"blobStoreName": "default", "strictContentTypeValidation": True},
        "group": {"memberNames": ["npm-hosted", "npm-proxy"]},
    }, auth):
        return 1

    log("")
    log("=" * 46)
    log("  Nexus ready!")
    log(f"  Registry : localhost:{DOCKER_PORT}")
    log(f"  Web UI   : http://localhost:8091")
    log(f"  Login    : admin / {NEW_PASS}")
    log("")
    log(f"  npm group URL: {NEXUS_URL}/repository/npm-group/")
    log(f"  npm hosted URL: {NEXUS_URL}/repository/npm-hosted/")
    log("")
    log("  Next steps:")
    log("    python3 deployment.py nexus push           (Docker images)")
    log("    Conan2 is on Artifactory CE (port 8092)")
    log("    python3 deployment.py npm publish-patches   (Patched npm packages)")
    log("=" * 46)
    return 0


if __name__ == "__main__":
    sys.exit(main())
