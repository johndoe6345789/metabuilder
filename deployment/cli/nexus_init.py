"""Initialize Nexus repositories (Docker + npm, or npm-only for CI)."""

import argparse
import json
import os
import subprocess
from cli.helpers import curl_status, log_err, run as run_proc


def run_cmd(args: argparse.Namespace, config: dict) -> int:
    nexus_url = os.environ.get("NEXUS_URL", "http://localhost:8091" if args.ci else "http://nexus:8081")
    new_pass = os.environ.get("NEXUS_ADMIN_NEW_PASS", "nexus")
    docker_port = os.environ.get("DOCKER_REPO_PORT", "5000")
    pass_file = "/tmp/nexus-data/admin.password" if args.ci else "/nexus-data/admin.password"
    prefix = "nexus-ci-init" if args.ci else "nexus-init"

    def nlog(msg: str) -> None:
        print(f"[{prefix}] {msg}")

    auth = f"admin:{new_pass}"

    # Resolve admin password
    status = curl_status(f"{nexus_url}/service/rest/v1/status", auth)
    if status == 200:
        nlog(f"Already initialised with password '{new_pass}'")
    elif os.path.exists(pass_file):
        with open(pass_file) as f:
            init_pass = f.read().strip()
        nlog("First run: changing admin password...")
        result = subprocess.run([
            "curl", "-s", "-o", os.devnull, "-w", "%{http_code}", "-X", "PUT",
            f"{nexus_url}/service/rest/v1/security/users/admin/change-password",
            "-u", f"admin:{init_pass}", "-H", "Content-Type: text/plain", "-d", new_pass,
        ], capture_output=True, text=True)
        if result.stdout.strip() == "204":
            nlog(f"Admin password set to '{new_pass}'")
        else:
            nlog(f"ERROR: password change returned HTTP {result.stdout.strip()}")
            return 1
    else:
        nlog("ERROR: cannot authenticate — is NEXUS_ADMIN_NEW_PASS correct?")
        return 1

    # Enable anonymous access
    run_proc(["curl", "-sf", "-X", "PUT", f"{nexus_url}/service/rest/v1/security/anonymous",
              "-u", auth, "-H", "Content-Type: application/json",
              "-d", '{"enabled":true,"userId":"anonymous","realmName":"NexusAuthorizingRealm"}'])
    nlog("Anonymous access enabled")

    if not args.ci:
        # Docker + npm token realms
        run_proc(["curl", "-sf", "-X", "PUT", f"{nexus_url}/service/rest/v1/security/realms/active",
                  "-u", auth, "-H", "Content-Type: application/json",
                  "-d", '["NexusAuthenticatingRealm","DockerToken","NpmToken"]'])
        nlog("Docker + npm Bearer Token realms enabled")

        # Docker hosted repo
        docker_repo = json.dumps({
            "name": "local", "online": True,
            "storage": {"blobStoreName": "default", "strictContentTypeValidation": True, "writePolicy": "allow"},
            "docker": {"v1Enabled": False, "forceBasicAuth": False, "httpPort": int(docker_port)},
        })
        result = subprocess.run([
            "curl", "-s", "-o", os.devnull, "-w", "%{http_code}", "-X", "POST",
            f"{nexus_url}/service/rest/v1/repositories/docker/hosted",
            "-u", auth, "-H", "Content-Type: application/json", "-d", docker_repo,
        ], capture_output=True, text=True)
        code = result.stdout.strip()
        if code == "201":
            nlog(f"Docker hosted repo 'local' created on port {docker_port}")
        elif code == "400":
            nlog("Docker repo 'local' already exists, skipping")
        else:
            nlog(f"ERROR: Docker repo creation returned HTTP {code}")
            return 1
    else:
        # CI: npm token realm only
        run_proc(["curl", "-sf", "-X", "PUT", f"{nexus_url}/service/rest/v1/security/realms/active",
                  "-u", auth, "-H", "Content-Type: application/json",
                  "-d", '["NexusAuthenticatingRealm","NpmToken"]'])

    # npm repos (hosted, proxy, group)
    npm_repos = [
        ("npm/hosted", "npm-hosted", {
            "name": "npm-hosted", "online": True,
            "storage": {"blobStoreName": "default", "strictContentTypeValidation": True,
                        "writePolicy": "allow" if args.ci else "allow_once"},
        }),
        ("npm/proxy", "npm-proxy", {
            "name": "npm-proxy", "online": True,
            "storage": {"blobStoreName": "default", "strictContentTypeValidation": True},
            "proxy": {"remoteUrl": "https://registry.npmjs.org", "contentMaxAge": 1440, "metadataMaxAge": 1440},
            "httpClient": {"blocked": False, "autoBlock": True},
            "negativeCache": {"enabled": True, "timeToLive": 1440},
        }),
        ("npm/group", "npm-group", {
            "name": "npm-group", "online": True,
            "storage": {"blobStoreName": "default", "strictContentTypeValidation": True},
            "group": {"memberNames": ["npm-hosted", "npm-proxy"]},
        }),
    ]

    for repo_type, label, body in npm_repos:
        result = subprocess.run([
            "curl", "-s", "-o", os.devnull, "-w", "%{http_code}", "-X", "POST",
            f"{nexus_url}/service/rest/v1/repositories/{repo_type}",
            "-u", auth, "-H", "Content-Type: application/json", "-d", json.dumps(body),
        ], capture_output=True, text=True)
        code = result.stdout.strip()
        if code == "201":
            nlog(f"{label} repo created")
        elif code == "400":
            nlog(f"{label} repo already exists, skipping")
        else:
            nlog(f"ERROR creating {label}: HTTP {code}")
            return 1

    if args.ci:
        nlog("Nexus CI init complete")
    else:
        nlog("")
        nlog("=" * 46)
        nlog("  Nexus ready!")
        nlog(f"  Registry : localhost:{docker_port}")
        nlog(f"  Web UI   : http://localhost:8091")
        nlog(f"  Login    : admin / {new_pass}")
        nlog(f"  npm group: {nexus_url}/repository/npm-group/")
        nlog("=" * 46)

    return 0


def run(args, config):
    return run_cmd(args, config)
