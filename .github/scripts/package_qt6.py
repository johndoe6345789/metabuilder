#!/usr/bin/env python3
"""Turn a built Qt6 frontend into a redistributable archive.

One script for all five release targets, because the interesting part -- what
has to travel with the binary for it to start on a machine that has never seen
Qt -- is the same everywhere, and keeping it in one place is the only way the
platforms stay in step.

    Linux    tar.gz  binary + Qt libraries + plugins + QML modules + launcher
    Windows  zip     windeployqt output
    macOS    dmg     macdeployqt'd .app bundle, ad-hoc signed

The app is not fully self-contained by construction: packages/ and the
QmlComponents QML tree are read from disk at runtime (see
frontends/qt6/src/ResourceRoot.hpp). `cmake --install` places those, which is
why this script installs rather than copying the binary out of the build tree.

Usage:

    python3 .github/scripts/package_qt6.py \
        --build-dir frontends/qt6/_build \
        --source-dir frontends/qt6 \
        --qt-root /path/to/Qt/6.11.1/gcc_64 \
        --target linux-x86_64 \
        --version 0.1.42 \
        --output-dir dist

Prints the archive path, and appends `archive=<path>` to $GITHUB_OUTPUT when
running in Actions.
"""

from __future__ import annotations

import argparse
import os
import platform
import re
import shutil
import subprocess
import sys
import tarfile
import zipfile
from pathlib import Path

APP = "metabuilder-qt6"

# Deployed for the launch smoke test in CI, and for anyone running the app on a
# headless box. Tiny, and its absence is only discovered at the point where it
# is needed, which is always somewhere inconvenient.
OFFSCREEN_PLUGIN = {
    "linux": "libqoffscreen.so",
    "windows": "qoffscreen.dll",
    "macos": "libqoffscreen.dylib",
}

# Qt plugin categories a Quick app can need at runtime. Missing ones are
# skipped: which of these a given Qt build ships varies by platform.
LINUX_PLUGIN_DIRS = [
    "platforms",
    "platformthemes",
    "platforminputcontexts",
    "xcbglintegrations",
    "wayland-decoration-client",
    "wayland-graphics-integration-client",
    "wayland-shell-integration",
    "imageformats",
    "iconengines",
    "tls",
    "networkinformation",
    "egldeviceintegrations",
]


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    """Run a command, echoing it first so CI logs show what actually happened."""
    print("+ " + " ".join(str(c) for c in cmd), flush=True)
    return subprocess.run([str(c) for c in cmd], check=True, **kwargs)


def platform_of(target: str) -> str:
    """Map a release target name such as 'linux-arm64' to its platform."""
    for name in ("linux", "windows", "macos"):
        if target.startswith(name):
            return name
    raise SystemExit(f"unrecognised target: {target}")


def install_tree(build_dir: Path, stage: Path) -> None:
    """Run `cmake --install` into a clean staging directory.

    --config is passed unconditionally: multi-config generators (Visual Studio,
    which the Windows targets use because Ninja there needs a developer command
    prompt) install the Debug configuration without it, and single-config
    generators ignore it.
    """
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir(parents=True)
    run(["cmake", "--install", build_dir, "--prefix", stage, "--config", "Release"])


# ---------------------------------------------------------------------------
# Linux
# ---------------------------------------------------------------------------


def linux_shared_libs(binary: Path) -> list[Path]:
    """Resolve a binary's shared library dependencies via ldd.

    Only absolute paths are returned; the linker's own entries (linux-vdso,
    ld-linux) have no path and are filtered out by that alone.
    """
    out = subprocess.run(
        ["ldd", str(binary)], capture_output=True, text=True
    ).stdout
    libs = []
    for line in out.splitlines():
        match = re.search(r"=>\s+(/\S+)", line)
        if match:
            libs.append(Path(match.group(1)))
    return libs


def is_bundled(lib: Path, qt_root: Path) -> bool:
    """Whether a dependency should travel with the app.

    Qt's own libraries and the ICU build shipped alongside them: yes. The
    system's glibc, OpenGL, X11 and libstdc++: no. Bundling those is how a
    package starts fine on the machine that built it and then dies on a
    slightly different one -- the graphics stack in particular must come from
    the host, since it has to match the host's drivers.
    """
    try:
        resolved = lib.resolve()
    except OSError:
        return False
    if str(resolved).startswith(str(qt_root.resolve())):
        return True
    return resolved.name.startswith(("libicu",)) and "qt" in str(resolved).lower()


def copy_lib(lib: Path, dest_dir: Path) -> None:
    """Copy a library plus its SONAME symlink chain, dereferencing each link."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    real = lib.resolve()
    for name in {lib.name, real.name}:
        target = dest_dir / name
        if not target.exists():
            shutil.copy2(real, target)


def package_linux(
    stage: Path, qt_root: Path, source_dir: Path, payload: Path
) -> None:
    """Assemble a self-contained Linux tree.

    Qt ships no deployment tool for Linux (windeployqt and macdeployqt have no
    counterpart), so the closure is computed here: ldd the binary, ldd
    everything that gets copied in, repeat until nothing new appears. The
    plugins and QML module libraries matter as much as the binary -- they are
    dlopen'd, so they contribute dependencies that ldd on the binary alone
    never reveals.
    """
    lib_dir = payload / "lib"
    plugin_dir = payload / "plugins"
    qml_dir = payload / "qml"

    for item in stage.iterdir():
        shutil.move(str(item), str(payload / item.name))

    binary = payload / "bin" / APP
    if not binary.exists():
        raise SystemExit(f"expected the installed binary at {binary}")

    for name in LINUX_PLUGIN_DIRS:
        src = qt_root / "plugins" / name
        if src.is_dir():
            shutil.copytree(src, plugin_dir / name, dirs_exist_ok=True)

    # The whole QML module tree. Selecting a subset means running
    # qmlimportscanner over QML that is compiled into the binary's resources,
    # which reports the app's own modules and not much else; the tree is tens
    # of megabytes, and shipping all of it is cheaper than shipping a package
    # that fails on whichever module the scan missed.
    if (qt_root / "qml").is_dir():
        shutil.copytree(qt_root / "qml", qml_dir, dirs_exist_ok=True)

    pending = [binary]
    pending += [p for p in plugin_dir.rglob("*.so")]
    pending += [p for p in qml_dir.rglob("*.so")]
    seen: set[str] = set()
    while pending:
        current = pending.pop()
        for lib in linux_shared_libs(current):
            if lib.name in seen or not is_bundled(lib, qt_root):
                continue
            seen.add(lib.name)
            copy_lib(lib, lib_dir)
            pending.append(lib)

    # qt.conf tells Qt where plugins and QML modules live, relative to the
    # binary; without it Qt looks at the absolute paths its build was
    # configured with, which are the CI runner's.
    (payload / "bin" / "qt.conf").write_text(
        "[Paths]\nPrefix = ..\nPlugins = plugins\nQml2Imports = qml\n",
        encoding="utf-8",
    )

    # The launcher exists for LD_LIBRARY_PATH, which qt.conf cannot set: the
    # dynamic linker resolves the Qt libraries before any Qt code runs.
    launcher = payload / APP
    launcher.write_text(
        "#!/bin/sh\n"
        '# Resolve the real directory of this script, symlinks included, so the\n'
        '# app still starts when launched through a link in ~/.local/bin.\n'
        'self=$0\n'
        'while [ -L "$self" ]; do\n'
        '    link=$(readlink "$self")\n'
        '    case $link in\n'
        '        /*) self=$link ;;\n'
        '        *)  self=$(dirname "$self")/$link ;;\n'
        '    esac\n'
        'done\n'
        'here=$(cd "$(dirname "$self")" && pwd)\n'
        'export LD_LIBRARY_PATH="$here/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"\n'
        'exec "$here/bin/' + APP + '" "$@"\n',
        encoding="utf-8",
    )
    launcher.chmod(0o755)


# ---------------------------------------------------------------------------
# Windows
# ---------------------------------------------------------------------------


def package_windows(
    stage: Path, qt_root: Path, source_dir: Path, payload: Path
) -> None:
    """Assemble a Windows tree with windeployqt."""
    for item in stage.iterdir():
        shutil.move(str(item), str(payload / item.name))

    binary = payload / "bin" / f"{APP}.exe"
    if not binary.exists():
        raise SystemExit(f"expected the installed binary at {binary}")

    run(
        [
            qt_root / "bin" / "windeployqt.exe",
            "--release",
            "--no-translations",
            "--no-system-d3d-compiler",
            f"--qmldir={source_dir}",
            binary,
        ]
    )


# ---------------------------------------------------------------------------
# macOS
# ---------------------------------------------------------------------------


def package_macos(
    stage: Path, qt_root: Path, source_dir: Path, payload: Path
) -> None:
    """Deploy Qt into the .app bundle and ad-hoc sign it.

    The signature is required, not cosmetic: macOS refuses to run an unsigned
    or modified arm64 binary at all, and macdeployqt invalidates the linker's
    original signature as soon as it rewrites the library paths. Ad-hoc
    signing is the most that can be done without an Apple Developer ID -- users
    still meet Gatekeeper on first launch, which the release notes explain.
    """
    app = stage / f"{APP}.app"
    if not app.is_dir():
        raise SystemExit(f"expected an app bundle at {app}")

    run([qt_root / "bin" / "macdeployqt", app, f"-qmldir={source_dir}"])

    plugins = app / "Contents" / "PlugIns" / "platforms"
    offscreen = qt_root / "plugins" / "platforms" / OFFSCREEN_PLUGIN["macos"]
    if offscreen.exists() and plugins.is_dir():
        shutil.copy2(offscreen, plugins / offscreen.name)

    run(["codesign", "--force", "--deep", "--sign", "-", app])

    shutil.move(str(app), str(payload / app.name))
    # A drag-to-install target, so the .dmg behaves the way every other macOS
    # download does.
    os.symlink("/Applications", payload / "Applications")


# ---------------------------------------------------------------------------
# archives
# ---------------------------------------------------------------------------


def make_targz(payload: Path, archive: Path) -> None:
    with tarfile.open(archive, "w:gz") as tar:
        tar.add(payload, arcname=payload.name)


def make_zip(payload: Path, archive: Path) -> None:
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(payload.rglob("*")):
            if path.is_file() or path.is_symlink():
                zf.write(path, Path(payload.name) / path.relative_to(payload))


def make_dmg(payload: Path, archive: Path, volume: str) -> None:
    run(
        [
            "hdiutil",
            "create",
            "-volname",
            volume,
            "-srcfolder",
            payload,
            "-ov",
            "-format",
            "UDZO",
            archive,
        ]
    )


README = """MetaBuilder Qt6 desktop app {version} ({target})

Run it
------
{run_hint}

The app talks to a DBAL server. By default it uses:

    http://localhost:8080
Note that this build is not signed with a paid platform certificate, so your
operating system will warn you the first time you open it.
{platform_note}
"""

RUN_HINTS = {
    "linux": "    ./metabuilder-qt6",
    "windows": "    bin\\metabuilder-qt6.exe",
    "macos": "    Drag metabuilder-qt6.app into Applications, then open it.",
}

PLATFORM_NOTES = {
    "linux": (
        "\nThis archive carries its own copy of Qt; the graphics drivers and\n"
        "core system libraries come from your machine. On a minimal system you\n"
        "may need the usual X11/OpenGL runtime packages.\n"
    ),
    "windows": (
        "\nSmartScreen will offer 'More info' -> 'Run anyway' on first launch.\n"
    ),
    "macos": (
        "\nmacOS will say the app cannot be checked for malicious software.\n"
        "Right-click the app and choose Open, then confirm -- once per install.\n"
        "Or clear the download flag: xattr -dr com.apple.quarantine "
        "/Applications/metabuilder-qt6.app\n"
    ),
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--build-dir", required=True, type=Path)
    parser.add_argument("--source-dir", required=True, type=Path)
    parser.add_argument("--qt-root", required=True, type=Path)
    parser.add_argument(
        "--target",
        required=True,
        help="Release target, e.g. linux-x86_64, windows-arm64, macos-universal",
    )
    parser.add_argument("--version", required=True)
    parser.add_argument("--output-dir", default="dist", type=Path)
    args = parser.parse_args()

    system = platform_of(args.target)
    if system != {"Linux": "linux", "Windows": "windows", "Darwin": "macos"}[
        platform.system()
    ]:
        raise SystemExit(
            f"target {args.target} cannot be packaged on {platform.system()}"
        )

    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    stage = output_dir / "_install"
    name = f"{APP}-{args.version}-{args.target}"
    payload = output_dir / name
    if payload.exists():
        shutil.rmtree(payload)
    payload.mkdir(parents=True)

    install_tree(args.build_dir.resolve(), stage)

    qt_root = args.qt_root.resolve()
    source_dir = args.source_dir.resolve()
    if system == "linux":
        package_linux(stage, qt_root, source_dir, payload)
    elif system == "windows":
        package_windows(stage, qt_root, source_dir, payload)
    else:
        package_macos(stage, qt_root, source_dir, payload)

    # The offscreen plugin, for the CI launch check and headless use. macOS
    # already had it copied into the bundle above.
    if system in ("linux", "windows"):
        plugin = OFFSCREEN_PLUGIN[system]
        src = qt_root / "plugins" / "platforms" / plugin
        dest_dir = (
            payload / "plugins" / "platforms"
            if system == "linux"
            else payload / "bin" / "platforms"
        )
        if src.exists():
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest_dir / plugin)

    (payload / "README.txt").write_text(
        README.format(
            version=args.version,
            target=args.target,
            run_hint=RUN_HINTS[system],
            platform_note=PLATFORM_NOTES[system],
        ),
        encoding="utf-8",
    )

    if system == "linux":
        archive = output_dir / f"{name}.tar.gz"
        make_targz(payload, archive)
    elif system == "windows":
        archive = output_dir / f"{name}.zip"
        make_zip(payload, archive)
    else:
        archive = output_dir / f"{name}.dmg"
        make_dmg(payload, archive, f"MetaBuilder {args.version}")

    shutil.rmtree(stage, ignore_errors=True)

    size_mb = archive.stat().st_size / (1024 * 1024)
    print(f"packaged {archive} ({size_mb:.1f} MB)")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as handle:
            handle.write(f"archive={archive}\n")
            handle.write(f"payload={payload}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
