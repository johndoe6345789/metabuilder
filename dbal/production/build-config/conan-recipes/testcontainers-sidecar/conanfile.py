"""
Conan recipe for testcontainers-sidecar — Go binary that wraps testcontainers-go.
Source: dbal/testcontainers-sidecar/ in the MetaBuilder monorepo.

Build + upload (from repo root):
    deployment/build-testcontainers.sh

The recipe reads TESTCONTAINERS_SIDECAR_SRC env var to locate the Go source.
build-testcontainers.sh sets this automatically. When downloading the pre-built
package from Nexus, build() is never called — Conan downloads the binary artifact.
"""
from conan import ConanFile
from conan.tools.files import copy
from conan.errors import ConanInvalidConfiguration
import os
import shutil


class TestcontainersSidecarConan(ConanFile):
    name = "testcontainers-sidecar"
    version = "0.1.0"
    description = "Go sidecar that starts Docker containers via testcontainers-go for DBAL integration tests"
    license = "MIT"
    settings = "os", "compiler", "build_type", "arch"

    def package_id(self):
        # Go binary is not affected by C++ compiler or build_type; keep only os+arch.
        del self.info.settings.compiler
        del self.info.settings.build_type

    def validate(self):
        if not shutil.which("go"):
            raise ConanInvalidConfiguration(
                "Go 1.21+ is required to build testcontainers-sidecar. "
                "Install via https://go.dev/dl/ or 'brew install go'."
            )

    def build(self):
        src = os.environ.get("TESTCONTAINERS_SIDECAR_SRC", "")
        if not src:
            raise ConanInvalidConfiguration(
                "Set TESTCONTAINERS_SIDECAR_SRC to the absolute path of "
                "dbal/testcontainers-sidecar/ before running conan create. "
                "Use deployment/build-testcontainers.sh which sets this automatically."
            )
        if not os.path.isdir(src):
            raise ConanInvalidConfiguration(
                f"TESTCONTAINERS_SIDECAR_SRC={src!r} is not a directory"
            )

        binary = "testcontainers-sidecar"
        if str(self.settings.os) == "Windows":
            binary += ".exe"
        out = os.path.join(self.build_folder, binary)

        self.run("go mod tidy", cwd=src)
        self.run(f"go build -o {out} .", cwd=src)

    def package(self):
        binary = "testcontainers-sidecar"
        if str(self.settings.os) == "Windows":
            binary += ".exe"
        copy(self, binary,
             src=self.build_folder,
             dst=os.path.join(self.package_folder, "bin"))
        exe = os.path.join(self.package_folder, "bin", binary)
        if os.path.exists(exe):
            os.chmod(exe, 0o755)

    def package_info(self):
        binary = "testcontainers-sidecar"
        if str(self.settings.os) == "Windows":
            binary += ".exe"
        # Add bin/ to PATH so find_program(testcontainers-sidecar) works in CMake
        self.cpp_info.bindirs = ["bin"]
        # Also expose the absolute path via env var for CMake configure
        sidecar_path = os.path.join(self.package_folder, "bin", binary)
        self.buildenv_info.define_path("TESTCONTAINERS_SIDECAR_BIN", sidecar_path)
        self.runenv_info.define_path("TESTCONTAINERS_SIDECAR_BIN", sidecar_path)
