from conan import ConanFile
from conan.tools.cmake import cmake_layout

class DBALDaemonConan(ConanFile):
    settings = "os", "compiler", "build_type", "arch"
    generators = "CMakeDeps", "CMakeToolchain"

    def requirements(self):
        self.requires("sqlite3/3.46.0")
        self.requires("fmt/12.0.0")
        self.requires("spdlog/1.16.0")
        self.requires("nlohmann_json/3.11.3")
        self.requires("drogon/1.9.7")
        self.requires("cpr/1.14.1")
        self.requires("inja/3.5.0")
        self.requires("mongo-cxx-driver/3.10.2")
        self.requires("boost/1.83.0", override=True)
        self.requires("gtest/1.14.0")

    def configure(self):
        self.options["sqlite3"].shared = False

    def layout(self):
        cmake_layout(self)
