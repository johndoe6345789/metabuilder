#include "InteractiveSession.hpp"
#include "DockerEngine.hpp"
#include "InteractivePreamble.hpp"
#include "RunCommand.hpp"
#include "UnixSocketAttach.hpp"
#include "../util.hpp"

namespace pastebin {

namespace {

ContainerConfig buildInteractiveConfig(const RunnerSpec& spec,
                                        const std::vector<std::string>& cmd,
                                        const std::vector<SourceFile>& files) {
    ContainerConfig cfg;
    cfg.image = runnerImage(spec);
    cfg.cmd = cmd;
    cfg.env = {makeContainerFilesEnv(files)};
    cfg.workingDir = "/workspace";
    cfg.networkDisabled = true;
    cfg.openStdin = true;
    cfg.memLimitBytes = 256LL * 1024 * 1024;
    cfg.nanoCpus = 500'000'000LL;
    cfg.pidsLimit = 256;
    return cfg;
}

} // namespace

void InteractiveSession::start(const RunnerSpec& spec,
                                const std::string& entryPoint,
                                const std::vector<SourceFile>& files) {
    const auto modifiedFiles = spec.interactive
        ? injectInteractivePreamble(files, entryPoint)
        : files;
    const auto cmd = buildRunCommand(spec, entryPoint, /*interactive=*/true,
                                      std::nullopt);

    containerId_ = dockerCreateContainer(
        buildInteractiveConfig(spec, cmd, modifiedFiles));
    dockerStartContainer(containerId_);

    const std::string socketPath =
        envOr("DOCKER_SOCKET", "/var/run/docker.sock");
    const std::string path = "/containers/" + containerId_ +
        "/attach?stream=1&stdin=1&stdout=1&stderr=1";
    fd_ = connectAndHijack(socketPath, path);

    reader_ = std::thread(&InteractiveSession::readLoop, this);
}

} // namespace pastebin
