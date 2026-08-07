#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace dockerterminal {

struct ContainerInfo {
    std::string id;    // short (12-char) id
    std::string name;
    std::string image;
    std::string status; // "running", "exited", etc.
    int64_t createdEpochSeconds = 0;
};

struct RunResult {
    std::string output;
    int exitCode = 0;
};

/// Talks to the Docker Engine API over its Unix domain socket -- the same
/// API the Python `docker` SDK wraps. Throws std::runtime_error on failure.
class DockerClient {
  public:
    explicit DockerClient(std::string socketPath = "/var/run/docker.sock");

    std::vector<ContainerInfo> listContainers();

    /// Runs `shellLine` inside `containerId` via the Docker exec API
    /// (create + start + inspect-for-exit-code) and returns its combined
    /// TTY output and exit code.
    RunResult runInContainer(const std::string& containerId,
                              const std::string& shellLine);

  private:
    std::string socketPath_;
};

} // namespace dockerterminal
