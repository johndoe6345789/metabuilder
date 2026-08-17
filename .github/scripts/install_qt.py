#!/usr/bin/env python3
"""Install a prebuilt Qt with aqtinstall, without depending on one server.

Every job in the Qt6 pipeline starts by downloading Qt, so this download is
the single most repeated external dependency in the build. Two things about it
are worth knowing, because both have already broken a run:

1.  download.qt.io fails intermittently. A failure there is not a build
    failure, but it looks exactly like one, and with five jobs per commit the
    odds of hitting it are five times what they look like. Qt publishes a
    mirror network for precisely this reason, so this script cycles through
    mirrors instead of retrying one host and giving up.

2.  Qt's repository layout is not uniform across hosts. For 6.11.1 the Windows
    x86_64 packages exist only as per-compiler repositories
    (.../qt6_6111/qt6_6111_msvc2022_64/), with no combined qt6_6111/qt6_6111/
    that `aqt list-qt --arch` reads -- so architecture *discovery* 404s for
    that host while the same version resolves fine for Linux, macOS and
    Windows ARM64. The error names Updates.xml and reads like a network
    problem, which is a good way to lose an afternoon. When aqt cannot list
    the architectures, this script reads them from the repository's own
    directory listing instead.

Usage:
    install_qt.py --ensure-aqt --host windows --version 6.11.1 \
                  --arch-pattern '^win64_msvc[0-9]+_64$' \
                  --outputdir Qt --modules qtshadertools qtimageformats
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# aqtinstall is pinned to a commit rather than taken from PyPI, and that is not
# caution -- it is the only version that can install what this pipeline needs.
# Qt changed the Windows desktop layout in 6.11.0: the packages now live in
# per-compiler repositories (qt6_6111/qt6_6111_msvc2022_64/) and the combined
# qt6_6111/qt6_6111/ that every earlier release had is simply gone. The last
# PyPI release, 3.3.0, only knows the old shape, so it requests a URL that no
# longer exists and fails with "Failed to download checksum for the file
# 'Updates.xml'" -- which reads like a network problem and is not one. Trying
# another mirror cannot help: no mirror has a folder Qt never published.
#
# Upstream fixed it in miurahr/aqtinstall#1000 but has not cut a release.
# Windows ARM64, Linux and macOS still use the combined layout, so only the
# Windows x86_64 job is affected -- which is a good way to spend an afternoon
# blaming a runner. Drop this pin for a plain version requirement once a
# release above 3.3.0 exists.
AQT_REQUIREMENT = (
    "aqtinstall @ git+https://github.com/miurahr/aqtinstall"
    "@16db45a70b5905ad596941b223469bc86a56901e"
)

# Ordered best-first: the official host, then mirrors confirmed to serve the
# qtsdkrepository tree. Geographically spread on purpose -- a mirror that is
# slow from a given runner still beats a mirror that is down, and a regional
# outage should not take the list with it.
MIRRORS = [
    "https://download.qt.io",
    "https://ftp.fau.de/qtproject",
    "https://ftp.acc.umu.se/mirror/qt.io/qtproject",
    "https://mirror.netcologne.de/qtproject",
    "https://qt.mirror.constant.com",
    "https://mirrors.ocf.berkeley.edu/qt",
    "https://ftp.jaist.ac.jp/pub/qtproject",
    "https://mirrors.aliyun.com/qt",
]

# aqt's host names are not the directory names in the repository.
HOST_DIRS = {
    "windows": "windows_x86",
    "windows_arm64": "windows_arm64",
    "linux": "linux_x64",
    "linux_arm64": "linux_arm64",
    "mac": "mac_x64",
}

# How a repository folder suffix becomes an aqt architecture name.
ARCH_PREFIXES = {
    "windows": "win64_",
    "windows_arm64": "win64_",
    "linux": "linux_",
    "linux_arm64": "linux_",
    "mac": "",
}


def log(message: str) -> None:
    print(message, flush=True)


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    log("$ " + " ".join(cmd))
    return subprocess.run(cmd, capture_output=True, text=True)


def aqt(*args: str) -> subprocess.CompletedProcess:
    return run([sys.executable, "-m", "aqt", *args])


def repo_url(mirror: str, host: str, version: str) -> str:
    """The directory holding every repository for one Qt version and host."""
    compact = version.replace(".", "")
    return f"{mirror}/online/qtsdkrepository/{HOST_DIRS[host]}/desktop/qt6_{compact}/"


def list_arches_from_repo(mirror: str, host: str, version: str) -> list[str]:
    """Read the architectures a mirror actually publishes.

    This is the primary source rather than a fallback, because `aqt list-qt`
    has no --base option: it always asks download.qt.io, so mirror failover
    would not cover discovery at all if discovery went through aqt.

    Two layouts have to be handled, and which one a version uses varies by
    host. Newer versions publish a repository per compiler
    ('qt6_6111_msvc2022_64'), readable straight from the directory listing.
    Older ones publish a single combined repository whose Updates.xml names
    the architectures ('qt.qt6.6111.linux_gcc_64').
    """
    base = repo_url(mirror, host, version)
    compact = version.replace(".", "")
    prefix = ARCH_PREFIXES[host]

    html = fetch(base)
    arches = []
    for folder in re.findall(rf'href="(qt6_{compact}_[^"/]+)/?"', html or ""):
        suffix = folder[len(f"qt6_{compact}_"):]
        arches.append(suffix if not prefix or suffix.startswith(prefix) else prefix + suffix)
    if arches:
        return sorted(set(arches))

    combined = fetch(f"{base}qt6_{compact}/Updates.xml")
    return sorted(set(re.findall(rf"<Name>qt\.qt6\.{compact}\.([a-z0-9_]+)</Name>", combined or "")))


def fetch(url: str) -> str | None:
    """GET a URL, returning None rather than raising: a mirror that does not
    answer is an ordinary event here, not an error worth aborting on."""
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return response.read().decode("utf-8", "replace")
    except (urllib.error.URLError, OSError) as exc:
        log(f"  could not read {url}: {exc}")
        return None


def resolve_arch(host: str, version: str, pattern: str, mirror: str) -> str | None:
    """Find the architecture matching the caller's pattern.

    The pattern is a regex rather than a literal because the MSVC year in Qt's
    Windows package names changes between releases: a hardcoded
    'win64_msvc2019_64' does not fail loudly on a Qt bump, it simply stops
    existing.
    """
    candidates = list_arches_from_repo(mirror, host, version)
    if not candidates:
        log("  repository listing gave nothing; asking aqt")
        result = aqt("list-qt", host, "desktop", "--arch", version)
        candidates = result.stdout.split() if result.returncode == 0 else []

    if candidates:
        log(f"  available: {' '.join(candidates)}")
    for arch in candidates:
        if re.search(pattern, arch):
            return arch
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", required=True, choices=sorted(HOST_DIRS))
    parser.add_argument("--version", required=True)
    parser.add_argument("--arch-pattern", required=True)
    parser.add_argument("--outputdir", required=True)
    parser.add_argument("--modules", nargs="*", default=[])
    parser.add_argument("--attempts-per-mirror", type=int, default=2)
    parser.add_argument(
        "--ensure-aqt",
        action="store_true",
        help="pip install the pinned aqtinstall before running",
    )
    args = parser.parse_args()

    if args.ensure_aqt:
        log(f"Installing {AQT_REQUIREMENT}")
        install = run([sys.executable, "-m", "pip", "install", "--upgrade", AQT_REQUIREMENT])
        if install.returncode != 0:
            log(install.stdout + install.stderr)
            log("::error::Could not install aqtinstall")
            return 1

    log(f"Qt {args.version} for {args.host} (arch matching {args.arch_pattern})")

    last_error = ""
    for mirror in MIRRORS:
        log(f"\n=== {mirror} ===")

        arch = resolve_arch(args.host, args.version, args.arch_pattern, mirror)
        if not arch:
            last_error = (
                f"no architecture matching {args.arch_pattern} for Qt "
                f"{args.version} on {args.host}"
            )
            log(f"  {last_error}")
            continue
        log(f"  architecture: {arch}")

        command = [
            "install-qt", args.host, "desktop", args.version, arch,
            "--outputdir", args.outputdir, "-b", mirror,
        ]
        if args.modules:
            command += ["--modules", *args.modules]

        for attempt in range(1, args.attempts_per_mirror + 1):
            result = aqt(*command)
            if result.returncode == 0:
                log(f"\nInstalled Qt {args.version} ({arch}) from {mirror}")
                _write_output("arch", arch)
                _write_output("mirror", mirror)
                return 0

            last_error = (result.stderr or result.stdout).strip().splitlines()[-1:]
            last_error = last_error[0] if last_error else "unknown error"
            log(f"  attempt {attempt} failed: {last_error}")
            if attempt < args.attempts_per_mirror:
                time.sleep(5 * attempt)

    log(f"::error::Could not install Qt {args.version} from any mirror. Last error: {last_error}")
    return 1


def _write_output(key: str, value: str) -> None:
    """Record what was used, so a log answers 'which mirror was that?'."""
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with Path(path).open("a", encoding="utf-8") as handle:
            handle.write(f"{key}={value}\n")


if __name__ == "__main__":
    raise SystemExit(main())
