#include "RunnerRegistry_internal.hpp"

namespace pastebin {

void populateCoreRunners(std::map<std::string, RunnerSpec>& m) {
    m["python"] = makeRunnerSpec(
        "PYTHON_RUNNER_IMAGE", "python:3.11-slim", true,
        "cd /workspace && pip install -r requirements.txt -q "
        "2>/dev/null || true",
        "python -u /workspace/{entry}", "main.py");

    m["java-maven"] = makeRunnerSpec(
        "JAVA_MAVEN_RUNNER_IMAGE", "maven:3.9-eclipse-temurin-21", false, "",
        "cd /workspace && mvn -q compile exec:java -Dexec.mainClass={entry}",
        "Main");

    m["java-gradle"] = makeRunnerSpec(
        "JAVA_GRADLE_RUNNER_IMAGE", "gradle:8.6-jdk21", false, "",
        "cd /workspace && gradle -q run", "main");

    m["javascript"] = makeRunnerSpec(
        "NODE_RUNNER_IMAGE", "node:20-slim", false,
        "cd /workspace && ([ -f package.json ] && npm install --silent "
        "2>/dev/null || true)",
        "node /workspace/{entry}", "index.js");

    m["cpp-cmake"] = makeRunnerSpec(
        "CPP_RUNNER_IMAGE", "cpp-runner:latest", false, "",
        "cd /workspace && "
        "([ -f conanfile.txt ] && conan install . --output-folder=build "
        "--build=missing -s build_type=Release -q 2>/dev/null || true) && "
        "cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release "
        "-DCMAKE_CXX_FLAGS=\"-include cmath -include cstdlib\" "
        "$([ -f build/conan_toolchain.cmake ] && echo "
        "-DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake) && "
        "ninja -C build && ./build/{entry}",
        "app", "runners/Dockerfile.cpp");
}

} // namespace pastebin
