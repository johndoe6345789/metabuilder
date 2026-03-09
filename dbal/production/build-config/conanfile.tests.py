from conan import ConanFile
from conan.tools.cmake import cmake_layout


class DBALTestsConan(ConanFile):
    """
    Minimal Conan recipe for building DBAL unit and integration tests locally.

    Excludes daemon-only deps (Drogon, cpr, mongo-cxx-driver, Boost) that are
    not needed by tests and fail to build from source on some platforms (e.g.
    mongo-c-driver on macOS ARM64).

    Usage (unit tests only — no system DB client libs required):
        mkdir _build && cd _build
        conan install ../build-config/conanfile.tests.py --output-folder=. --build=missing \\
            -s build_type=Debug -s compiler.cppstd=20
        cmake .. -DBUILD_DAEMON=OFF -DBUILD_TESTING=ON \\
            -DCMAKE_TOOLCHAIN_FILE=./conan_toolchain.cmake
        cmake --build . --target dbal_unit_tests --parallel
        ctest -R dbal_unit_tests --output-on-failure

    Usage (integration tests — containers managed automatically by testcontainers-sidecar):
        # Prerequisites: Nexus running with testcontainers-sidecar uploaded
        #   docker compose -f deployment/docker-compose.nexus.yml up -d
        #   ./deployment/nexus-init.sh && ./deployment/build-testcontainers.sh
        #   conan remote add nexus http://localhost:8091/repository/conan-group/ --force
        #   conan remote login nexus admin --password nexus
        #   brew install postgresql@16 mysql-client   (for adapter headers)
        conan install ../build-config/conanfile.tests.py --output-folder=. --build=missing \\
            --remote nexus -s build_type=Debug -s compiler.cppstd=20
        cmake .. -DBUILD_DAEMON=OFF -DBUILD_INTEGRATION_TESTS=ON \\
            -DCMAKE_TOOLCHAIN_FILE=./conan_toolchain.cmake -G Ninja
        cmake --build . --target dbal_integration_tests --parallel
        ctest -R dbal_integration_tests --output-on-failure -V
    """
    settings = "os", "compiler", "build_type", "arch"
    generators = "CMakeDeps", "CMakeToolchain"

    def requirements(self):
        self.requires("sqlite3/3.46.0")
        self.requires("fmt/12.0.0")
        self.requires("spdlog/1.16.0")
        self.requires("nlohmann_json/3.11.3")
        self.requires("inja/3.5.0")
        self.requires("gtest/1.14.0")
        # Sidecar binary: auto-starts Postgres/MySQL Docker containers for integration tests.
        # Must be available in a Nexus remote (not in Conan Center).
        # Run: ./deployment/build-testcontainers.sh to build + upload.
        self.requires("testcontainers-sidecar/0.1.0")

    def configure(self):
        self.options["sqlite3"].shared = False

    def layout(self):
        cmake_layout(self)
