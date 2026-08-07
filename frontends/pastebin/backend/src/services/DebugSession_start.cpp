#include "DebugSession.hpp"
#include "DebugRunnerRegistry.hpp"
#include "DockerEngine.hpp"
#include "DockerImage.hpp"
#include "DockerInspect.hpp"
#include "DockerNetwork.hpp"
#include "OwnContainerId.hpp"
#include "RunCommand.hpp"
#include "TcpConnect.hpp"

#include <stdexcept>

namespace pastebin {

namespace {

constexpr int kDapPort = 5678;

std::string buildDapShellCommand(const DebugRunnerSpec& spec,
                                  const std::string& entryPoint) {
    std::string cmd = fileWriterShellSnippet();
    if (!spec.setupCmd.empty())
        cmd += " && ( " + spec.setupCmd + " || true )";
    cmd += " && " + renderDapCommand(spec, kDapPort, entryPoint);
    return cmd;
}

} // namespace

void DebugSession::start(const std::string& language,
                          const std::string& entryPoint,
                          const std::vector<SourceFile>& files) {
    const auto spec = findDebugRunner(language);
    if (!spec)
        throw std::runtime_error("Unsupported debug language: " + language);

    const std::string netName = "dap-" + sessionId_.substr(0, 8);
    networkId_ = dockerCreateNetwork(netName);
    if (const auto ownId = ownContainerId())
        dockerConnectNetwork(networkId_, *ownId);

    dockerEnsureImage(debugRunnerImage(*spec));

    ContainerConfig cfg;
    cfg.image = debugRunnerImage(*spec);
    cfg.cmd = {"sh", "-c", buildDapShellCommand(*spec, entryPoint)};
    cfg.env = {makeContainerFilesEnv(files)};
    cfg.workingDir = "/workspace";
    cfg.networkName = netName;
    cfg.memLimitBytes = 512LL * 1024 * 1024;
    cfg.nanoCpus = 1'000'000'000LL;
    cfg.pidsLimit = 512;

    containerId_ = dockerCreateContainer(cfg);
    dockerStartContainer(containerId_);

    const auto ip = dockerContainerNetworkIp(containerId_, netName);
    if (!ip) {
        throw std::runtime_error("Container has no IP on network " +
                                  netName);
    }

    // debugpy et al. run with `--wait-for-client` and treat the FIRST TCP
    // connection as the debug client, so this retries the real session
    // socket directly rather than probing-then-closing (see
    // TcpConnect.hpp).
    fd_ = connectTcpWithRetry(*ip, kDapPort, 90);

    reader_ = std::thread(&DebugSession::readLoop, this);
}

} // namespace pastebin
