"""
Conan recipe for testcontainers-native — C bindings for testcontainers-go.
https://github.com/testcontainers/testcontainers-native

Requires Go 1.19+ at build time (go build -buildmode=c-shared).
Produces: libtestcontainers-c.{so,dylib} + testcontainers-c.h

Upload to Nexus after building:
    conan create . -s build_type=Release -s compiler.cppstd=20
    conan upload testcontainers-native/0.1.0 --remote nexus -c
"""
from conan import ConanFile
from conan.tools.cmake import CMake, cmake_layout
from conan.tools.files import get, copy
from conan.errors import ConanInvalidConfiguration
import os
import shutil


class TestcontainersNativeConan(ConanFile):
    name = "testcontainers-native"
    version = "0.1.0"
    url = "https://github.com/testcontainers/testcontainers-native"
    license = "Apache-2.0"
    description = "C shared library for spinning up Docker containers in tests (wraps testcontainers-go)"
    settings = "os", "compiler", "build_type", "arch"

    # Shared-only: Go produces a shared library, not a static one
    options  = {"fPIC": [True, False]}
    default_options = {"fPIC": True}

    def validate(self):
        if not shutil.which("go"):
            raise ConanInvalidConfiguration(
                "Go 1.19+ is required to build testcontainers-native. "
                "Install via https://go.dev/dl/ or 'brew install go'."
            )

    def source(self):
        get(
            self,
            f"https://github.com/testcontainers/testcontainers-native/archive/refs/tags/v{self.version}.tar.gz",
            strip_root=True,
        )

    def layout(self):
        cmake_layout(self)

    def build(self):
        cmake = CMake(self)
        cmake.configure()
        cmake.build()

    def package(self):
        # Header — may be at root or core/ depending on version
        for hdr_src in [self.source_folder,
                        os.path.join(self.source_folder, "core"),
                        os.path.join(self.source_folder, "testcontainers-c")]:
            copy(self, "testcontainers-c.h",
                 src=hdr_src,
                 dst=os.path.join(self.package_folder, "include"),
                 keep_path=False)

        # Shared library
        ext = {"Linux": "*.so*", "Macos": "*.dylib", "Windows": "*.dll"}.get(
            str(self.settings.os), "*.so*"
        )
        copy(self, ext,
             src=self.build_folder,
             dst=os.path.join(self.package_folder, "lib"),
             keep_path=False)
        if self.settings.os == "Windows":
            copy(self, "*.lib",
                 src=self.build_folder,
                 dst=os.path.join(self.package_folder, "lib"),
                 keep_path=False)

    def package_info(self):
        self.cpp_info.libs = ["testcontainers-c"]
        self.cpp_info.set_property("cmake_file_name",   "testcontainersnative")
        self.cpp_info.set_property("cmake_target_name", "testcontainersnative::testcontainersnative")
